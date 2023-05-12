import zipObject          from 'lodash/zipObject.js';
import { Exception as X } from './../../packages.js';

const ERRORS = {
    'AUTHENTICATION_FAILED' : {
        code   : 'AUTHENTICATION_FAILED',
        fields : {
            email : 'AUTHENTICATION_FAILED'
        }
    },
    'SESSION_REQUIRED' : {
        code   : 'SESSION_REQUIRED',
        fields : {}
    },
    'PREVIEW_IMG_REQUIRED' : {
        code   : 'PREVIEW_IMG_REQUIRED',
        fields : { previewImg: 'REQUIRED' }
    },
    'ALL_TRANSLATIONS_REQUIRED' : {
        code   : 'ALL_TRANSLATIONS_REQUIRED',
        fields : {}
    },
    'USER_IS_NOT_PENDING' : {
        code   : 'USER_IS_NOT_PENDING',
        fields : {}
    },
    'EMAIL_NOT_UNIQUE' : {
        code   : 'EMAIL_NOT_UNIQUE',
        fields : { email: 'NOT_UNIQUE' }
    },
    'TWO_FACTOR_IS_NOT_ENABLED' : {
        code   : 'TWO_FACTOR_IS_NOT_ENABLED',
        fields : { confirmToken: 'TWO_FACTOR_IS_NOT_ENABLED' }
    },
    'TOKEN_IS_ALREADY_CONFIRMED' : {
        code   : 'TOKEN_IS_ALREADY_CONFIRMED',
        fields : { confirmToken: 'TOKEN_IS_ALREADY_CONFIRMED' }
    },
    'SECRET_WRONG' : {
        code   : 'SECRET_WRONG',
        fields : { confirmToken: 'SECRET_WRONG' }
    },
    'SECRET_REQUIRED' : {
        code   : 'SECRET_REQUIRED',
        fields : { secret: 'REQUIRED' }
    },
    'ACTION_FORBIDDEN' : {
        code   : 'ACTION_FORBIDDEN',
        fields : {}
    },
    'WRONG_ID' : {
        code   : 'WRONG_ID',
        fields : { id: 'WRONG_ID' }
    },
    'WRONG_EMAIL' : {
        code   : 'WRONG_EMAIL',
        fields : { email: 'WRONG_EMAIL' }
    },
    'SESSION_NOT_FOUND' : {
        code   : 'SESSION_NOT_FOUND',
        fields : { sessionId: 'SESSION_NOT_FOUND' }
    },
    'WRONG_TOKEN' : {
        code   : 'WRONG_TOKEN',
        fields : { token: 'WRONG_TOKEN' }
    },
    'ROLE_IN_USE' : {
        code   : 'ROLE_IN_USE',
        fields : { }
    },
    'ACTION_EXPIRED' : {
        code   : 'ACTION_EXPIRED',
        fields : {}
    },
    'IMAGE_UPLOADING_ERROR'(fields) {
        return {
            code   : 'IMAGE_UPLOADING_ERROR',
            fields : fields || {}
        };
    },
    'IMAGE_DELETING_ERROR'(fields) {
        return {
            code   : 'IMAGE_DELETING_ERROR',
            fields : fields || {}
        };
    },
    'PENDING_USER_RESET_PASSWORD' : {
        code   : 'PENDING_USER_RESET_PASSWORD',
        fields : {}
    }
};

export const ERROR_CODES = zipObject(Object.keys(ERRORS), Object.keys(ERRORS));

export function throwError(type, data) {
    let error = typeof ERRORS[type] === 'function'
        ? ERRORS[type](data)
        : ERRORS[type];

    if (!error) {
        error = {
            code   : type,
            fields : data || {}
        };
    }

    throw new X(error);
}
