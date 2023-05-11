import fs            from 'fs/promises';
import { Exception } from '../../../../packages.js';
import chista        from '../chista.js';

export async function runUseCase(useCaseClass, { context = {}, params = {}, logger = chista.defaultLogger }) {
    function logRequest(type, result, startTime) {
        logger(type, {
            useCase : useCaseClass.name,
            runtime : Date.now() - startTime,
            params,
            result
        });
    }

    const startTime = Date.now();

    try {
        const result = await new useCaseClass({ context }).run(params);

        logRequest('info', result, startTime);

        return result;
    } catch (error) {
        const type = error instanceof Exception ? 'info' : 'error';

        logRequest(type, error, startTime);

        throw error;
    }
}

export function makeUseCaseRunner(
    useCaseClass,
    paramsBuilder  = chista.defaultParamsBuilder,
    contextBuilder = defaultContextBuilder,
    logger         = chista.defaultLogger,
    render         = renderPromiseAsJson
) {
    return async function useCaseRunner(req, res, next) {
        const resultPromise = runUseCase(useCaseClass, {
            // TODO: change
            logger,
            params  : paramsBuilder(req, res),
            context : contextBuilder(req, res)
        });

        return render(req, res, resultPromise, next, logger);
    };
}

export async function renderPromiseAsJson(req, res, promise, next, logger = chista.defaultLogger) {
    try {
        const data = await promise;

        data.status = 1;

        return res.send(data);
    } catch (error) {
        /* istanbul ignore next */
        if (error instanceof Exception) {
            res.send({
                status : 0,
                error  : error.toHash()
            });
        } else {
            logger('fatal', {
                'REQUEST_URL'    : req.url,
                'REQUEST_PARAMS' : req.params,
                'REQUEST_BODY'   : req.body,
                'ERROR_STACK'    : error.stack
            });

            res.send({
                status : 0,
                error  : {
                    code    : 'SERVER_ERROR',
                    message : 'Please, contact your system administartor!'
                }
            });
        }
    } finally {
        await removeTempFiles(req, logger);
    }
}

function defaultContextBuilder(req) {
    let context = req?.session?.context || null;

    if (!context && (req.useragent || req.clientIp)) {
        const ip         = req.clientIp.startsWith('::ffff:')
            // eslint-disable-next-line no-magic-numbers
            ? req.clientIp.slice(7)
            : req.clientIp;

        context = {
            useragent : { ...req.useragent, ip }
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

async function removeTempFiles(req, logger) {
    try {
        if (req.files) {
            for (const { path } of req.files) {
                await fs.unlink(path);
            }
        }
    } catch (error) {
        logger('fatal', {
            'REQUEST_URL'    : req.url,
            'REQUEST_PARAMS' : req.params,
            'REQUEST_BODY'   : req.body,
            'ERROR_STACK'    : error.stack
        });
    }
}
