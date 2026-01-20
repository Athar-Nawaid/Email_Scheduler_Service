import express from "express";
import dotenv from "dotenv";

dotenv.config();

const server = express();


server.use(express.json());


server.listen(3000,()=>{
    console.log("Server is listening at 3000")
})
