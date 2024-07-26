import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';

let local_data: any = {};

async function checkLogin(email: string): Promise<boolean> {
    try {
        // See cacheServer.js
        const _attempts = await fetch(`http://localhost:3003/user/${email}`, {
            method: 'POST',
        });
        const attempts = (await _attempts.json()).attempts;

        if (attempts > MAX_LOGIN_ATTEMPTS) {
            return false
        }
        return true
    } catch (error) {
        logger.error("error", error);
        // Backup for when cacheServer is not running
        if (local_data[email]) {
            local_data[email] += 1
        } else {
            local_data[email] = 1
        }
        if (local_data[email] > MAX_LOGIN_ATTEMPTS) {
            return false
        }
        return true
    }
}

// Simpliest way to clear cache
setInterval(() => {
    local_data = {}
}, 60 * 1000)

export default checkLogin