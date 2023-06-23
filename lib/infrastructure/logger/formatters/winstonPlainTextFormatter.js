import winston from 'winston';

function winstonPlainTextFormatter() {
    return winston.format.printf((params) => {
        const { timestamp, traceID, level, message } = params;

        return `${timestamp} ${level}: ${
            traceID ? `traceID: ${traceID}` : ''
        } | ${message}`;
    });
}

export default winstonPlainTextFormatter;
