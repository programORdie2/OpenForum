import logger from "../utils/logger.util";

// Server
class CreateCacheServer {
    private cache: Map<string, { value: string, time: number }>;
    private maxAge: number;
    private maxItems: number;

    constructor(maxItems: number = 256, maxAge: number = 60) {
        this.cache = new Map();
        this.maxAge = maxAge * 1000;
        this.maxItems = maxItems;
    }

    private get(key: string): string | undefined {
        const value = this.cache.get(key);
        if (!value) return undefined;

        const age = Date.now() - value.time;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return undefined;
        }

        return value.value;
    }

    private set(key: string, value: any) {
        this.cache.set(key, { value: value, time: Date.now() });
        if (this.cache.size > this.maxItems) {
            const key = this.cache.keys().next().value;
            this.cache.delete(key || "");
        }
    }

    public onCall(type: "get" | "set", key: string, value?: any) {
        if (type == "get") return this.get(key);
        if (type == "set") {
            this.set(key, value || "");
            return this.get(key);
        }
    }
}

const listeners: { [key: string]: Function } = {};
process.on("message", (message) => {
    const vals = Object.values(listeners);
    vals.forEach((listener: Function) => listener(message));
})

// Client
function getFromCache(cacheName: string, key: string): Promise<undefined | any> | undefined {
    if (typeof process.send === "function") {
        process.send({ type: "get", cacheName: cacheName, key: key });

        const listenerId = Math.random().toString();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                logger.warn("Cache request timed out. ");
                delete listeners[listenerId];
                resolve(undefined);
            }, 1000);

            listeners[listenerId] = ((message: any) => {
                if (message?.key === key) {
                    clearTimeout(timeout);
                    delete listeners[listenerId];
                    resolve(message.result);
                }
            });
        });
    } else {
        logger.error("Can't use cache without a parent process");
        return undefined;
    }
}

function setInCache(cacheName: string, key: string, value: any) {
    if (typeof process.send === "function") {
        process.send({ type: "set", cacheName: cacheName, key: key, value: value });
    } else {
        logger.error("Can't use cache without a parent process");
    }
}

export { CreateCacheServer, getFromCache, setInCache };