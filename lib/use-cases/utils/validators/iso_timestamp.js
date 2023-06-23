function iso_timestamp() {
    return (value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const isoTimestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

        if (!value) return;

        if (!isoDateRegex.test(value) && !isoTimestampRegex.test(value))
            return 'INVALID_ISO_DATE_OR_TIMESTAMP';

        if (isNaN(new Date(value))) return `WRONG_DATE ${value}`;

        return;
    };
}

export default iso_timestamp;
