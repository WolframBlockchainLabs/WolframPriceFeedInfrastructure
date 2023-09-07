import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('-e, --exchanges <value>', 'Exchanges array')
    .requiredOption('--projectId <value>', 'Blockfrost API key')
    .requiredOption(
        '-r, --rateLimit <value>',
        'Requests allowed per millisecond interval',
    )
    .requiredOption(
        '-m, --rateLimitMargin <value>',
        'Time margin between subsequent request slots',
    )
    .requiredOption(
        '-p, --instancePosition <value>',
        'Position of the instance in a replica cluster',
    )
    .requiredOption('-s, --replicaSize <value>', 'Size of the cluster');
