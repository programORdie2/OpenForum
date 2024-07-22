import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';

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
        logger.error("error", error)
        return true
    }
}

export default checkLogin