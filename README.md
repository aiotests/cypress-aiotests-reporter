[![CI](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml/badge.svg)](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml)

# AIO Tests for Jira Cypress Reporter 
AIO Tests for Jira is a Jira-native test management app covering the entire QA lifecycle with Test Cases, Cycles, Reports, Automation, Dashboards, providing a one stop shop for all your testing needs.  

With it's Cypress reporter, AIO Tests simplifies reporting of results from the automated Cypress tests to AIO Tests for Jira.

# How does the AIO Tests Reporter work
  By hooking into Cypress events, the AIO Tests Reporter reports results in the ` after:spec ` event, after every spec run finishes.
  <br>The reporter can create a new cycle for the executions or reuse existing cycles, based on the configuration done in cyress.json.  <br>It can also upload attachments for failed executions. <br> **Retries** can either be reported as new runs or used to update the existing run.

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
Register the plugin to the Cypress plugins file as below:

```
// cypress/plugins/index.js
const { registerAIOTestsPlugin } = require('cypress-aiotests-reporter/src')

module.exports = (on, config) => {
  registerAIOTestsPlugin(on,config);
}
```

### Configure

The AIO Tests Reporter config needs to be set in the env property of cypress.json.  Or it can be programmatically modified in your [plugins/index.js](https://docs.cypress.io/guides/guides/environment-variables#Option-5-Plugins)

Depending on the Jira hosting, the authentication information needs to be provided as below.

#### Cloud

For Jira Cloud (eg. https://yourco.atlassian.net/..), the ` "cloud" ` property needs to be set in the ` env.aioTests ` config for authentication.

1. **Local runs** : The [API Key generated from AIO Tests](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/484048912/Access+Token), needs to be set as "apiKey" value.
2. **CI/CD**: For CI runs, you can set the ` AIO_API_KEY ` environment variable to pass it externally as a SECRET.


```
// cypress.json
{
  "env": {
    "aioTests": {
      "enableReporting": true,
      "cloud": {
        "apiKey": "<your API KEY>"
      },
      "jiraProjectId": "SCRUM",
      "cycleDetails": {
        "createNewCycle": true,
        "cycleName": "Cypress first run from plugin",
        "cycleKey": "NVTES-CY-2"
      },
      "addNewRun": true,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": true
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
// cypress.json
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
        "createNewCycle": true,
        "cycleName": "Cypress Nightly Run ",
        "cycleKey": "SERV-CY-2"
      },
      "addNewRun": true,
      "addAttachmentToFailedCases": false,
      "createNewRunForRetries": false
    }
  }
}

```

#### Configurable values

| Value                          | Description   |
| -------------                  | ------------- |
| enableReporting                | Set to true to make the current run update results to AIO Tests.  Default false.  |
| jiraProjectId                  | Jira Project key to update results to  |
| cycleDetails.createNewCycle    | Set to true to create a new cycle for run being reported                       |
| cycleDetails.cycleName         | Works if createNewCycle is true, sets the cycle name of cycle getting created  |
| cycleDetails.cycleKey          | AIO Tests cycle key that should be updated.  Used if createNewCycle is false   |
| addNewRun                      | Create a new run or update an existing run in the cycle  |
| addAttachmentToFailedCases     | Set to true to attach screenshots, if available, for failed cases   |
| createNewRunForRetries         | Set to true if each retry should create a new run   |

# Queries/Suggestions?

For any queries, suggestions or issues, please feel free to reach out @ help@aioreports.com

[AIO Tests Overview](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/348619753/AIO+Tests+Overview)

[AIO Tests Automation](https://aioreports.atlassian.net/wiki/spaces/ATDoc/pages/390332530/Test+Automation)

