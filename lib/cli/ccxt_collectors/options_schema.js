import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('-e, --exchange <value>', 'Exchange name')
    .requiredOption('-s, --symbol <value>', 'Symbol name')
    .requiredOption('-i, --interval <value>', 'Interval duration');
