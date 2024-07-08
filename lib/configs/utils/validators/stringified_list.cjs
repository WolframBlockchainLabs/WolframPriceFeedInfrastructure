function stringified_list() {
    return (value, params, outputArr) => {
        if (typeof value !== 'string') return;

        if (!value.length) {
            outputArr.push([]);

            return;
        }

        const parsedList = value.split(',');
        outputArr.push(parsedList);

        return;
    };
}

module.exports = stringified_list;
