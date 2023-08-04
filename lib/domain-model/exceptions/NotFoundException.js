import Exception from './Exception.js';

class NotFoundException extends Exception {
    constructor(code) {
        super({
            code,
            fields: {},
        });
    }
}

export default NotFoundException;
