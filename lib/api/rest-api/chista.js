import ChistaModule from 'chista';
import { logger } from './../../infrastructure/logger/logger.js';
import * as chistaUtils from './utils/chistaUtils.js';

const LOGGER = 'api';

function getLogger() {
    return (type, info) => {
        const log = {
            fatal: (data) => logger(LOGGER).emerg(data),
            error: (data) => logger(LOGGER).error(data),
            warn: (data) => logger(LOGGER).warning(data),
            info: (data) => logger(LOGGER).info(data),
            debug: (data) => logger(LOGGER).debug(data),
            trace: (data) => logger(LOGGER).trace(data),
        };

        return log[type](info);
    };
}

const chista = new ChistaModule.default({
    defaultLogger: getLogger(),
});

chista.makeUseCaseRunner = chistaUtils.makeUseCaseRunner;
chista.runUseCase = chistaUtils.runUseCase;

export default chista;
