import cors from 'cors';
import express from 'express';
import * as uuid from 'uuid';
import promBundle from 'express-prom-bundle';
import clsNamespace from '../../clsNamespace.js';
import winstonLoggerFactory from '../../infrastructure/logger/winstonLoggerFactory.js';

const logger = winstonLoggerFactory();

export default {
    clsMiddleware: (req, res, next) => {
        // req and res are event emitters. We want to access CLS context inside of their event callbacks
        clsNamespace.bindEmitter(req);
        clsNamespace.bindEmitter(res);

        const traceID = uuid.v4();

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
    },
    json: express.json({
        limit: '20mb',
        verify: (req, res, buf) => {
            try {
                JSON.parse(buf);
            } catch (e) {
                res.send({
                    status: 0,
                    error: {
                        code: 'BROKEN_JSON',
                        message: 'Please, verify your json',
                    },
                });
                throw new Error('BROKEN_JSON');
            }
        },
    }),
    urlencoded: express.urlencoded({ extended: true }),
    cors: cors({ origin: true, credentials: true }),
    metrics: promBundle({
        includeMethod: true,
        includePath: true,
    }),
};
