import { Queue } from "bullmq";

export const redisConnection = {
  host: "127.0.0.1",
  port: 6379
};

export const emailQueue = new Queue("email-queue", {connection:redisConnection});
