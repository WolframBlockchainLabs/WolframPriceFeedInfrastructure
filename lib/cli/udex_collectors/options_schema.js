import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption('--groupName <value>', 'Name of the group to be launched');
