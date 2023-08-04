// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import AppTestProvider from './AppTestProvider.js';
import TestFactory from './TestFactory.js';
import APIclient from './APIclient.js';
import apiTests from './api/index.js';

const factory = new TestFactory();

let tests = [...apiTests];

if (tests.find(({ only }) => only)) {
    tests = tests.filter(({ only }) => only);
}

const server = new AppTestProvider();
const config = server.config;

const coreAPI = new APIclient(factory, 'api/v1');

test.before(async () => {
    try {
        await server.start();
    } catch (err) {
        console.log('AppTestProvider start error', err);
    }
});

for (const item of tests) {
    test.serial(item.label, async (t) => {
        const baseTestParams = {
            t,
            coreAPI,
            factory,
            config,
        };

        try {
            await runTest(item, baseTestParams);
        } catch (error) {
            if (!error.message || !error.message.match(/rollback/)) {
                throw error;
            }
        }
    });
}

async function runTest(item, baseTestParams) {
    let exception = null;

    let prevResult = {};

    if (item.before) {
        const result = await item.before({ ...baseTestParams, ...prevResult });

        prevResult = result;
    }

    prevResult = prevResult || {};

    if (item.test) {
        try {
            const testResult =
                (await item.test({ ...baseTestParams, ...prevResult })) || {};

            if (testResult) {
                prevResult = { ...prevResult, ...testResult };
            }
        } catch (e) {
            console.error(e);

            exception = e;
        }
    }

    if (item.after) {
        prevResult =
            (await item.after({ ...baseTestParams, ...prevResult })) || {};
    } else {
        await factory.cleanup();
    }

    if (exception) {
        throw exception;
    }
}

test.after(async () => {
    await server.shutdown();
});
