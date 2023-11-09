import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('--exchanges <value>', 'Exchanges array')
    .requiredOption('--apiKey <value>', 'Blockchain node API key')
    .requiredOption(
        '--baseRateLimit <value>',
        'Interval in milliseconds per operation',
    )
    .requiredOption(
        '--rateLimitMargin <value>',
        'Time margin between subsequent request slots',
    )
    .requiredOption(
        '--instancePosition <value>',
        'Position of the instance in a replica cluster',
    )
    .requiredOption('--replicaSize <value>', 'Size of the cluster');
