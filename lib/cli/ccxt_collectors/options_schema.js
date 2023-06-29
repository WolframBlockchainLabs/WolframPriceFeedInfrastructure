import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('-e, --exchanges <value>', 'Exchanges array')
    .requiredOption('-i, --interval <value>', 'Interval duration');
