import ClusterMembersStateManagerReducer from './ClusterMembersStateManagerReducer.js';
import RateLimitStateManagerReducer from './RateLimitStateManagerReducer.js';
import ReplicaMembersStateManagerReducer from './ReplicaMembersStateManagerReducer.js';

const replicaStateReducers = [
    ReplicaMembersStateManagerReducer,
    RateLimitStateManagerReducer,
    ClusterMembersStateManagerReducer,
];

export default replicaStateReducers;
