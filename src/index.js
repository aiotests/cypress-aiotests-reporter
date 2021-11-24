
const reporter = require('./aio-tests-log-results');
const aioLogger = require('./aio-tests-logger')

function getAIOConfig(config, reportError) {
    if(Object.keys(config).includes('env') && Object.keys(config.env).includes('aioTests') && !!config.env.aioTests.enableReporting) {
        if (!!!config.env.aioTests.jiraProjectId && !!reportError) {
            aioLogger.error("Jira Project Id is mandatory for AIO Tests Reporting.", true)
            return;
        }
        return config.env.aioTests;
    } else {
        if(!!reportError)
            aioLogger.error("AIO Tests reporting is not enabled.  Please set env:{aioTests:{enableReporting:true}}", true)
        return;
    }
}

const registerAIOTestsPlugin = (on, config) => {
    // modify saved screenshots using
    // https://on.cypress.io/after-screenshot-api
    on('before:run', (details) => {
        let aioConfig = getAIOConfig(config, true);
        if(aioConfig) {
            return reporter.getOrCreateCycle(aioConfig).then(() => {
                aioLogger.log("Reporting results to cycle : " + aioConfig.cycleDetails.cycleKeyToReportTo);
            })
        }
    })

    on('after:spec', (spec, results) => {
        let aioConfig = getAIOConfig(config);
        if(aioConfig && aioConfig.cycleDetails.cycleKeyToReportTo) {
            return reporter.reportSpecResults( aioConfig, results).then(() => {
                aioLogger.logStartEnd(" Reporting results completed.")
            })
        }
    })
}

module.exports = { registerAIOTestsPlugin }