function cloneDeep(data) {
    return JSON.parse(JSON.stringify(data));
}

function defaultContextBuilder(req) {
    const context = req?.session?.context || {};

    return cloneDeep(context);
}

export default defaultContextBuilder;
