import ChistaModule from 'chista';
import * as chistaUtils from './utils/chistaUtils.js';
import winstonLoggerFactory from '../../infrastructure/logger/winstonLoggerFactory.js';

const chista = new ChistaModule.default({
    defaultLogger: winstonLoggerFactory(),
});

chista.makeUseCaseRunner = chistaUtils.makeUseCaseRunner;
chista.runUseCase = chistaUtils.runUseCase;

export default chista;
