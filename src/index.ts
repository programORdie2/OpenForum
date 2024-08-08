import cluster from "node:cluster";
import os from "node:os";

import logger from "./utils/logger.util";

import { MAX_CLUSTER_SIZE, PRODUCTION } from "./config";

import * as server from "./server";
import { minifyAllAssets } from "./utils/assetMinifier.util";
import { CreateCacheServer } from "./services/cache.service";

async function main(): Promise<void> {
  const logginAttemptsDb = new CreateCacheServer(200, 5 * 60);

  if (cluster.isPrimary) {
    // If this is the primary process, minimize assets and fork the workers
    if (PRODUCTION) await minifyAllAssets();

    const numCPUs = MAX_CLUSTER_SIZE <= 0 ? os.cpus().length : Math.min(os.availableParallelism(), MAX_CLUSTER_SIZE);

    for (let i = 0; i < numCPUs; i++) {
      logger.log(`Forking worker ${i + 1}/${numCPUs}`);
      const worker = cluster.fork();
      
      worker.on("message", (message) => {
        if (message.cacheName === "loginAttempts") {
          const res = logginAttemptsDb.onCall(message.type, message.key, message?.value);
          worker.send({ key: message.key, result: res });
        }
      });
    }

    // If a worker dies, restart it
    cluster.on("exit", (worker, code, signal) => {
      logger.critical(`worker ${worker.process.pid} died. code: ${code}, signal: ${signal}`);
      cluster.fork();
    });
  } else {
    // If this is a worker process, start the server
    logger.log(`Worker ${process.pid} is running`);
    server.start();
  }
}

main();