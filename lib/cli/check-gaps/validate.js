function validateCheckGapsArgs({ startDate, endDate, datatype }) {
    if (!['CandleStick', 'OrderBook', 'Ticker', 'Trade'].includes(datatype)) {
        throw new Error('Unexpected datatype');
    }

    if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
        throw new Error('Invalid date');
    }
}

export default validateCheckGapsArgs;
