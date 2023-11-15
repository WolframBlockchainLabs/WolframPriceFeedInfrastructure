class BaseFactory {
    static INITIAL_INTERVAL_START = '2023-11-15T09:50:00.000Z';
    static INITIAL_INTERVAL_END = '2023-11-15T09:51:00.000Z';

    constructor(appProvider) {
        this.appProvider = appProvider;
    }

    shiftDateFor(dateString, minutes) {
        const date = new Date(dateString);

        date.setMinutes(date.getMinutes() + minutes);

        return date.toISOString();
    }
}

export default BaseFactory;
