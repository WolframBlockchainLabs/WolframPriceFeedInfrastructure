import { Op } from 'sequelize';

class GapChecker {
    constructor({
        logger,
        sequelize,
        startDate,
        endDate,
        datatype,
        marketId,
        stepSize,
    }) {
        this.logger = logger;
        this.sequelize = sequelize;

        this.startDate = startDate;
        this.endDate = endDate;
        this.datatype = datatype;
        this.marketId = marketId;

        this.stepSize = stepSize ?? 1000;

        this.results = {
            markets: {},
            total: 0,
        };
    }

    async execute() {
        const totalRowsCount = await this.getDataCount();
        const stepsCount = Math.ceil(totalRowsCount / this.stepSize);
        let lastEntryFromPrevBatch;

        for (let step = 0; step < stepsCount; step++) {
            const { rows } = await this.loadNextData(step * this.stepSize);
            const countData = lastEntryFromPrevBatch
                ? [lastEntryFromPrevBatch, ...rows]
                : rows;

            this.countGaps(countData);
            lastEntryFromPrevBatch = rows.at(-1);

            this.logger.info(`step ${step + 1} out of ${stepsCount}`);
        }

        return this.results;
    }

    countGaps(data) {
        const { results } = this;

        for (let i = 0; i <= data.length - 1; i++) {
            const currentMarketId = data[i].marketId;
            results.markets[currentMarketId] ??= 0;

            if (data[i].marketId !== data[i + 1]?.marketId) {
                results.total += results.markets[currentMarketId];
            } else if (
                data[i].intervalEnd.toString() !==
                data[i + 1].intervalStart.toString()
            ) {
                results.markets[currentMarketId]++;
            }
        }
    }

    async getDataCount() {
        const { count } = await this.loadNextData();

        return count;
    }

    async loadNextData(offset = 0) {
        const { sequelize, datatype, startDate, endDate, marketId, stepSize } =
            this;

        return sequelize.models[datatype].findAndCountAll({
            where: {
                intervalStart: { [Op.gte]: startDate },
                intervalEnd: { [Op.lte]: endDate },
                ...(marketId && { marketId }),
            },
            attributes: ['intervalStart', 'intervalEnd', 'marketId'],
            order: [
                ['marketId', 'ASC'],
                ['intervalStart', 'ASC'],
            ],
            limit: stepSize,
            offset,
        });
    }
}

export default GapChecker;
