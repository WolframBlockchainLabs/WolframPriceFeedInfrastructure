function isValidISOTimestamp(timestamp) {
    const date = Date.parse(timestamp);

    return !isNaN(date);
}

function iso_timestamp() {
    return (value) => {
        if (!value) return;

        if (!isValidISOTimestamp(value)) return 'INVALID_ISO_DATE_OR_TIMESTAMP';

        if (isNaN(new Date(value))) return `WRONG_DATE ${value}`;

        return;
    };
}

export default iso_timestamp;
