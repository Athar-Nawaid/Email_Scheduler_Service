import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { recoverPendingEmails } from "./recovery";
import { campaignRouter } from "./routes/campaign.routes";
import "./worker";
dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());


server.get("/",(req,res)=>{
    res.send("Email Scheduler API running")
})
server.use("/campaign", campaignRouter);



recoverPendingEmails().catch(err => {
  console.error("❌ Recovery failed", err);
});


server.listen(4000,()=>{
    console.log("Server is listening at 4000")
})
