import ChistaModule from '../../../infrastructure/chista/ChistaModule.js';
import makeUseCaseRunner from './makeUseCaseRunner.js';
import runUseCase from './runUseCase.js';

const chista = new ChistaModule({});

chista.makeUseCaseRunner = makeUseCaseRunner;
chista.runUseCase = runUseCase;

export default chista;
