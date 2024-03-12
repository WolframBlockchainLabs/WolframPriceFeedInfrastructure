import cors from 'cors';

function initCorsMiddleware(urls) {
    const origin = Object.values(urls).flat();

    return cors({ origin, credentials: true });
}

export default initCorsMiddleware;
