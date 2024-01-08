import BaseAMQPPolicy from './BaseAMQPPolicy.js';

class StatusUpdatePolicy extends BaseAMQPPolicy {
    static MESSAGE_TYPES = {
        REQUEST: 'REQUEST',
        UPDATE: 'UPDATE',
    };

    constructor({ amqpClient, rabbitGroupName }) {
        super({ amqpClient, rabbitGroupName: `${rabbitGroupName}::status` });
    }

    async start({ getStatusHandler, updateHandler }) {
        this.getStatusHandler = getStatusHandler;
        this.updateHandler = updateHandler;

        await super.start();

        return this.broadcast({
            type: StatusUpdatePolicy.MESSAGE_TYPES.REQUEST,
            data: { statusUpdateQueue: this.getPrivateQueueAddress() },
        });
    }

    async consumer(message) {
        const { type, data } = JSON.parse(message.content.toString());

        switch (type) {
            case StatusUpdatePolicy.MESSAGE_TYPES.REQUEST: {
                return this.requestConsumer(data);
            }
            case StatusUpdatePolicy.MESSAGE_TYPES.UPDATE: {
                return this.updateConsumer(data);
            }
        }
    }

    async requestConsumer({ statusUpdateQueue }) {
        const data = await this.getStatusHandler();

        return this.amqpClient.publish(statusUpdateQueue, {
            type: StatusUpdatePolicy.MESSAGE_TYPES.UPDATE,
            data,
        });
    }

    async updateConsumer(data) {
        return this.updateHandler(data);
    }
}

export default StatusUpdatePolicy;
