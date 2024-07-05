import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('--exchangeIds <value>', 'Exchange ids array')
    .requiredOption(
        '--scheduleStartDate <value>',
        'Start date in format YYYY-MM-DD',
    )
    .requiredOption(
        '--scheduleEndDate <value>',
        'End date in format YYYY-MM-DD',
    );
