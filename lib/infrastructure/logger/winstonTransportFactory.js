import winston from 'winston';

function winstonTransportFactory(transport) {
    const { colorize, prettyPrint, combine } = winston.format;
    const { Console } = winston.transports;

    const format = [];

    if (transport.pretty) {
        format.push(prettyPrint());
    }

    return new Console({
        ...(transport.level && { level: transport.level }),
        format: combine(...format, colorize({ all: true })),
    });
}

export default winstonTransportFactory;
