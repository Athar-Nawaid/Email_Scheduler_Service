import { Worker } from "bullmq";
import { redisConnection } from "./queue";
import { prisma } from "./prisma";
import { sendEmail } from "./mailer";

console.log("📨 Email worker started...");

export const queueWorker = new Worker(
  "email-queue",
  async job => {
    const { emailId } = job.data;

    console.log("🔧 Processing job for emailId:", emailId);

    const email = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (!email) {
      console.log("⚠️ Email not found:", emailId);
      return;
    }

    if (email.status === "SENT") {
      console.log("⏭️ Email already sent, skipping:", emailId);
      return;
    }

    // Mark as sending
    await prisma.email.update({
      where: { id: emailId },
      data: { status: "SENDING" }
    });

    try {
      await sendEmail(email.to, email.subject, email.body);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "SENT",
          sentAt: new Date()
        }
      });

      console.log("✅ Email sent:", email.to);
    } catch (err: any) {
      console.error("❌ Failed to send email:", email.to, err.message);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          error: err.message
        }
      });

      throw err; // let BullMQ mark job as failed
    }
  },
  {
    connection:redisConnection,
    concurrency: 5
  }
);
