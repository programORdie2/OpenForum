import { createClient, RedisClientType } from "redis";
import { REDIS as REDIS_CONFIG } from "../config";

export let redisClient: RedisClientType | null = null;

(async () => {
    if (!redisClient) {
        redisClient = createClient({
            socket: {
                host: REDIS_CONFIG.host,
                port: REDIS_CONFIG.port as number
            }
        });
        await redisClient.connect();
    }
})();

export default redisClient!;