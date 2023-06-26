import chista from './chista.js';

async function runUseCase(useCaseClass, { context = {}, params = {} }) {
    const logger = chista.defaultLogger;
    const startTime = Date.now();

    try {
        const result = await new useCaseClass({ context }).run(params);

        logger.info({
            useCase: useCaseClass.name,
            runtime: Date.now() - startTime,
            params,
            result,
        });

        return result;
    } catch (error) {
        logger.error({
            useCase: useCaseClass.name,
            runtime: Date.now() - startTime,
            params,
            error,
        });

        throw error;
    }
}

export default runUseCase;
