import chista from './chista.js';
import defaultContextBuilder from './defaultContextBuilder.js';
import renderPromiseAsJson from './renderers/renderPromiseAsJson.js';
import runUseCase from './runUseCase.js';

function makeUseCaseRunner(
    useCaseClass,
    paramsBuilder = chista.defaultParamsBuilder,
    contextBuilder = defaultContextBuilder,
    render = renderPromiseAsJson,
) {
    return async function useCaseRunner(req, res, next) {
        const promise = runUseCase(useCaseClass, {
            params: paramsBuilder(req, res),
            context: contextBuilder(req, res),
        });

        return render({ req, res, next, promise });
    };
}

export default makeUseCaseRunner;
