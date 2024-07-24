import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';

let local_data: any = {};

async function checkLogin(email: string) {
    // Send a 'user' event with the email
    try {
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

setInterval(() => {
    local_data = {}
}, 60 * 1000)

export default checkLogin