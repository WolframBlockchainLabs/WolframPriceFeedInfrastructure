import chista from '../chista.js';
import Exception from '../../../domain-model/exceptions/Exception.js';

export async function runUseCase(
    useCaseClass,
    { context = {}, params = {}, logger = chista.defaultLogger },
) {
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

export function makeUseCaseRunner(
    useCaseClass,
    paramsBuilder = chista.defaultParamsBuilder,
    contextBuilder = defaultContextBuilder,
    logger = chista.defaultLogger,
    render = renderPromiseAsJson,
) {
    return async function useCaseRunner(req, res, next) {
        const resultPromise = runUseCase(useCaseClass, {
            logger,
            params: paramsBuilder(req, res),
            context: contextBuilder(req, res),
        });

        return render(req, res, resultPromise, next, logger);
    };
}

export async function renderPromiseAsJson(
    req,
    res,
    promise,
    next,
    logger = chista.defaultLogger,
) {
    try {
        const data = await promise;

        data.status = 1;

        return res.send(data);
    } catch (error) {
        if (error instanceof Exception) {
            res.send({
                status: 0,
                error: error.toHash(),
            });
        } else {
            logger.emerg({
                REQUEST_URL: req.url,
                REQUEST_PARAMS: req.params,
                REQUEST_BODY: req.body,
                ERROR_STACK: error.stack,
            });

            res.send({
                status: 0,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Please, contact your system administartor!',
                },
            });
        }
    }
}

function defaultContextBuilder(req) {
    let context = req?.session?.context || null;

    if (!context && (req.useragent || req.clientIp)) {
        const ip = req.clientIp.startsWith('::ffff:')
            ? req.clientIp.slice(7)
            : req.clientIp;

        context = {
            useragent: { ...req.useragent, ip },
        };
    }

    if (!context) {
        context = {};
    }

    return cloneDeep(context);
}

function cloneDeep(data) {
    return JSON.parse(JSON.stringify(data));
}
