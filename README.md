[![CI](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml/badge.svg)](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml)

# AIO Tests for Jira Cypress Reporter 
AIO Tests for Jira is a Jira-native test management app covering the entire QA lifecycle with Test Cases, Cycles, Reports, Automation, Dashboards, providing a one stop shop for all your testing needs.  

With it's Cypress reporter, AIO Tests simplifies reporting of results from the automated Cypress tests to AIO Tests for Jira.

# How does the AIO Tests Reporter work
  By hooking into Cypress events, the AIO Tests Reporter reports results in the ` after:spec ` event, after every spec run finishes.
  <br>The reporter can create a new cycle for the executions or reuse existing cycles, based on the configuration done in cyress.json.  <br>It can also upload attachments for failed executions. <br> **Retries** can either be reported as new runs or used to update the existing run.<br>
  
> [!NOTE]
> Please note that with Cypress 13, Cypress has made breaking changes to its module API which used to expose data on results of executions.
> Due to this change, AIO Tests reporter can no longer send body information and retry durations to AIO Tests.
> If you would like to have this feature, please bump up the request @ [Cypress 13 Module API bug](https://github.com/cypress-io/cypress/issues/27732)
# How to get started?
```
npm install cypress-aiotests-reporter
```

# Use
### Mapping automated Cypress tests to AIO Tests
The AIO Tests Case key can be added to the ` describe ` and ` it ` function descriptions.  <br> If there are multiple case keys in a single description, then the result of one test will be updated to multiple cases.

> &#10002; **Please note that the case key can appear anywhere in the description**

1. Mapping single case

```describe('example to-do app', () => {
  beforeEach(() => {    ..  })

  it('displays two todo items by default (NVTES-TC-72)', () => {
    cy.get('.todo-list li').should('have.length', 2)
    cy.get('.todo-list li').first().should('have.text', 'Pay electric bill')
    cy.get('.todo-list li').last().should('have.text', 'Walk the dog')
  })
  ```
  
2. Mapping to multiple cases

```describe('example to-do app', () => {
  beforeEach(() => {    ..  })

  it('NVTES-TC-72, NVTES-TC-73 : displays two todo items by default', () => {
    cy.get('.todo-list li').should('have.length', 2)
    cy.get('.todo-list li').first().should('have.text', 'Pay electric bill')
    cy.get('.todo-list li').last().should('have.text', 'Walk the dog')
  })
  ```

### Setup
1. Versions before Cypress 10
Register the plugin to the Cypress plugins file as below:

```
// cypress/plugins/index.js
const { registerAIOTestsPlugin } = require('cypress-aiotests-reporter/src')

module.exports = (on, config) => {
  registerAIOTestsPlugin(on,config);
}
```
2. Cypress 10 and beyond
In Cypress 10, the pluginsFile option was removed. This option was replaced with the new setupNodeEvents().  So, the plugin registration has to happen as below in the cypress.config.js

```
// cypress.config.js
const { defineConfig } = require("cypress");
const { registerAIOTestsPlugin } = require('cypress-aiotests-reporter/src')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerAIOTestsPlugin(on,config);
      // implement node event listeners here
    },
  },
 }
```
Please note that due to a change in v13, screenshots can no longer be uploaded using the plugin.
### Configure

The AIO Tests Reporter config needs to be set in the env property of cypress.json.  Or it can be programmatically modified in your [plugins/index.js](https://docs.cypress.io/guides/guides/environment-variables#Option-5-Plugins)

For Cypress 10, cypress.json configuration file is no longer supported. Replace this configuration file with a cypress.config.js, cypress.config.ts, cypress.config.cjs or cypress.config.mjs file.

Depending on the Jira hosting, the authentication information needs to be provided as below.

#### Cloud

For Jira Cloud (eg. https://yourco.atlassian.net/..), the ` "cloud" ` property needs to be set in the ` env.aioTests ` config for authentication.

1. **Local runs** : The [API Key generated from AIO Tests](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/484048912/Access+Token), needs to be set as "apiKey" value.
2. **CI/CD**: For CI runs, you can set the ` AIO_API_KEY ` environment variable to pass it externally as a SECRET.


```
// cypress.json (for Cypress versions < 10) or cypress.config.js (Cypress 10 and above)
{
  "env": {
    "aioTests": {
      "enableReporting": true,
      "cloud": {
        "apiKey": "<your API KEY>"
      },
      "jiraProjectId": "SCRUM",
      "cycleDetails": {
        "createNewCycle": true, //possible values "true","false","CREATE_IF_ABSENT", true, false
        "cycleName": "Cypress first run from plugin",
        "cycleKey": "NVTES-CY-2",
        "folder": ["Cloud","Smoke Test Nightly"],
        "tasks": ["SCRUM-1","SCRUM-2],
        "customFields": [
          {
            "name": "Reviewed? [Boolean CF]",
            "value": "Yes",
          },
          {
            "name": "Set (Single Select CF)", 
            "value": {"value":"P1"}
          },
          {
            "name": "Teams (Multi Select CF)", 
            "value": [{"value":"TeamAlpha"},{"value":"Zeta"}]
          },
          {
            "name": "NumberCF", "value": 0
          },
          {
            "name": "TextValue CF", "value": "This can be a long note",
          },
          {
            "name": "Reviewed Date", "value": "2024-08-29T04:38:36.437Z",
          },
          {
            "name": "SME [User CF]", "value": "<accountid of user>"
          }
        ],
      },
       "runDetails": {
        "customFieldsToUpdate": [
          {
            "operationType": "ADD_TO_EXISTING",
            "name": "StepOwner",
            "value": [{"value": "Val2"},{"value": "Val1"}]
          },
          {
            "name": "Env", "value": {"value":"UAT"}
          }
        ]
      },
      "addNewRun": true,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": true,
      "addTestBodyToComments": true,
      "debugMode": false,
      "parallelBuild":{ //optional
        "masterBuild": true,
        "waitForSeconds": 10 //defaults to 2 seconds
      }
    }
  }
}
```

#### Server

For Jira Hosted or DataCenter versions, the ` "hosted" ` property needs to be set in the ` env.aioTests ` for authentication.  
The ` "jiraUrl" ` needs to be specified with the base url of the hosted Jira instance.

Authentication is supported either by providing Jira username and password or by using the Jira PAT.  More information can be found on Server Authentication [here](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/1499594753/Rest+API+Authentication#[hardBreak]Server-/-Data-Centre)

1. **Local runs** : For local runs, either ` "jiraUsername" + "jiraPassword" ` can be set or one can simply set the ` "jiraPAT" ` value.
2. **CI/CD**: For CI runs, you can set the ` JIRA_USERNAME and JIRA_PASSWORD ` or ` JIRA_PAT `environment variable to pass it externally as a SECRET.
```
// cypress.json (for Cypress versions < 10) or cypress.config.js (Cypress 10 and above)
{
  "env": {
    "aioTests": {
      "enableReporting": true,
      "hosted" : {
        "jiraUrl": "https://jira.yourco.com",
        "jiraPAT": "PAT from Jira Tokens | JIRA_PAT as environment variable",
        "jiraUsername": "Jira Username. If PAT is specified, then username is not required",
        "jiraPassword": "Jira password, required if authentication is through username/password"
      },
      "jiraProjectId": "SERV",
      "cycleDetails": {
        "createNewCycle": true, //possible values "true","false","CREATE_IF_ABSENT", true, false
        "cycleName": "Cypress Nightly Run ",
        "cycleKey": "SERV-CY-2",
        "folder": ["Server","Smoke Test Nightly"],
        "tasks": ["SERV-1","SERV-2],
        "customFields": [
          {
            "name": "Reviewed? [Boolean CF]",
            "value": "Yes",
          },
          {
            "name": "Set (Single Select CF)", 
            "value": {"value":"P1"}
          },
          {
            "name": "Teams (Multi Select CF)", 
            "value": [{"value":"TeamAlpha"},{"value":"Zeta"}]
          },
          {
            "name": "NumberCF", "value": 0
          },
          {
            "name": "TextValue CF", "value": "This can be a long note",
          },
          {
            "name": "Reviewed Date", "value": "2024-08-29T04:38:36.437Z",
          },
          {
            "name": "SME [User CF]", "value": "<accountid of user>"
          }
        ],
      },
      "runDetails": {
        "customFieldsToUpdate": [
          {
            "operationType": "ADD_TO_EXISTING",
            "name": "StepOwner",
            "value": [{"value": "Val2"},{"value": "Val1"}]
          },
          {
            "name": "Env", "value": {"value":"UAT"}
          }
        ]
      },
      "addNewRun": true,
      "addAttachmentToFailedCases": false,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true,
      "debugMode": false,
      "parallelBuild":{ //optional
        "masterBuild": true,
        "waitForSeconds": 10 //defaults to 2 seconds
      }
    }
  }
}

```

#### Configurable values

| Value                              | Description                                                                                              |
|------------------------------------|----------------------------------------------------------------------------------------------------------|
| enableReporting                    | Set to true to make the current run update results to AIO Tests.  Default false.                         |
| jiraProjectId                      | Jira Project key to update results to                                                                    |
| cycleDetails.createNewCycle        | Options: [true, false, "CREATE_IF_ABSENT"]. Set to true to create a new cycle for run being reported.    |
| cycleDetails.cycleName             | Works if createNewCycle is true, sets the cycle name of cycle getting created                            |
| cycleDetails.cycleKey              | AIO Tests cycle key that should be updated.  Used if createNewCycle is false                             |
| cycleDetails.folder                | Folder hierarchy, where first item in array is parent folder and so on eg.["Parent","Child"]             |
| cycleDetails.tasks                 | List of Jira Issue Keys to attach as Tasks to created cycle, impacts only when creating new cycle        |
| cycleDetails.customFields          | List of custom fields that need to be set while creating cycle.  Options shown in example.               |
| addNewRun                          | Create a new run or update an existing run in the cycle                                                  |
| addAttachmentToFailedCases         | Set to true to attach screenshots, if available, for failed cases                                        |
| createNewRunForRetries             | Set to true if each retry should create a new run                                                        |
| addTestBodyToComments              | Set to true test script body should be added as a comment in a failed case. **Doesn't work above v12.x** |
| runDetails.customFieldsToUpdate    | List of run level custom fields.  Options in example above.                                              |
| customFieldsToUpdate.operationType | Options:  ADD_TO_EXISTING, REPLACE_EXISTING, DELETE_EXISTING                                             |
| debugMode                          | Default false. Set to true to increase verbosity of logs while debugging an issue                        |
| parallelBuild.masterBuild          | Optional. Default true. See below for details on parallelBuild                                           |
| parallelBuild.waitForSeconds       | Optional. Default 2 seconds. See below for details on parallelBuild                                      |

#### Create New Cycle options

- createNewCycle = true or "true", uses the **cycleName** and cycleDetails value to generate new cycle
- createNewCycle = false or "false", uses the **cycleKey** value to find an existing cycle and updates the cycle.  If cycle is not found, an error is thrown
- createNewCycle = "CREATE_IF_ABSENT" uses the **cycleName** to search for an existing cycle with an exact match.  If cycle is found, then the cycle is updated.
If it is not found, then a new cycle is created using **cycleName** and **cycleDetails**

#### Parallel builds

If multiple builds are being triggered in parallel, the parallelBuild setting can be used to specify the masterBuild.  
One of the parallel builds can be configured to set **masterBuild as true**.  This build should have createNewCycle either set as true or CREATE_IF_ABSENT.  
The other builds running in parallel can have masterBuild set to false, which would imply, they would wait for the masterBuild to run the cycle creation code, waiting for
**waitForSeconds** (defaults to 2 seconds), before trying to find the cycle.

If multiple builds are not being run in parallel, the parallelBuild value can be ignored.

# Logging

AIO Tests Reporter logs can be seen in the run logs as below for successful updates

![image](https://user-images.githubusercontent.com/76047755/143541114-d487efd9-2532-48fa-9a66-29c7db8d70d1.png)

Errors received while updating will appear in a similar way

![image](https://user-images.githubusercontent.com/76047755/143541233-94ae0f16-e40a-4f63-9989-0c372e2414e7.png)

To troubleshoot an issue, debugMode can be set to true in config, to increase logging verbosity and to see detailed response errors

# Queries/Suggestions?

For any queries, suggestions or issues, please feel free to reach out @ help@aioreports.com

[AIO Tests Overview](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/348619753/AIO+Tests+Overview)

[AIO Tests Automation](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/390332530/Test+Automation)

