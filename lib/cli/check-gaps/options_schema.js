import { program } from 'commander';
import { COLLECTOR_TYPES_LIST } from '../../constants/collectorTypes.js';

program
    .version('1.0.0')
    .description('A CLI for running gaps checks')
    .requiredOption(
        '-d, --datatype <value>',
        `One of: [${COLLECTOR_TYPES_LIST}]`,
    )
    .option('-m, --marketId <value>', 'id of a specific market')
    .argument('<startDate>', 'Start date in format YYYY-MM-DD')
    .argument('<endDate>', 'End date in format YYYY-MM-DD');
