function json() {
    return (value, params, outputArr) => {
        if (!value) return;

        let parsedJson;

        try {
            parsedJson = JSON.parse(value.slice(1, -1));
        } catch {
            return `INVALID_JSON ${value}`;
        }

        outputArr.push(parsedJson);

        return;
    };
}

export default json;
