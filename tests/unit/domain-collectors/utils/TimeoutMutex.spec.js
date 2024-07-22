import TimeoutMutex from '#domain-collectors/utils/TimeoutMutex.js';
import MutexTimeoutException from '#domain-model/exceptions/collectors/MutexTimeoutException.js';

describe('[domain-model]: TimeoutMutex Tests Suite', () => {
    test('should create an instance with timeout and default error', () => {
        const timeout = 1000;
        const timeoutMutex = new TimeoutMutex(timeout);

        expect(timeoutMutex).toBeInstanceOf(TimeoutMutex);
        expect(timeoutMutex.timeout).toBe(timeout);
        expect(timeoutMutex.error).toBeInstanceOf(MutexTimeoutException);
    });

    test('should create an instance with timeout and custom error', () => {
        const timeout = 1000;
        const customError = new Error('Custom Error');
        const timeoutMutex = new TimeoutMutex(timeout, customError);

        expect(timeoutMutex).toBeInstanceOf(TimeoutMutex);
        expect(timeoutMutex.timeout).toBe(timeout);
        expect(timeoutMutex.error).toBe(customError);
    });

    test('should throw an error if timeout is not specified', () => {
        expect(() => new TimeoutMutex()).toThrow(
            '[TimeoutMutex]: timeout is not specified',
        );
    });

    test('should acquire and release the lock', async () => {
        const timeout = 1000;
        const timeoutMutex = new TimeoutMutex(timeout);

        const release = await timeoutMutex.acquire();
        expect(timeoutMutex.isLocked()).toBe(true);

        release();
        expect(timeoutMutex.isLocked()).toBe(false);
    });

    test('should throw MutexTimeoutException if the lock is not released in time', async () => {
        jest.useFakeTimers();
        const timeout = 100;
        const timeoutMutex = new TimeoutMutex(timeout);

        await timeoutMutex.acquire();
        expect(timeoutMutex.isLocked()).toBe(true);

        expect(() => jest.advanceTimersByTime(timeout)).toThrow(
            MutexTimeoutException,
        );
        expect(timeoutMutex.isLocked()).toBe(false);
    });

    test('should throw MutexTimeoutException if the lock is not released in time', async () => {
        jest.useFakeTimers();
        const timeout = 100;
        const timeoutMutex = new TimeoutMutex(timeout);

        await timeoutMutex.acquire();
        timeoutMutex.release();
        expect(timeoutMutex.isLocked()).toBe(false);

        expect(() => jest.advanceTimersByTime(timeout)).not.toThrow(
            MutexTimeoutException,
        );
        expect(timeoutMutex.isLocked()).toBe(false);
    });

    test('should release the lock before timeout', async () => {
        jest.useFakeTimers();
        const timeout = 100;
        const timeoutMutex = new TimeoutMutex(timeout);

        const release = await timeoutMutex.acquire();
        expect(timeoutMutex.isLocked()).toBe(true);

        release();

        jest.advanceTimersByTime(timeout);

        expect(timeoutMutex.isLocked()).toBe(false);
    });

    test('should add additional timeout to the existing timeout', async () => {
        const timeout = 1000;
        const additionalTimeout = 500;
        const timeoutMutex = new TimeoutMutex(timeout);

        jest.spyOn(timeoutMutex, 'setTimeoutHandler');

        const release = await timeoutMutex.acquire();
        timeoutMutex.addTimeout(additionalTimeout);

        release();

        expect(timeoutMutex.setTimeoutHandler).toHaveBeenCalledWith(
            timeout + additionalTimeout,
        );
    });

    test('should update the timeout value and set the timeout handler', async () => {
        const initialTimeout = 1000;
        const newTimeout = 2000;
        const timeoutMutex = new TimeoutMutex(initialTimeout);

        jest.spyOn(timeoutMutex, 'setTimeoutHandler');

        const release = await timeoutMutex.acquire();
        timeoutMutex.updateTimeout(newTimeout);

        release();

        expect(timeoutMutex.timeout).toBe(newTimeout);
        expect(timeoutMutex.setTimeoutHandler).toHaveBeenCalledWith(newTimeout);
    });

    test('should change the timeout value and set the timeout handler', async () => {
        const initialTimeout = 1000;
        const newTimeout = 1500;
        const timeoutMutex = new TimeoutMutex(initialTimeout);

        jest.spyOn(timeoutMutex, 'setTimeoutHandler');

        const release = await timeoutMutex.acquire();
        timeoutMutex.changeTimeout(newTimeout);

        release();

        expect(timeoutMutex.setTimeoutHandler).toHaveBeenCalledWith(newTimeout);
    });

    test('should reload the timeout handler', async () => {
        const timeout = 1000;
        const timeoutMutex = new TimeoutMutex(timeout);

        jest.spyOn(timeoutMutex, 'setTimeoutHandler');

        const release = await timeoutMutex.acquire();
        timeoutMutex.reloadTimeout();

        release();

        expect(timeoutMutex.setTimeoutHandler).toHaveBeenCalledWith();
    });
});
