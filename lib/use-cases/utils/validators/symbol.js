function symbol() {
    return (value, params, outputArr) => {
        const normalizeSymbol = value.replace(/_/g, '/');

        outputArr.push(normalizeSymbol);
    };
}

export default symbol;
