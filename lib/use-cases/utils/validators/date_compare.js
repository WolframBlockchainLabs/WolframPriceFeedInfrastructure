function date_compare(differenceLimit) {
    return (value, params) => {
        const { rangeDateStart, rangeDateEnd } = params;

        if (isNaN(new Date(rangeDateStart)) || isNaN(new Date(rangeDateEnd))) {
            return;
        }

        if (rangeDateStart > rangeDateEnd) {
            return 'START_DATE_GREATER_THAN_END_DATE';
        }

        if (
            new Date(rangeDateEnd) - new Date(rangeDateStart) >
            differenceLimit
        ) {
            return 'TOO_BIG_DATE_RANGE';
        }
    };
}

export default date_compare;
