const { defineConfig } = require("cypress");
const { registerAIOTestsPlugin} = require("./src/index")

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerAIOTestsPlugin(on,config);
    },
    supportFile: false
  },
  env: {
    "aioTests": {
      "enableReporting": true,
      "cloud": {
        "apiKey": ""
      },
      "jiraProjectId": "NVTES",
      "cycleDetails": {
        "createNewCycle": false,
        "customFields": [
          {
            "name": "Cycle Approved",
            "value": "Yes",
            "ID": 10113
          },
          {
            "name": "Count",
            "value": 0,
            "ID": 10113
          },
          {
            "name": "Reviewed Date",
            "value": "2024-08-29T04:38:36.437Z",
            "ID": 10113
          },
          {
            "name": "Notes",
            "value": "string",
            "ID": 10113
          },
          {
            "name": "Co-owners",
            "value": [
              "912024:7459a222-3be8-4a60-bed9-32d561hfa57g",
              "512024:8459a222-3ce8-4a60-bed9-32d561hfa57f"
            ],
            "ID": 10113
          }
        ],
        "cycleName": "Cypress nightly runs ",
        "cycleKey": "NVTES-CY-65",
        "folder": ["Cloud","Smoke Test Nightly"],
        "tasks": ["NVTES-1"],
        "masterBuild": true
      },
      "runDetails": {
        "customFieldValueToUpdate": [
          {
            "customFieldUpdateOperationType": "ADD_TO_EXISTING",
            "customValue": {
              "name": "Browser Type",
              "value": [
                {
                  "ID": 1212,
                  "value": "Chrome"
                }
               ],
              "ID": 10113
            }
          }
        ],
        "testRunStatus": {
          "name": "Passed",
          "ID": 1
        },
        "effort": 6000,
        "isAutomated": true,
        "jiraDefectsUpdate": {
          "jiraDefectIDs": [
            0
          ],
          "jiraBulkListOperationType": "ADD_TO_EXISTING"
        }
      },
      "addNewRun": false,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true,
      "debugMode": true
    }
  }
});
