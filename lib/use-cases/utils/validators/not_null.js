function not_null() {
    return (value) => {
        if (value === null) return 'CANNOT_BE_NULL';

        return;
    };
}

export default not_null;
