const chalk = require('chalk');

const AioTestsLogger = {
    log: (text) => {
        console.log(text);
    },
    error: (text, addReporter) => {
        if(addReporter) console.log(chalk.hex('#0094a6').underline.bold('AIO Tests Reporter :'));
        console.error( ' - ' + chalk.red(text));
    },
    logStartEnd: (text) => {
        console.log( chalk.hex('#0094a6').bold("*".repeat(15) + '  AIO Tests Reporter :' + text + "  " + "*".repeat(15)));
    }
}

module.exports = AioTestsLogger;