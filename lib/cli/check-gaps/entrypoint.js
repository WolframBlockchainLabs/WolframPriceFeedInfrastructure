import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import './options_schema.js';
import validateCheckGapsArgs from './validate.js';
import checkGaps from './checkGaps.js';

const provider = new AppCliProvider(async (startDate, endDate) => {
    const { datatype, marketId } = program.opts();
    validateCheckGapsArgs({ startDate, endDate, datatype });

    provider.logger.info(
        `Looking for gaps between ${startDate} and ${endDate} for ${datatype}`,
    );

    const results = await checkGaps({
        startDate,
        endDate,
        datatype,
        marketId,
    });

    provider.logger.info({
        message: `Found ${results.total} gaps between ${startDate} and ${endDate} for ${datatype}`,
        results,
    });

    await provider.shutdown();
});

provider.start();
