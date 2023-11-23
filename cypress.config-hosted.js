const { defineConfig } = require("cypress");
const { registerAIOTestsPlugin } = require('../../src')

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
        "jiraUrl": "https://jira8.aioreports.com",
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
        "tasks": ["NVTES-1"]
      },
      "addNewRun": false,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true
    }
  }
});
