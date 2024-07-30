const ansis = require('ansis');

const AioTestsLogger = {
    debugMode: false,
    setDebugMode: (_debugMode) => {
        this.debugMode = _debugMode;
    },
    log: (text) => {
        console.log((this.debugMode? new Date().toLocaleTimeString() + " : " :"") + text);
    },
    error: (text, addReporter) => {
        if(addReporter) console.log(ansis.hex('#0094a6').underline.bold('AIO Tests Reporter :'));
        console.error( ' - ' + ansis.red((this.debugMode? new Date().toLocaleTimeString() + " : " :"") + text));
    },
    errorObj: (text, addReporter) => {
        if(addReporter) console.log(ansis.hex('#0094a6').underline.bold('AIO Tests Reporter :'));
        console.error(text);
    },
    logStartEnd: (text) => {
        const repeatStr = "*".repeat(15);
        console.log(ansis.hex('#0094a6').bold(`${repeatStr} AIO Tests Reporter : ${text}  ${repeatStr}`  ));
    },
    debug: (text) => {
        if(this.debugMode) {
            console.log((this.debugMode? new Date().toLocaleTimeString() + " : " :"") + text);
        }
    }
}

module.exports = AioTestsLogger;
