import cors from 'cors';

function initCorsMiddleware(urls) {
    return cors({ origin: urls, credentials: true });
}

export default initCorsMiddleware;
