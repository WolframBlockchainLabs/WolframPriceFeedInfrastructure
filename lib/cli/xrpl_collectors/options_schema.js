import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('--markets <value>', 'Markets array')
    .requiredOption('--exchange <value>', 'Exchange description')
    .requiredOption('--serverUrl <value>', 'XRPL node url')
    .requiredOption(
        '--baseRateLimit <value>',
        'Requests allowed per millisecond interval',
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
