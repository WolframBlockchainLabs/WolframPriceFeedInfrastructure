function array_params() {
    return (value, params, outputArr) => {
        const normalizeParams = value.split(',');

        outputArr.push(normalizeParams);
    };
}

export default array_params;
