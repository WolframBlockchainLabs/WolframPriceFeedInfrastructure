import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory.js';

describe('[domain-collectors]: GenericClassFactory Tests Suite', () => {
    class MockClass {
        constructor(options) {
            this.options = options;
        }
    }

    const defaultOptions = { option1: 'default1', option2: 'default2' };

    let factory;

    beforeEach(() => {
        factory = new GenericClassFactory({ Class: MockClass, defaultOptions });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create an instance with default options', () => {
        const instance = factory.create();
        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.options).toEqual(defaultOptions);
    });

    test('should create an instance with merged options', () => {
        const options = { option2: 'new2', option3: 'new3' };
        const expectedOptions = {
            option1: 'default1',
            option2: 'new2',
            option3: 'new3',
        };

        const instance = factory.create(options);
        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.options).toEqual(expectedOptions);
    });

    test('getOptions should return the default options', () => {
        expect(factory.getOptions()).toEqual(defaultOptions);
    });

    test('create should work without options', () => {
        const instance = factory.create();
        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.options).toEqual(defaultOptions);
    });
});
