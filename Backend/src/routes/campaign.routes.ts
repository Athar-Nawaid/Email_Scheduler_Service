import express from "express";
import {prisma} from "../prisma";
import { emailQueue } from "../queue";
import { redis } from "../redis";

import { getHourWindow, startOfNextHour } from "../utils/time";
import { upload } from "../middleware/upload";
import { parse } from "csv-parse/sync";
import { scheduleCampaignEmails } from "../services/scheduler.services";



export const campaignRouter = express.Router();


//Get Scheduled emails
campaignRouter.get("/scheduled", async (_req, res) => {
  const emails = await prisma.email.findMany({
    where: {
      status: "PENDING"
    },
    orderBy: {
      scheduledAt: "asc"
    },
    take: 100
  });

  res.json(emails);
});

// Get sent emails
campaignRouter.get("/sent", async (_req, res) => {
  const emails = await prisma.email.findMany({
    where: {
      status: {
        in: ["SENT", "FAILED"]
      }
    },
    orderBy: {
      sentAt: "desc"
    },
    take: 100
  });

  res.json(emails);
});


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

  scheduleCampaignEmails({
    campaignId: campaign.id,
    subject,
    body,
    recipients,
    startTime: start,
    delayMs: Number(delayMs),
    hourlyLimit: Number(hourlyLimit)
  })

  res.json({
    ok: true,
    campaignId: campaign.id,
    scheduled: recipients.length
  });
});


campaignRouter.post(
  "/from-csv",
  upload.single("file"),
  async (req, res) => {
    const { subject, body, startTime, delayMs, hourlyLimit } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const start = new Date(startTime);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: "Invalid startTime" });
    }

    const csvText = req.file.buffer.toString("utf-8");

    const records = parse(csvText, {
      skip_empty_lines: true
    });

    // Flatten and clean emails
    const recipients = records
      .flat()
      .map((x: string) => x.trim())
      .filter((x: string) => x.includes("@"));

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No valid emails in CSV" });
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: 1,
        startTime: start,
        delayMs: Number(delayMs),
        hourlyLimit: Number(hourlyLimit)
      }
    });

    scheduleCampaignEmails({
    campaignId: campaign.id,
    subject,
    body,
    recipients,
    startTime: start,
    delayMs: Number(delayMs),
    hourlyLimit: Number(hourlyLimit)
  })

    res.json({
      ok: true,
      campaignId: campaign.id,
      recipients: recipients.length
    });
  }
);

