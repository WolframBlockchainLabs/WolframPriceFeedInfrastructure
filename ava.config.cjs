module.exports = {
    nodeArguments: ['--experimental-modules', '--experimental-json-modules'],
    serial: true,
    verbose: false,
    // files: ['tests/index.test.js', 'tests/unit/**.js'],
    files: ['tests/index.test.js'],
    concurrency: 1,
    environmentVariables: {
        MODE: 'test',
    },
    timeout: '1m',
};
