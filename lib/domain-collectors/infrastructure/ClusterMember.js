class ClusterMember {
    static TYPES = {
        SELF: 'SELF',
        EXTERNAL: 'EXTERNAL',
    };

    constructor({ interval, type }) {
        this.interval = interval;
        this.type = type;
    }

    static hydrateList(dataList = []) {
        return dataList.map((data) => new this(data));
    }

    isSelf() {
        return this.type === ClusterMember.TYPES.SELF;
    }

    isExternal() {
        return this.type === ClusterMember.TYPES.EXTERNAL;
    }

    getInterval() {
        return this.interval;
    }
}

export default ClusterMember;
