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
        "cycleName": "Cypress nightly runs 4",
        "cycleKey": "NVTES-CY-65",
        "folder": ["Cloud","Smoke Test Nightly"],
        "tasks": ["NVTES-1"],
      },
      "addNewRun": false,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true,
      "debugMode": true,
      "parallelBuild":{
        "masterBuild": true,
        "waitForSeconds": 10
      }
    }
  }
});
