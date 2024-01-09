class AMQPManagementTarget {
    constructor({
        startHandler,
        stopHandler,
        getStatusHandler,
        reloadHandler,
        identity,
    }) {
        this.startHandler = startHandler;
        this.stopHandler = stopHandler;
        this.getStatusHandler = getStatusHandler;
        this.reloadHandler = reloadHandler;

        this.identity = identity;
    }
}

export default AMQPManagementTarget;
