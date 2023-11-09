class BackoffManager {
    constructor({ amqpClient, rabbitGroupName }) {
        this.rabbitGroupName = rabbitGroupName;
        this.amqpClient = amqpClient;
    }

    async setupReplicaChannel() {
        this.amqpClient.getChannel().addSetup(async (channel) => {
            await channel.assertExchange(this.rabbitGroupName, 'fanout', {
                durable: false,
            });

            const queueAssertion = await channel.assertQueue('', {
                exclusive: true,
            });

            this.rabbitQueueId = queueAssertion.queue;

            await channel.bindQueue(
                this.rabbitQueueId,
                this.rabbitGroupName,
                '',
            );

            await channel.consume(
                this.rabbitQueueId,
                this.handleUpdateRateLimitEvent.bind(this),
                {
                    noAck: true,
                },
            );
        });
    }

    async handleUpdateRateLimitEvent(msg) {
        const { rateLimitMultiplier } = JSON.parse(msg.content.toString());

        if (rateLimitMultiplier < this.rateLimitMultiplier) return;

        await this.reload(rateLimitMultiplier);
    }

    async handleLocalRateLimitUpdate() {
        const newMultiplier = this.getMultiplierBackoff();

        if (!this.checkMultiplier(newMultiplier)) return;

        await this.reload(newMultiplier);

        await this.broadcastRateLimitChange();
    }

    async broadcastRateLimitChange() {
        const messageBuffer = Buffer.from(
            JSON.stringify({
                rateLimitMultiplier: this.rateLimitMultiplier,
            }),
        );

        return this.amqpClient
            .getChannel()
            .publish(this.exchange, '', messageBuffer);
    }
}

export default BackoffManager;
