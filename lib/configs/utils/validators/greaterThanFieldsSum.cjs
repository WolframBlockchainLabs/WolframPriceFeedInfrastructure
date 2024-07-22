function greaterThanFieldsSum(...fields) {
    return (value, params) => {
        const sum = fields
            .slice(0, -1)
            .reduce((sum, field) => sum + +params[field], 0);

        if (+value > sum) return;

        return 'TOO_LOW';
    };
}

module.exports = greaterThanFieldsSum;
