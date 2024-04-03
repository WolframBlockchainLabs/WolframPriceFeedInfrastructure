function dumpError(item) {
    return Object.getOwnPropertyNames(item).reduce((obj, key) => {
        obj[key] = item[key];

        return obj;
    }, {});
}

export default dumpError;
