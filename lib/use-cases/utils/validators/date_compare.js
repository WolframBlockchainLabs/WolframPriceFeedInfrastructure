function date_compare() {
    return (value, params) => {
        const { rangeDateStart, rangeDateEnd } = params;

        if (isNaN(new Date(rangeDateStart)) || isNaN(new Date(rangeDateEnd))) {
            return;
        }

        if (rangeDateStart > rangeDateEnd)
            return 'START_DATE_GREATER_THAN_END_DATE';
    };
}

export default date_compare;
