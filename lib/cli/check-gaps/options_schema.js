import { program } from 'commander';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .requiredOption(
        '-d, --datatype <value>',
        'One of: [CandleStick, OrderBook, Ticker, Trade]',
    )
    .option('-m, --marketId <value>', 'id of a specific market')
    .argument('<startDate>', 'Start date in format YYYY-MM-DD')
    .argument('<endDate>', 'End date in format YYYY-MM-DD');
