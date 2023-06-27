module.exports = {
    nodeArguments: ['--experimental-modules', '--experimental-json-modules'],
    serial: true,
    verbose: false,
    files: ['tests/index.test.js', 'tests/unit/**/**.js'],
    concurrency: 1,
    environmentVariables: {
        NODE_ENV: 'test',
    },
    timeout: '1m',
};
