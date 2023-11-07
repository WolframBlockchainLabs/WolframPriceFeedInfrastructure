import { COLLECTOR_TYPES_LIST } from '../../constants/collectorTypes.js';
import GapChecker from '../../infrastructure/gap-checker/GapChecker.js';
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
            logger: this.logger,
            sequelize: this.sequelize,
            startDate,
            endDate,
            datatype,
            marketId,
        });

        const results = await gapChecker.execute();

        this.logger.info({
            message: `Found ${results.total} gaps between ${startDate} and ${endDate} for ${datatype}`,
            results,
        });
    }
}

export default CheckGapsRunner;
