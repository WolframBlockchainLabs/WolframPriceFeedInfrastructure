function iso_date() {
    return (value) => {
        if (!value) return;

        if (isNaN(Date.parse(value))) return `WRONG_DATE ${value}`;

        return;
    };
}

export default iso_date;
