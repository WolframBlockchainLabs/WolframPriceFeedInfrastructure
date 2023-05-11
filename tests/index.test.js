import test            from 'ava';
import AppTestProvider from './../lib/AppTestProvider.js';
import APIclient       from './APIclient.js';
import TestFactory     from './TestFactory.js';
import adminApiTests   from './api/admin/index.js';
import mainApiTests    from './api/main/index.js';
// import current         from './api/admin/seo/list.js';

const factory     = new TestFactory();

let tests = [
    ...adminApiTests,
    ...mainApiTests
    // ...current
];

if (tests.find(({ only }) => only)) {
    tests = tests.filter(({ only }) => only);
}

const server   = AppTestProvider.create().initApp();
const config   = server.config;
const userAPI  = new APIclient(config.sessions, factory, 'api/v1');
const adminAPI = new APIclient(config.sessions, factory, 'admin-api/v1');

test.before(async () => {
    await server.start();
});

for (const item of tests) {
    test.serial(item.label, async (t) => {
        const baseTestParams = {
            t, userAPI, adminAPI, factory, config
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

// async function runTestInTransaction(item, baseTestParams) {
//     await server.sequelize.transaction(async t1 => {
//         try {
//             global.testTransaction = t1;

//             await runTest(item, baseTestParams);
//         } catch (error) {
//             console.log(error);

//             throw error;
//         } finally {
//             global.testTransaction = null;
//             await t1.rollback();
//         }
//     });
// }

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
            const testResult = await item.test({ ...baseTestParams, ...prevResult }) || {};

            if (testResult) {
                prevResult = { ...prevResult, ...testResult };
            }
        } catch (e) {
            console.error(e);

            exception = e;
        }
    }

    if (item.after) {
        prevResult = await item.after({ ...baseTestParams, ...prevResult }) || {};
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
