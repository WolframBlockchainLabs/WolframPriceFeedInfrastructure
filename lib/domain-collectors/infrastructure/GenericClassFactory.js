class GenericClassFactory {
    constructor({ Class, defaultOptions }) {
        this.Class = Class;
        this.defaultOptions = defaultOptions;
    }

    create(options) {
        return new this.Class({ ...this.defaultOptions, ...options });
    }
}

export default GenericClassFactory;
