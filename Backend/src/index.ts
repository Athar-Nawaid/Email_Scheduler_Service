import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./prisma";


dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

server.get("/test",(req,res)=>{
    res.send("Working")
})

server.get("/test-db", async (_req, res) => {
  const email = await prisma.email.create({
    data: {
      campaignId: 1,
      to: "hello@test.com",
      subject: "First DB Insert",
      body: "Prisma finally works",
      status: "PENDING",
      scheduledAt: new Date()
    }
  });

  res.json(email);
});


server.post("/campaign/test-create", async (_req, res) => {
  // 1. Create campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: 1,          // assume user 1 exists
      startTime: new Date(),
      delayMs: 5000,
      hourlyLimit: 100
    }
  });

  // 2. Create emails
  const emails = await prisma.email.createMany({
    data: [
      {
        campaignId: campaign.id,
        to: "a@test.com",
        subject: "Hello A",
        body: "Email to A",
        status: "PENDING",
        scheduledAt: new Date()
      },
      {
        campaignId: campaign.id,
        to: "b@test.com",
        subject: "Hello B",
        body: "Email to B",
        status: "PENDING",
        scheduledAt: new Date()
      },
      {
        campaignId: campaign.id,
        to: "c@test.com",
        subject: "Hello C",
        body: "Email to C",
        status: "PENDING",
        scheduledAt: new Date()
      }
    ]
  });

  res.json({
    campaign,
    emailsCreated: emails.count
  });
});



server.listen(4000,()=>{
    console.log("Server is listening at 4000")
})
