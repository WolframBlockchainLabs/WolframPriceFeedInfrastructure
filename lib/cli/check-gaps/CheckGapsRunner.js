import { COLLECTOR_TYPES_LIST } from '../../constants/collectorTypes.js';
import GapChecker from '../../use-cases/testing/GapChecker.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class CheckGapsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        datatype: [
            'required',
            'string',
            {
                one_of: COLLECTOR_TYPES_LIST,
            },
        ],
        marketId: ['string'],
    };

    argsValidationRules = {
        0: ['required', 'string', 'iso_date'],
        1: ['required', 'string', 'iso_date'],
    };

    async process({
        options: { datatype, marketId },
        args: { 0: startDate, 1: endDate },
    }) {
        this.logger.info(
            `Looking for gaps between ${startDate} and ${endDate} for ${datatype}`,
        );

        const gapChecker = new GapChecker({
            context: {},
        });

        const results = await gapChecker.run({
            rangeDateStart: startDate,
            rangeDateEnd: endDate,
            datatype,
            marketId,
        });

        this.logger.info({
            message: `Found ${results.data.total} gaps between ${startDate} and ${endDate} for ${datatype}`,
            results,
        });
    }
}

export default CheckGapsRunner;
