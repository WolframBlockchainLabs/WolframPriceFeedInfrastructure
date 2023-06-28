import crypto from 'crypto';

function initClsMiddleware(clsNamespace, logger) {
    return (req, res, next) => {
        // req and res are event emitters. We want to access CLS context inside of their event callbacks
        clsNamespace.bindEmitter(req);
        clsNamespace.bindEmitter(res);

        const traceID = crypto.randomBytes(8).toString('hex');

        clsNamespace.run(() => {
            clsNamespace.set('traceID', traceID);

            logger.info({
                middleware: 'cls',
                pathname: req._parsedUrl.pathname,
                method: req.method,
                body: req.body,
                query: req.query,
            });

            next();
        });
    };
}

export default initClsMiddleware;
