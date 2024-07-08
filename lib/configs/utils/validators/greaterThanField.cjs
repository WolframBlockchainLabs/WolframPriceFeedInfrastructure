function greaterThanField(queryKey) {
    return (value, params) => {
        if (+value > +params[queryKey]) return;

        return 'TOO_LOW';
    };
}

module.exports = greaterThanField;
