import MessageBuffer from '#domain-collectors/utils/MessageBuffer.js';

describe('[domain-collectors/infrastructure]: MessageBuffer Tests Suite', () => {
    const delay = 100;
    let mockFunc;
    let messageBuffer;

    beforeEach(() => {
        mockFunc = jest.fn();
        messageBuffer = new MessageBuffer(mockFunc, delay);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test('MessageBuffer constructor should initialize with empty message buffer', () => {
        expect(messageBuffer.getBuffer()).toEqual([]);
    });

    test('addMessage should add a message to the buffer', () => {
        messageBuffer.addMessage('test message');
        expect(messageBuffer.getBuffer()).toContain('test message');
    });

    test('debounce should delay function execution', () => {
        messageBuffer.addMessage('first message');
        messageBuffer.addMessage('second message');

        jest.advanceTimersByTime(delay - 50);
        expect(mockFunc).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);
        expect(mockFunc).toHaveBeenCalledTimes(1);
    });

    test('useBuffer should clear the buffer after returning all messages', () => {
        messageBuffer.addMessage('message1');
        messageBuffer.addMessage('message2');

        const usedBuffer = messageBuffer.useBuffer();

        expect(usedBuffer).toEqual(['message1', 'message2']);
        expect(messageBuffer.getBuffer()).toEqual([]);
    });

    test('processBuffer should be called only once if multiple messages are added within the debounce delay', () => {
        messageBuffer.addMessage('message1');
        messageBuffer.addMessage('message2');

        jest.advanceTimersByTime(delay);

        expect(mockFunc).toHaveBeenCalledTimes(1);
    });

    test('cleanBuffer should remove all messages from the buffer', () => {
        messageBuffer.addMessage('message');
        messageBuffer.cleanBuffer();
        expect(messageBuffer.getBuffer()).toEqual([]);
    });
});
