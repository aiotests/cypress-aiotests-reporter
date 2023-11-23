const ansis = require('ansis');

const AioTestsLogger = {
    log: (text) => {
        console.log(text);
    },
    error: (text, addReporter) => {
        if(addReporter) console.log(ansis.hex('#0094a6').underline.bold('AIO Tests Reporter :'));
        console.error( ' - ' + ansis.red(text));
    },
    logStartEnd: (text) => {
        const repeatStr = "*".repeat(15);
        console.log(ansis.hex('#0094a6').bold(`${repeatStr} AIO Tests Reporter : ${text}  ${repeatStr}`  ));
    }
}

module.exports = AioTestsLogger;
