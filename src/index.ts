import cluster from "cluster";
import os from "os";

import connectDB from "./services/database.service";
import logger from "./utils/logger.util";

import { MAX_CLUSTER_SIZE } from "./config";

import * as server from "./server";


async function connect() {
  await connectDB();
}

if (cluster.isPrimary) {
  const numCPUs = Math.min(os.availableParallelism(), MAX_CLUSTER_SIZE);

  for (let i = 0; i < numCPUs; i++) {
    logger.log(`Forking worker ${i + 1}/${numCPUs}`);
    const worker = cluster.fork();
    logger.log(`Worker ${worker.process.pid} is starting...`);
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.critical(`worker ${worker.process.pid} died. code: ${code}, signal: ${signal}`);
    cluster.fork();
  });
} else {
  logger.log(`Worker ${process.pid} is running`);
  connect();
  server.start();
}