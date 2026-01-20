import { prisma } from "./prisma";
import { emailQueue } from "./queue";

export async function recoverPendingEmails() {
  console.log("🔁 Running recovery for pending emails...");

  const now = new Date();

  const emails = await prisma.email.findMany({
    where: {
      status: "PENDING",
      scheduledAt: {
        gt: now
      },
      jobId: null
    }
  });

  console.log(`🔁 Found ${emails.length} emails to recover`);

  for (const email of emails) {
    const delay = email.scheduledAt.getTime() - Date.now();

    const job = await emailQueue.add(
      "send-email",
      { emailId: email.id },
      { delay: Math.max(0, delay) }
    );

    await prisma.email.update({
      where: { id: email.id },
      data: { jobId: job.id }
    });

    console.log("♻️ Re-enqueued email:", email.id);
  }

  console.log("✅ Recovery done");
}
