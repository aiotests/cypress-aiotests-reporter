const axios = require('axios');
const aioLogger = require('./aio-tests-logger');
const FormData = require('form-data');
const fs = require('fs');
const apiTimeout = 10000;
const rateLimitWaitTime = 60*1000;
let aioAPIClient = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function initAPIClient(aioConfig) {
    if(aioConfig.cloud || process.env.AIO_API_KEY) {
        if(!aioConfig.cloud.apiKey && !process.env.AIO_API_KEY) {
            aioLogger.error("Cloud hosting config does not specify apiKey.  Please add \"cloud\":{\"apiKey\":\"authtoken\"}")
        } else {
            let apiKey = process.env.AIO_API_KEY?process.env.AIO_API_KEY:  aioConfig.cloud.apiKey;
            aioAPIClient = axios.create({
                baseURL: 'https://tcms.aioreports.com/aio-tcms/api/v1',
                timeout: apiTimeout,
                headers: {'Authorization': `AioAuth ${apiKey}`}
            });
        }
        return;
    } else if(aioConfig.hosted) {
        if(!!!aioConfig.hosted.jiraUrl) {
            aioLogger.error("Server hosting config does not specify jiraUrl.  Please add \"server\":{\"jiraUrl\":\"https://companyhostedjira.com/jira\"}")
        } else {
            aioAPIClient = axios.create({
                baseURL: aioConfig.hosted.jiraUrl + '/rest/aio-tcms-api/1.0',
                timeout: apiTimeout
            });
            if(aioConfig.hosted.jiraUsername || process.env.JIRA_USERNAME) {
                let jUsername = process.env.JIRA_USERNAME ? process.env.JIRA_USERNAME : aioConfig.hosted.jiraUsername;
                let jPassword = process.env.JIRA_PASSWORD ? process.env.JIRA_PASSWORD : aioConfig.hosted.jiraPassword;
                aioAPIClient.defaults.auth = {
                        username: jUsername,
                        password: jPassword
                }
            } else if(aioConfig.hosted.jiraPAT || process.env.JIRA_PAT) {
                let jPAT = process.env.JIRA_PAT ? process.env.JIRA_PAT : aioConfig.hosted.jiraPAT;
                aioAPIClient.defaults.headers.common['Authorization'] = `Bearer ${jPAT}`;
            } else {
                aioLogger.error("Server hosting config missing Jira username or PAT. " +
                    " Please set JIRA_USERNAME/JIRA_PASSWORD or JIRA_PAT as an environment variable or add \"hosted\":{\"jiraUrl\":\"yoururl\", \"jiraUsername\":\"un\", \"jiraPassword\":\"pwd\"}" +
                    " or \"hosted\":{\"jiraUrl\":\"yoururl\", \"jiraPAT\":\"pattoken\"} to config file");
                aioAPIClient = null;
            }
        }
        return;
    }
    aioLogger.error("No authentication information found.  Please set AIO_API_KEY/JIRA_USERNAME/JIRA_PAT as an environment variable or " +
        "add \"cloud\":{\"apiKey\":\"authtoken\"} or \"server\":{\"jiraServerUrl\":\"val\"}) to config");
}

let isAttachmentAPIAvailable = null;
const reportSpecResults = function(config, results) {
    if(!aioAPIClient) {
        initAPIClient(config);
        if(!aioAPIClient) {
            return Promise.resolve("Please specify authorization details");
        }
    }
    let testData = findResults(results);
    aioLogger.logStartEnd(" Initiating reporting results for " + results.spec.name);
    aioLogger.log("Number of case keys found " + testData.size);
    if(testData.size > 0) {
        let caseKeys = [...testData.keys()];
        let passedCaseKeys = [];
        let failedCaseKeys = [];
        caseKeys.forEach(ck => {
            let attemptData = testData.get(ck).attempts;
            if(attemptData.length == 1 && attemptData[0].state !== "failed") {
                passedCaseKeys.push(ck);
            } else {
                failedCaseKeys.push(ck);
            }
        })
        let bulkResponsePromise = Promise.resolve();
        if(passedCaseKeys.length > 0) {
            aioLogger.log("*".repeat(5) + " Updating passed cases " + "*".repeat(5)  );
            bulkResponsePromise = bulkUpdateResult(config, passedCaseKeys, testData);
        }
        return bulkResponsePromise.then(() => {
            if(failedCaseKeys.length > 0) {
                aioLogger.log("*".repeat(5) + " Updating failed cases " + "*".repeat(5)  );
            }
            return failedCaseKeys.reduce((r,caseKey) => {
                let attemptData = testData.get(caseKey).attempts;
                return r.then(() => reportAllAttempts(config, caseKey, attemptData, testData.get(caseKey), results.screenshots));
            }, Promise.resolve());
        })

    } else {
        aioLogger.log("No case keys found in specs");
        return Promise.resolve();
    }
}

