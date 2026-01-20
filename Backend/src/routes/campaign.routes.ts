import express from "express";
import {prisma} from "../prisma";
import { emailQueue } from "../queue";
import { redis } from "../redis";
import { getHourWindow, startOfNextHour } from "../utils/time";


export const campaignRouter = express.Router();


campaignRouter.post("/create", async (req, res) => {
  const {
    subject,
    body,
    recipients,
    startTime,
    delayMs,
    hourlyLimit
  } = req.body;

  if (
    !subject ||
    !body ||
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    !startTime ||
    !delayMs ||
    !hourlyLimit
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  let start = new Date(startTime);

  //REmove after test
  start = new Date(Date.now() + 30_000);

  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: "Invalid startTime" });
  }

  // Creating campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: 1,
      startTime: start,
      delayMs,
      hourlyLimit
    }
  });

  //Creating emails + schedule jobs
  for (let i = 0; i < recipients.length; i++) {
  let scheduledAt = new Date(start.getTime() + i * delayMs);

  // Enforce hourly limit
  while (true) {
    const window = getHourWindow(scheduledAt);
    const key = `email_rate:${campaign.id}:${window}`;

    const current = await redis.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count < hourlyLimit) {
      // Reserve slot
      await redis.multi()
        .incr(key)
        .expire(key, 60 * 60 * 24) // auto cleanup after 24h
        .exec();

      break; // scheduledAt accepted
    } else {
      // Move to next hour
      scheduledAt = startOfNextHour(scheduledAt);
    }
  }

  const email = await prisma.email.create({
    data: {
      campaignId: campaign.id,
      to: recipients[i],
      subject,
      body,
      status: "PENDING",
      scheduledAt
    }
  });

  const delay = scheduledAt.getTime() - Date.now();

  const job = await emailQueue.add(
    "send-email",
    { emailId: email.id },
    { delay: Math.max(0, delay) }
  );

  await prisma.email.update({
    where: { id: email.id },
    data: { jobId: job.id }
  });
}


  res.json({
    ok: true,
    campaignId: campaign.id,
    scheduled: recipients.length
  });
});
