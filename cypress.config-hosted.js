const { defineConfig } = require("cypress");
const { registerAIOTestsPlugin } = require("./src/index")

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerAIOTestsPlugin(on,config);
    },
  },
  env: {
    "aioTests": {
      "enableReporting": true,
      "hosted" : {
        "jiraUrl": "https://jira.aiojiraapps.com",
        "jiraPAT": "",
        "jiraUsername": "",
        "jiraPassword": ""
      },
      "jiraProjectId": "NVTES",
      "cycleDetails": {
        "createNewCycle": false,
        "cycleName": "Cypress nightly runs ",
        "cycleKey": "NVTES-CY-64",
        "folder": ["Cloud","Smoke Test Nightly"],
        "tasks": ["NVTES-1"],
      },
      "addNewRun": false,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true,
      "parallelBuild":{
        "masterBuild": true,
        "waitForSeconds": 10
      }
    }
  }
});
