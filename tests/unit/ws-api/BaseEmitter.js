// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BaseEmitter from '../../../lib/api/ws-api/emitters/BaseEmitter.js';
import '../../../lib/api/ws-api/emitters/index.js';

let sandbox;

let config = {};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.amqpClientStub = {};

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.io = {};

    t.context.baseEmitter = new BaseEmitter({
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        io: t.context.io,
        config,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('run calls logger', async (t) => {
    const { baseEmitter, loggerStub } = t.context;

    baseEmitter.run();

    sinon.assert.calledOnce(loggerStub.info);

    t.pass();
});
