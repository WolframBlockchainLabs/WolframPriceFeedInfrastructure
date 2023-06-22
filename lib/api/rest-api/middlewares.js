/* eslint-disable no-unused-vars */
import cors from 'cors';
import express from 'express';
import * as uuid from 'uuid';
import multer from 'multer';
import useragent from 'express-useragent';
import requestIp from 'request-ip';
import Sequelize from 'sequelize';
import promBundle from 'express-prom-bundle';
import clsNamespace from '../../clsNamespace.js';
import config from './../../config.cjs';
import winstonLoggerFactory from '../../infrastructure/logger/winstonLoggerFactory.js';

const logger = winstonLoggerFactory();

export default {
    clsMiddleware: (req, res, next) => {
        // req and res are event emitters. We want to access CLS context inside of their event callbacks
        clsNamespace.bind(req);
        clsNamespace.bind(res);

        const traceID = uuid.v4();

        clsNamespace.run(() => {
            clsNamespace.set('traceID', traceID);

            logger.info({
                // url    : req.url,
                middleware: 'cls',
                pathname: req._parsedUrl.pathname,
                method: req.method,
                // body   : inspect(req.body, { showHidden: false, depth: null })
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
    fileUpload: () => {
        const FILE_LIMIT = 26214400; // 25Mb

        return multer({
            dest: 'uploads/',
            // storage : multer.memoryStorage(),
            limits: { fieldSize: FILE_LIMIT },
        });
    },
    // busboy        : busboy(),
    sequelizeLang: (req, res, next) => {
        const supportedLangs = config.langs.list;
        const defaultLang = config.langs.default;
        const requestedLang = req.get('Accept-Language') || defaultLang;
        const lang = supportedLangs.includes(requestedLang.toLowerCase())
            ? requestedLang
            : defaultLang;

        if (!Sequelize._cls) {
            return next();
        }

        Sequelize._cls.run(() => {
            Sequelize._cls.set('lang', lang);

            next();
        });
    },
    detectDevice: useragent.express(),
    detectIp: requestIp.mw(),
    metrics: promBundle({
        includeMethod: true,
        includePath: true,
    }),
};
