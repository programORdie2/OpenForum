import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';
import { getFromCache, setInCache } from '../utils/cache.util';

async function checkLogin(email: string): Promise<boolean> {
    try {
        let attempts = await getFromCache("loginAttempts", email);

        if (!attempts) {
            setInCache("loginAttempts", email, 1);
            return true
        }

        attempts++
        setInCache("loginAttempts", email, attempts.toString());

        if (attempts > MAX_LOGIN_ATTEMPTS) {
            return false
        }

        return true
    } catch (error) {
        logger.error("error", error);
        return true
    }
}

export default checkLogin