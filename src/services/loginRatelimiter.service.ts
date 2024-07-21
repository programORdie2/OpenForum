import cote from 'cote';
import { MAX_LOGIN_ATTEMPTS } from '../config';
import logger from '../utils/logger.util';

// Create a new requester (client)
const requester = new cote.Requester({ name: 'ratelimiter' });

async function checkLogin(email: string) {
    // Send a 'user' event with the email
    try {
        const attempts = await requester.send({ type: 'user', email });

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