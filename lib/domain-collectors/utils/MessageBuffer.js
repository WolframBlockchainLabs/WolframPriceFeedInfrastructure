class MessageBuffer {
    static debounce(func, delay) {
        let debounceTimer;

        return () => {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(func, delay);
        };
    }

    constructor(func, delay) {
        this.messageBuffer = [];

        this.func = func;
        this.delay = delay;

        this.processBuffer = MessageBuffer.debounce(func, delay);
    }

    addMessage(message) {
        this.messageBuffer.push(message);

        this.processBuffer();
    }

    getBuffer() {
        return this.messageBuffer;
    }

    cleanBuffer() {
        this.messageBuffer = [];
    }

    useBuffer() {
        const messageBuffer = this.getBuffer();

        this.cleanBuffer();

        return messageBuffer;
    }
}

export default MessageBuffer;
