import winston from 'winston';
// import redactSecrets    from 'redact-secrets';
import DailyRotateFile from 'winston-daily-rotate-file';
import clsFormatter    from './WinstonClsFormatter.js';
import redact          from './WinstonRedactFormatter.js';
import Mail            from './WinstonMail.js';

// const redact  = redactSecrets('[REDACTED]');
const loggers = {};

export function logger(name) {
    return loggers[name || 'default'] || loggers.default;
}

function plainTextFormat() {
    return winston.format.printf(params => {
        const {
            timestamp,
            traceID,
            level,
            message
        } = params;

        return `${timestamp} ${level}: ${traceID ? `traceID: ${traceID}` : ''} | ${message}`;
    });
}

export function initLogger(configs = [], cls = null) {
    const { combine, timestamp, prettyPrint, json } = winston.format;

    for (const config of configs) {
        const logsFormatter = config.isPlainText === '1' ? plainTextFormat : json;

        const { level, transports, pretty } = config;
        const format = [
            timestamp({ format: 'YYYY-MM-DD HH:mm:ssZZ' }),
            ...(cls && cls.namespase ? [ clsFormatter({
                cls        : cls.namespase,
                contextKey : cls.contextKey
            }) ] : []),
            redact(),
            logsFormatter()
        ];

        if (pretty) {
            format.push(prettyPrint());
        }

        const loggerInstance = winston.createLogger({
            level,
            levels     : winston.config.syslog.levels,
            format     : combine(...format),
            transports : transports.map(transport => winstonTransport(transport))
        });

        loggers[config.name] = loggerInstance;
    }

    loggers.default = winston.createLogger({
        level  : 'error',
        levels : winston.config.syslog.levels,
        format : combine(...[
            timestamp({ format: 'YYYY-MM-DD HH:mm:ssZZ' }),
            ...(cls ? [ clsFormatter({ cls }) ] : []),
            // winston.format(info => redact.map(info))(),
            json()
        ]),
        transports : [
            // eslint-disable-next-line more/no-hardcoded-configuration-data
            winstonTransport({ type: 'file', level: 'error', filename: 'logs/default.log' }),
            winstonTransport({ type: 'console', level: 'error' }),
            winstonTransport({ type: 'console', level: 'info' })
        ]
    });

    return loggers;
}

function winstonTransport(transport = {}) {
    const { colorize, prettyPrint, combine } = winston.format;
    const { Console, File }  = winston.transports;

    const format = [];

    if (transport.pretty) {
        format.push(prettyPrint());
    }

    switch (transport.type) {
        case 'console':
            return new Console({ level: transport.level || 'info', format: combine(...format, colorize({ all: true })) });
        case 'file':
            return new File({
                filename : transport.filename || 'logs/general.log',
                level    : transport.level || 'info',
                maxsize  : '500m'
            });
        case 'daily-file':
            return new DailyRotateFile({
                filename      : transport.filename,
                datePattern   : 'DD-MM-YYYY',
                zippedArchive : true,
                maxSize       : '500m',
                maxFiles      : transport.maxFiles ? transport.maxFiles : '100d',
                format        : format.length ? combine(...format) : null
            });
        case 'mail':
            return new Mail({
                ...transport,
                format : format.length ? combine(...format) : null
            });
        default:
            // eslint-disable-next-line more/no-hardcoded-configuration-data
            return new File({ filename: 'logs/general.log', level: transport.level || 'info' });
            // return new Console();
    }
}

