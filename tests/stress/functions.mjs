function log(req, res, context, events, next) {
    console.log('LOG:', { req, res, context });

    return next();
}

export { log };
