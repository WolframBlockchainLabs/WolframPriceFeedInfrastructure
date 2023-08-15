import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('-e, --exchanges <value>', 'Exchanges array')
    .requiredOption(
        '-r, --rateLimit <value>',
        'Requests allowed per millisecond interval',
    )
    .requiredOption(
        '-m, --rateLimitMargin <value>',
        'Time margin between subsequent request slots',
    )
    .requiredOption(
        '-l, --scheduleStartDate <value>',
        'Start date in format YYYY-MM-DD',
    )
    .requiredOption(
        '-h, --scheduleEndDate <value>',
        'End date in format YYYY-MM-DD',
    );
