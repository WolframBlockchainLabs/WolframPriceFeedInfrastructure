import { stat } from 'fs/promises';

const DEFAULT_PAD_LENGTH = 9;

export function modelStoragePath(modelId, padLength) {
    const filepathArray = padNumber(modelId, padLength).match(/.{1,3}/g);
    const filepath = filepathArray.join('/');

    return filepath;
}

export function padNumber(number, padLength) {
    let s = String(number);

    while (s.length < (padLength || DEFAULT_PAD_LENGTH)) {
        s = `0${s}`;
    }

    return s;
}

export async function isFile(val) {
    let stats = null;

    try {
        stats = await stat(val);
    } catch (e) {
        return false;
    }

    return stats.isFile();
}
