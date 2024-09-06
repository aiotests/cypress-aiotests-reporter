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
            "name": "Environment",
            "value": "Yes",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": 0,
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": "2024-08-29T04:38:36.437Z",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": "string",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": "string",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": "string",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": [
              "string"
            ],
            "ID": 10113
          },
          {
            "name": "Environment",
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": [
              "string",
              0,
              true
            ],
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": [
              "string"
            ],
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": 0,
            "ID": 10113
          },
          {
            "name": "Environment",
            "value": [
              0
            ],
            "ID": 10113
          },
          {
            "name": "Environment",
            "ID": 10113
          }
        ],
        "cycleName": "Cypress nightly runs ",
        "cycleKey": "NVTES-CY-65",
        "folder": ["Cloud","Smoke Test Nightly"],
        "tasks": ["NVTES-1"],
        "masterBuild": true
      },
      "addNewRun": false,
      "addAttachmentToFailedCases": true,
      "createNewRunForRetries": false,
      "addTestBodyToComments": true,
      "debugMode": true
    }
  }
});
