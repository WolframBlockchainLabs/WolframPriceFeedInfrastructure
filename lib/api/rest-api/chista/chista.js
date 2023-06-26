import ChistaModule from 'chista';
import makeUseCaseRunner from './makeUseCaseRunner.js';
import runUseCase from './runUseCase.js';

const chista = new ChistaModule.default({});

chista.makeUseCaseRunner = makeUseCaseRunner;
chista.runUseCase = runUseCase;

export default chista;
