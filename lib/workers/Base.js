import { logger } from './../infrastructure/logger/logger.js';

import {
    SafeException,
    WarnException
} from './exceptions.js';

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

    // queues(name) {
    //     const queuesList = queues();

    //     if (!name) {
    //         return queuesList;
    //     }

    //     let queue = null;

    //     if (name) {
    //         queue = queuesList[name] || queuesList[`${name}Queue`];
    //     }

    //     if (!queue) {
    //         queuesList[name] = createDynamicQueue(name);

    //         queue = queuesList[name];
    //     }

    //     return queue;
    // }

    // job() {
    //     return this.#job;
    // }

    // jobId() {
    //     return this.#job ? this.#job.id : null;
    // }

    // async removeJob(queue = null, jobId = null) {
    //     const targetJob = queue && jobId
    //         ? await this.queues(queue).getJob(jobId)
    //         : this.job();

    //     if (!targetJob) {
    //         return;
    //     }

    //     const state = await targetJob.getState();

    //     if (state === STATE_ACTIVE) {
    //         await targetJob.moveToCompleted();
    //     }

    //     await targetJob.remove();
    // }

    // async runJob(queue, data, options = {}) {
    //     const jobId = this.jobId();

    //     await this.removeJob(queue, jobId);

    //     return this.queues(queue).add(data, { jobId, ...options });
    // }

    // progress() {
    //     return this.#job ? this.#job.progress(...arguments) : null;
    // }

    async process(data) {
        try {
            // this.info('Start');

            const result = await this.execute(data);

            // this.info('Done');

            // await this.progress(PROGRESS_DONE);

            return result;
        } catch (error) {
            if (error instanceof SafeException) {
                this.info(error.message);

                throw error;
            }

            if (error instanceof WarnException) {
                this.warning(error.message);

                throw error;
            }

            try {
                this.emerg({ error: error.stack, payload: data.payload });
            } catch (e) {
                console.log(e);
            }

            throw error;
        }
    }
}
