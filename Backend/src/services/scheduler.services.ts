import { prisma } from "../prisma";
import { emailQueue } from "../queue";
import { redis } from "../redis";
import { getHourWindow, startOfNextHour } from "../utils/time";

export async function scheduleCampaignEmails(params: {
  campaignId: number;
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayMs: number;
  hourlyLimit: number;
}) {
  const {
    campaignId,
    subject,
    body,
    recipients,
    startTime,
    delayMs,
    hourlyLimit
  } = params;

  for (let i = 0; i < recipients.length; i++) {
    let scheduledAt = new Date(startTime.getTime() + i * delayMs);

    // setting hourly limit
    while (true) {
      const window = getHourWindow(scheduledAt);
      const key = `email_rate:${campaignId}:${window}`;

      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count < hourlyLimit) {
        await redis.multi().incr(key).expire(key, 86400).exec();
        break;
      } else {
        scheduledAt = startOfNextHour(scheduledAt);
      }
    }

    const email = await prisma.email.create({
      data: {
        campaignId,
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
}