function reportAllAttempts(config, key, attemptData, caseData, screenshots) {
    let idx = 0;
    return attemptData.reduce((resolve, attempt) => {
        return resolve.then(() => {
            return postResult(config, key, attempt, caseData.id + "_" + (idx++) ,screenshots,caseData.body)
            });
        }, Promise.resolve()).catch(e => {
            aioLogger.error(e);
    });
}

function postResult(aioConfig,caseKey, attemptData, id, screenshots, body, trialCounter = 0 ) {
    let data = {
        "testRunStatus": getAIORunStatus(attemptData.state),
        "effort": attemptData.wallClockDuration/1000,
        "isAutomated": true
    };
    if(attemptData.error) {
        data["comments"] = [attemptData.error.name + " : " + attemptData.error.message +  "\n" + attemptData.error.stack ];
        if(!!aioConfig.addTestBodyToComments) {
            data["comments"].push("Test Body : " + body);
        }
    }
    let createNewRun = id.endsWith("_0") ? !!aioConfig.addNewRun : !!aioConfig.createNewRunForRetries;
    return aioAPIClient
        .post(`/project/${aioConfig.jiraProjectId}/testcycle/${aioConfig.cycleDetails.cycleKeyToReportTo}/testcase/${caseKey}/testrun?createNewRun=${createNewRun}`, data)
        .then(function (response) {
            aioLogger.log(`Successfully reported ${caseKey} as ${data.testRunStatus} with runID ${response.data.ID}.`);
            let runId = response.data.ID;
            if(aioConfig.addAttachmentToFailedCases && data.testRunStatus.toLowerCase() === "failed" && (isAttachmentAPIAvailable || isAttachmentAPIAvailable == null)) {
                return uploadAttachments(aioConfig.jiraProjectId, aioConfig.cycleDetails.cycleKeyToReportTo, runId,id, screenshots)
            }
        })
        .catch(async err => {
            if (err.response.status == 429 && trialCounter < 3) {
                aioLogger.log("Reached AIO rate limits.  Pausing..")
                await sleep(rateLimitWaitTime);
                return postResult(aioConfig, caseKey, attemptData, id, screenshots, body, trialCounter++);
            } else if (err.response) {
                aioLogger.error("Error reporting " + caseKey + " : Status Code - " + err.response.status + " - " + err.response.data);
            }
        })
}

function bulkUpdateResult(aioConfig, passedCaseKeys, testData, trialCounter = 0 ) {

    let bulkRequestBody = {"testRuns": []};
    for (let passedCaseKey of passedCaseKeys) {
        let attemptData = testData.get(passedCaseKey).attempts[0];
        bulkRequestBody.testRuns.push( {
            "testCaseKey": passedCaseKey,
            "testRunStatus": getAIORunStatus(attemptData.state),
            "effort": attemptData.wallClockDuration/1000,
            "isAutomated": true
        });
    }

    return aioAPIClient
        .post(`/project/${aioConfig.jiraProjectId}/testcycle/${aioConfig.cycleDetails.cycleKeyToReportTo}/bulk/testrun/update?createNewRun=${!!aioConfig.addNewRun}`, bulkRequestBody)
        .then(function (response) {
            aioLogger.log(`Successfully reported  ${response.data.successCount} passed cases.`);
            if(response.data.errorCount > 0) {
                aioLogger.error("Failures in reporting passed cases");
                aioLogger.error("----------------------------");
                Object.keys(response.data.errors).forEach(k => {
                    aioLogger.error(k + " : " + response.data.errors[k].message);
                })
            }
        })
        .catch(async err => {
            if (err.response.status == 429 && trialCounter < 3) {
                aioLogger.log("Reached AIO rate limits.  Pausing..")
                await sleep(rateLimitWaitTime);
                return bulkUpdateResult(aioConfig, passedCaseKeys, testData, trialCounter++);
            }
            if (err.response) {
                aioLogger.error("Error in bulk cases reporting : Status Code - " + err.response.status + " - " + err.response.data);
            }
        })
}

function uploadAttachments(jiraProjectId, cyclekey,runId, id, resultScreenshots) {
    let screenshots =  resultScreenshots.filter(t => (t.testId + "_" + t.testAttemptIndex) === id);
    if(screenshots.length) {
        return screenshots.reduce((r,screenshot) => {
            return r.then(() => uploadScreenshot(screenshot, jiraProjectId, cyclekey, runId));
        }, Promise.resolve());
    } else {
        return Promise.resolve();
    }
}

