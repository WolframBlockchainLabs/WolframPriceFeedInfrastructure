import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('--exchanges <value>', 'Exchanges array')
    .requiredOption(
        '--rateLimit <value>',
        'Requests allowed per millisecond interval',
    )
    .requiredOption(
        '--rateLimitMargin <value>',
        'Time margin between subsequent request slots',
    );
