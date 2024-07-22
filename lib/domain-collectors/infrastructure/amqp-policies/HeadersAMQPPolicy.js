import HeadersAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/HeadersAMQPNetwork.js';
import wrapAMQPNetwork from './wrapAMQPNetwork.js';

const HeadersAMQPPolicy = wrapAMQPNetwork(HeadersAMQPNetwork);

export default HeadersAMQPPolicy;
