import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from './logger.util';
import redisClient from './redis.util';

export default async function checkLogin(email: string): Promise<boolean> {
    try {
        const redisId = `loginAttempts:${email}`;

        const attempts = await redisClient.incr(redisId);

        if (attempts === 1) {
            await redisClient.expire(redisId, 60);
        }

        if (attempts > MAX_LOGIN_ATTEMPTS) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error("error", error);
        return true;
    }
}