function date_compare() {
    return (value, params) => {
        const { rangeDateStart, rangeDateEnd } = params;

        if (isNaN(new Date(rangeDateStart)) || isNaN(new Date(rangeDateEnd))) {
            return;
        }

        if (rangeDateStart > rangeDateEnd)
            return 'DATE START CANNOT BE LATE THAN DATA END';
    };
}

export default date_compare;
