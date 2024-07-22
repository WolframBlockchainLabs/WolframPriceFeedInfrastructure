async function renderPromiseAsJson({ res, promise, next }) {
    try {
        const responseData = await promise;

        responseData.status = 1;

        return res.send(responseData);
    } catch (error) {
        next(error);
    }
}

export default renderPromiseAsJson;
