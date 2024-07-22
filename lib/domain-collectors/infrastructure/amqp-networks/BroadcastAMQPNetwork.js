import BaseAMQPNetwork from './BaseAMQPNetwork.js';

class BroadcastAMQPNetwork extends BaseAMQPNetwork {
    async bindQueue(channel) {
        await channel.bindQueue(this.rabbitQueueId, this.rabbitGroupName, '');
    }

    async broadcast(message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        return this.amqpClient
            .getChannel()
            .publish(this.rabbitGroupName, '', messageBuffer);
    }
}

export default BroadcastAMQPNetwork;
