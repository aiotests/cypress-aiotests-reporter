
const reporter = require('./aio-tests-log-results');
const aioLogger = require('./aio-tests-logger')

function getAIOConfig(config, reportError) {
    if(Object.keys(config).includes('env') && Object.keys(config.env).includes('aioTests') && !!config.env.aioTests.enableReporting) {
        if (!!!config.env.aioTests.jiraProjectId && !!reportError) {
            aioLogger.error("Jira Project Id is mandatory for AIO Tests Reporting.", true);
            return;
        }
        return config.env.aioTests;
    } else {
        if(!!reportError)
            aioLogger.error("AIO Tests reporting is not enabled.  Please set env:{aioTests:{enableReporting:true}}", true);
    }
}

const registerAIOTestsPlugin = async (on, config) => {
    on('before:run', async () => {
        let aioConfig = getAIOConfig(config, true);
        if (aioConfig) {
            try {
                const data = await reporter.getOrCreateCycle(aioConfig);
                if (aioConfig.cycleDetails.cycleKeyToReportTo) {
                    aioLogger.log("Reporting results to cycle : " + aioConfig.cycleDetails.cycleKeyToReportTo);
                } else {
                    aioLogger.error(data);
                }
            } catch (err) {
                aioLogger.error("An error occurred: " + err.message);
            }
        }
    });

    on('after:spec', (spec, results) => {
        let aioConfig = getAIOConfig(config);
        if(aioConfig && aioConfig.cycleDetails.cycleKeyToReportTo) {
            return reporter.reportSpecResults( aioConfig, results).then(() => {
                aioLogger.logStartEnd(" Reporting results completed for " + (!!spec? spec.name : ''));
            })
        }
    })
};

module.exports = { registerAIOTestsPlugin }
