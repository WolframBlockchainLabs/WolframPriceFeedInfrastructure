import BroadcastAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/BroadcastAMQPNetwork.js';
import wrapAMQPNetwork from './wrapAMQPNetwork.js';

const BroadcastAMQPPolicy = wrapAMQPNetwork(BroadcastAMQPNetwork);

export default BroadcastAMQPPolicy;
