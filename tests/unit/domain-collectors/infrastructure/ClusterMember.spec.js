import ClusterMember from '#domain-collectors/infrastructure/ClusterMember.js';

describe('[domain-collectors]: ClusterMember Tests Suite', () => {
    test('should create an instance with interval and type', () => {
        const interval = 1000;
        const type = ClusterMember.TYPES.SELF;
        const clusterMember = new ClusterMember({ interval, type });

        expect(clusterMember.interval).toBe(interval);
        expect(clusterMember.type).toBe(type);
    });

    test('hydrateList should create a list of ClusterMember instances', () => {
        const dataList = [
            { interval: 1000, type: ClusterMember.TYPES.SELF },
            { interval: 2000, type: ClusterMember.TYPES.EXTERNAL },
        ];
        const clusterMembers = ClusterMember.hydrateList(dataList);

        expect(clusterMembers.length).toBe(dataList.length);
        clusterMembers.forEach((member, index) => {
            expect(member).toBeInstanceOf(ClusterMember);
            expect(member.interval).toBe(dataList[index].interval);
            expect(member.type).toBe(dataList[index].type);
        });
    });

    test('hydrateList should return an empty list when called with an empty array', () => {
        const clusterMembers = ClusterMember.hydrateList();

        expect(clusterMembers.length).toBe(0);
    });

    test('isSelf should return true if type is SELF', () => {
        const clusterMember = new ClusterMember({
            interval: 1000,
            type: ClusterMember.TYPES.SELF,
        });

        expect(clusterMember.isSelf()).toBe(true);
    });

    test('isSelf should return false if type is not SELF', () => {
        const clusterMember = new ClusterMember({
            interval: 1000,
            type: ClusterMember.TYPES.EXTERNAL,
        });

        expect(clusterMember.isSelf()).toBe(false);
    });

    test('isExternal should return true if type is EXTERNAL', () => {
        const clusterMember = new ClusterMember({
            interval: 1000,
            type: ClusterMember.TYPES.EXTERNAL,
        });

        expect(clusterMember.isExternal()).toBe(true);
    });

    test('isExternal should return false if type is not EXTERNAL', () => {
        const clusterMember = new ClusterMember({
            interval: 1000,
            type: ClusterMember.TYPES.SELF,
        });

        expect(clusterMember.isExternal()).toBe(false);
    });

    test('getInterval should return the interval', () => {
        const interval = 1000;
        const clusterMember = new ClusterMember({
            interval,
            type: ClusterMember.TYPES.SELF,
        });

        expect(clusterMember.getInterval()).toBe(interval);
    });
});
