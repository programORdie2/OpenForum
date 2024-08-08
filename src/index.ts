import cluster from "node:cluster";
import os from "node:os";

import logger from "./utils/logger.util";

import { MAX_CLUSTER_SIZE, PRODUCTION } from "./config";

import * as server from "./server";
import { minifyAllAssets } from "./utils/assetMinifier.util";

async function main(): Promise<void> {
  if (cluster.isPrimary) {
    // If this is the primary process, minimize assets and fork the workers
    if (PRODUCTION) await minifyAllAssets();

    const numCPUs = MAX_CLUSTER_SIZE <= 0 ? os.cpus().length : Math.min(os.availableParallelism(), MAX_CLUSTER_SIZE);

    for (let i = 0; i < numCPUs; i++) {
      logger.log(`Forking worker ${i + 1}/${numCPUs}`);
      const worker = cluster.fork();
      logger.log(`Worker ${worker.process.pid} is starting...`);
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