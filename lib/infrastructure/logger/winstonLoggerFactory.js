import winston from 'winston';
import clsFormatter from './formatters/winstonClsFormatter.js';
import redact from './formatters/winstonRedactFormatter.js';
import winstonPlainTextFormatter from './formatters/winstonPlainTextFormatter.js';
import winstonTransportFactory from './winstonTransportFactory.js';

function winstonLoggerFactory({
    isPlainText,
    level,
    pretty,
    silent,
    transports,
    clsConfig,
} = {}) {
    const { combine, timestamp, prettyPrint, json } = winston.format;
    const logsFormatter = isPlainText ? winstonPlainTextFormatter : json;

    const format = [
        timestamp({ format: 'YYYY-MM-DD HH:mm:ssZZ' }),
        ...(clsConfig && clsConfig.namespase
            ? [
                  clsFormatter({
                      cls: clsConfig.namespase,
                      contextKey: clsConfig.contextKey,
                  }),
              ]
            : []),
        redact(),
        logsFormatter(),
        ...(pretty ? [prettyPrint()] : []),
    ];

    return winston.createLogger({
        level,
        silent,
        levels: winston.config.syslog.levels,
        format: combine(...format),
        transports: transports
            ? transports.map((transport) => winstonTransportFactory(transport))
            : winstonTransportFactory({ type: 'console' }),
    });
}

export default winstonLoggerFactory;
