function cli_string_format() {
    return (value, params, outputArr) => {
        if (!value || typeof value !== 'string') return;

        const parsedCliString = value.slice(1, -1);

        outputArr.push(parsedCliString);
    };
}

export default cli_string_format;
