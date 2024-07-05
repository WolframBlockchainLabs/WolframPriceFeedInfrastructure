function date_greater_than(comparisonTargetKey) {
    return (value, params) => {
        const comparisonTarget = params[comparisonTargetKey];

        if (new Date(comparisonTarget).getTime() > new Date(value).getTime()) {
            return 'START_DATE_GREATER_THAN_END_DATE';
        }

        if (new Date(comparisonTarget).getTime() == new Date(value).getTime()) {
            return 'START_DATE_EQUAL_TO_END_DATE';
        }
    };
}

export default date_greater_than;
