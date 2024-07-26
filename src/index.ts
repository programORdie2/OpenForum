import cluster from "cluster";
import os from "os";

import connectDB from "./services/database.service";
import logger from "./utils/logger.util";

import { MAX_CLUSTER_SIZE } from "./config";

import * as server from "./server";

async function connect(): Promise<void> {
  await connectDB();
}

if (cluster.isPrimary) {
  // If this is the primary process, start the workers
  const numCPUs = Math.min(os.availableParallelism(), MAX_CLUSTER_SIZE);

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
  connect(); // First connect to the database
  server.start(); // Then start the server
}