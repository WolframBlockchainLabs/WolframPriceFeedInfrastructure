import { logger } from './../infrastructure/logger/logger.js';


// const PROGRESS_DONE = 100;
const LOGGER_NAME = 'workers';

export default class Base {
    #job

    constructor(params = {}) {
        const { job } = params;

        this.#job = job;
    }

    info(data) {
        return this.log('info', data);
    }

    debug(data) {
        return this.log('debug', data);
    }

    crit(data) {
        return this.log('crit', data);
    }

    error(data) {
        return this.log('error', data);
    }

    warning(data) {
        return this.log('warning', data);
    }

    emerg(data) {
        return this.log('emerg', data);
    }

    log(level, data) {
        const log    = logger(LOGGER_NAME)[level];
        const print  = typeof data === 'string' ? { message: data } : data;
        const worker = this.constructor.name;
        // const jobId  = this.jobId();

        log({
            // jobId,
            worker,
            ...print
        });
    }

    logger() {
        return logger(LOGGER_NAME);
    }


    async process(data) {
        try {
            // this.info('Start');

            const result = await this.execute(data);

            // this.info('Done');

            // await this.progress(PROGRESS_DONE);

            return result;
        } catch (error) {
            try {
                this.emerg({ error: error.stack, payload: data.payload });
            } catch (e) {
                console.log(e);
            }

            throw error;
        }
    }
}
