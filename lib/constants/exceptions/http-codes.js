const HTTP_CODES = {
    FORMAT_ERROR: 400, // Bad Request - parameters are malformed.

    RATE_LIMIT_EXCEEDED: 429, // Too Many Requests - The user has sent too many requests in a given amount of time.

    ENTITY_NOT_FOUND: 404, // Not Found - The server can't find the requested entity.
    ENTITY_NOT_UNIQUE: 409, // Conflict - Indicates a request conflict with current state of the server, such as duplicate entries.
    INVALID_RELATION: 409, // Conflict - Indicates a request conflict with current state of the server, such as duplicate entries.
    ENTITY_IS_REFERENCED: 409, // Conflict - Indicates a request cannot be processed because of a conflict in the request, such as deleting a resource that is in use.

    RABBIT_CHANNEL_IS_CLOSED: 503, // Service Unavailable - Indicates that the server is not ready to handle the request. Common in situations where the server is down or unavailable.

    SERVER_ERROR: 500, // Service has thrown an unexpected error
};

export default HTTP_CODES;
