/* eslint-disable require-atomic-updates */
import fetch from 'node-fetch';

let ip = null;

export default async function getIp() {
    if (!ip) {
        try {
            const r = await fetch('https://api.ipify.org');

            ip = await r.text();
        } catch (error) {
            console.error(`Failed to get ip. Error: ${error}`);
        }
    }

    return ip || 'unknown';
}