function uploadScreenshot(s, jiraProjectId, cyclekey, runId, trialCounter = 0) {
    const form = new FormData();
    form.append('file', fs.createReadStream(s.path));
    return aioAPIClient.post(`/project/${jiraProjectId}/testcycle/${cyclekey}/testrun/${runId}/attachment`, form, {
        headers: form.getHeaders()
    }).then(() => {
        aioLogger.log("Screenshot uploaded " + s.path);
    }).catch(async error => {
        if (error.response.status == 429 && trialCounter < 3) {
            aioLogger.log("Reached AIO rate limits.  Pausing..")
            await sleep(rateLimitWaitTime)
            return uploadScreenshot(s, jiraProjectId, cyclekey, runId, trialCounter++);
        } else if (error.response.status === 404) {
            aioLogger.error("Attachment API is not supported in current API version and hence attachments could not be uploaded.  Please upgrade to latest version of AIO Tests.");
            isAttachmentAPIAvailable = false;
        } else {
            if (error.data) {
                aioLogger.error(error.data)
            }
        }
    });
}

function findResults(results) {
    let testData = new Map();
    let pattern = new RegExp("\\w+-TC-\\d+", "gi");
    if(results && results.tests) {
        results.tests.forEach(t => {
            let tcKeys = [];
            let allTitles = t.title.join();
            let match;
            do {
                match = pattern.exec(allTitles);
                if(match) {
                    tcKeys.push(match[0]);
                }
            } while(match != null);
            if(tcKeys.length) {
                tcKeys.forEach(tcKey => testData.set(tcKey, {attempts: t.attempts, id : t.testId, body: t.body}))
            }
        });
    }
    return testData;
}

function getOrCreateFolder(jiraProjectId, aioCycleConfig) {
    if(aioCycleConfig.folder && aioCycleConfig.folder.length > 0 && Array.isArray(aioCycleConfig.folder)) {
        let userFolderHierarchy = aioCycleConfig.folder.filter(f => f && !!f.trim());
        if(userFolderHierarchy.length > 0) {
            aioLogger.log("Creating or fetching folder " + userFolderHierarchy)
            return aioAPIClient.put("/project/" + jiraProjectId + "/testcycle/folder/hierarchy", {
                folderHierarchy: userFolderHierarchy
            })
        }
    }
    return Promise.resolve();
}

const getOrCreateCycle = (aioConfig) => {
    aioLogger.logStartEnd("Determining cycle to update");
    initAPIClient(aioConfig);
    if(!aioAPIClient) {
        return Promise.resolve("Please specify valid credentials to connect with AIO Tests.");
    }
    if(!aioConfig.cycleDetails) {
        aioLogger.error("Please specify cycleDetails in config.  eg. \"cycleDetails\": {\"cycleKey\":\"AT-CY-11\"}", true);
        return Promise.resolve();
    } else {
        let aioCycleConfig = aioConfig.cycleDetails;
        if(aioCycleConfig.createNewCycle) {
            let cycleTitle = aioCycleConfig.cycleName;
            if(!!!cycleTitle){
                return Promise.resolve("createNewCycle is true in config.  New cycle name is mandatory.", true)
            } else {
                aioLogger.log("Creating cycle : " + cycleTitle);
                let folderCreationPromise = getOrCreateFolder(aioConfig.jiraProjectId, aioCycleConfig);
                return folderCreationPromise.then((folderCreationResponse) => {
                    let createCycleBody = {
                        title: cycleTitle
                    }
                    if(folderCreationResponse) {
                        createCycleBody.folder = folderCreationResponse.data;
                    }
                    if(aioCycleConfig.tasks && aioCycleConfig.tasks.length > 0 && Array.isArray(aioCycleConfig.tasks)) {
                        let jiraTasks = aioCycleConfig.tasks.filter(f => f && !!f.trim());
                        if(jiraTasks.length > 0) {
                            createCycleBody.jiraTaskIDs = jiraTasks;
                        }
                    }
                    return aioAPIClient.post("/project/"+ aioConfig.jiraProjectId+"/testcycle/detail", createCycleBody)
                        .then(function (response) {
                            aioCycleConfig["cycleKeyToReportTo"] = response.data.key;
                            aioLogger.log("Cycle created successfully : " + aioCycleConfig.cycleKeyToReportTo )
                        })
                        .catch(function (error) {
                            if(error.response.status === 401 || error.response.status === 403) {
                                return Promise.resolve("Authorization error.  Please check credentials.")
                            } else {
                                return Promise.resolve(error.response.status + " : " + error.response.data);
                            }
                        });
                }).catch(() => {
                    return Promise.resolve("Error in fetching or creating cycle folder.  " +
                        "Please check format of folder, for eg. [\"Cloud\",\"Release1\"]");
                })
            }
        } else {
            if(!!!aioCycleConfig.cycleKey) {
                return Promise.resolve("createNewCycle is false in config.  Please specify a cycle key (eg. AT-CY-11) as \"cycleKey\":\"AT-CY=11\"", true);
            } else {
                aioCycleConfig["cycleKeyToReportTo"] = aioCycleConfig.cycleKey;
            }
            return Promise.resolve();
        }
    }

}

function getAIORunStatus(cypressStatusString) {
    switch(cypressStatusString) {
        case "failed":
            return "Failed";
        case "passed":
            return "Passed";
        default:
            return "Not Run";
    }
}





module.exports = { reportSpecResults, getOrCreateCycle }
