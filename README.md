[![CI](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml/badge.svg)](https://github.com/aiotests/cypress-aiotests-reporter/actions/workflows/main.yml)

# AIO Tests for Jira Cypress Reporter 
AIO Tests for Jira is a Jira-native test management app covering the entire QA lifecycle with Test Cases, Cycles, Reports, Automation, Dashboards, providing a one stop shop for all your testing needs.  With it's Cypress reporter, AIO Tests simplifies reporting of results from the automated Cypress tests to AIO Tests for Jira.

# How to get started?
```
npm install cypress-aiotests-reporter
```

# Use
### Setup
Add to the Cypress plugins file

```
// cypress/plugins/index.js
const { registerAIOTestsPlugin } = require('cypress-aiotests-reporter/src')

module.exports = (on, config) => {
  registerAIOTestsPlugin(on,config);
}
```

### Configure

The AIO Tests Reporter works on the below environment config. 

#### Cloud

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
```
// cypress.json
{
  "env": {
    "aioTests": {
      "enableReporting": true,
      "hosted" : {
        "jiraUrl": "https://jira.yourco.com",
        "jiraPAT": "PAT from Jira Tokens",
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


