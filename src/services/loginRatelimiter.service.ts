import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';
import { getFromCache, setInCache } from './cache.service';

async function checkLogin(email: string): Promise<boolean> {
    try {
        const _attempts = await getFromCache("loginAttempts", email);

        if (!_attempts) {
            setInCache("loginAttempts", email, "1");
            
            return true
        }

        let attempts = Number.parseInt(_attempts);

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