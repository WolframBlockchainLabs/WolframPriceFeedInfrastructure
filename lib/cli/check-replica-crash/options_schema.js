import { program } from 'commander';
import { COLLECTOR_TYPES_LIST } from '../../constants/collectorTypes.js';

program
    .version('1.0.0')
    .description('A CLI for running replica crash checks')
    .requiredOption(
        '-r, --replicaId <value>',
        'target docker container in replica to be destroyed',
    )
    .option('-d, --duration <value>', 'test duration in milliseconds')
    .option('-t, --datatype <value>', `One of: [${COLLECTOR_TYPES_LIST}]`)
    .option(
        '-m, --marketId <value>',
        'id of a specific market to check health for',
    );
