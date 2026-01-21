# Email_Scheduler_Service – Full-stack Email Scheduler

This repository contains a full-stack, production-style email scheduling system built as part of the ReachInbox hiring assignment.

The goal of this project is to demonstrate:

Reliable scheduling using BullMQ + Redis (no cron jobs)

Persistence across restarts without losing or duplicating jobs

Proper handling of rate limits, delays, and concurrency

A clean dashboard UI to manage scheduled and sent emails

A backend design that behaves like a real-world email system under load

Tech Stack
Backend

Node.js + TypeScript

Express.js

PostgreSQL

Prisma ORM

BullMQ + Redis

Nodemailer + Ethereal Email (fake SMTP)

Frontend

Next.js (App Router)

TypeScript

Tailwind CSS

NextAuth (Google OAuth)

Infra

Redis and PostgreSQL via Docker

Repository Structure
/
  backend/
    src/
    prisma/
    docker-compose.yml
  frontend/
    app/
    components/

How to Run the Project
Prerequisites

Node.js 18+

Docker

npm

Start Redis & Postgres

From the backend folder:

docker compose up -d

Backend Setup
cd backend
npm install


Create a .env file in backend:

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox
REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass

MAX_EMAILS_PER_HOUR=200
MIN_DELAY_BETWEEN_EMAILS_SECONDS=2
WORKER_CONCURRENCY=5

Setup Ethereal Email

Go to https://ethereal.email

Create a test account

Copy SMTP credentials into the .env file

Run Prisma
npx prisma migrate dev
npx prisma generate

Start Backend (API + Worker)
npm run dev


This starts:

Express API server

BullMQ worker for sending emails

Backend runs on:

http://localhost:4000

Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs on:

http://localhost:3000

Google OAuth Setup

Create a Google OAuth app and add this to frontend/.env.local:

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some-secret

GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx

Architecture Overview
High-Level Flow

User schedules a campaign from the frontend

Backend:

Stores emails in PostgreSQL

Enqueues jobs in BullMQ with delays

Worker:

Picks jobs from Redis

Enforces delay and rate limit

Sends email using Ethereal SMTP

Updates DB status

How Scheduling Works (No Cron)

Each email is scheduled as a BullMQ delayed job

The delay is calculated using:

Campaign start time

Per-email delay

BullMQ persists jobs in Redis

On server restart:

Delayed jobs are resumed automatically

No emails are lost

No emails are duplicated

Persistence and Idempotency

Every email is stored in DB with status:

PENDING

SENT

FAILED

Worker:

Checks DB status before sending

Updates status after success/failure

This guarantees:

Safe restarts

No duplicate sends

Rate Limiting and Delay Strategy
Delay Between Emails

Configured via:

MIN_DELAY_BETWEEN_EMAILS_SECONDS=2


This ensures a minimum gap between consecutive sends.

Emails Per Hour Limit

Configured via:

MAX_EMAILS_PER_HOUR=200


Implementation:

Redis counter keyed by current hour window

Before sending an email:

Counter is checked

If limit is exceeded:

Job is re-enqueued into the next hour window

Job is not dropped

This is safe across:

Multiple workers

Multiple instances

Restarts

Worker Concurrency

Configured via:

WORKER_CONCURRENCY=5


BullMQ processes multiple jobs in parallel safely.

Behavior Under Load

If:

1000 emails are scheduled at roughly the same time

Hourly limit is 200

Then:

First 200 are sent

Remaining 800 are deferred to subsequent hour windows

Order is preserved as much as possible

No jobs are dropped

Frontend Features
Authentication

Real Google OAuth login

Protected dashboard

Logout

Dashboard

Sidebar + top bar

Tabs:

Scheduled Emails

Sent Emails

Auto-refresh every 5 seconds

Compose Campaign

Subject and body

CSV upload or manual email entry

Start time

Delay between emails

Hourly limit

Lists

Scheduled emails list

Sent emails list

Status and timestamps

Backend APIs

POST /campaign

POST /campaign/from-csv

GET /campaign/scheduled

GET /campaign/sent

Demo Video

The demo video shows:

Creating a campaign

Viewing scheduled emails

Emails being sent

Restarting the server and showing:

Jobs continue correctly

No duplicates

Features Checklist
Backend

Persistent scheduler using BullMQ

No cron jobs

PostgreSQL persistence

Redis-backed rate limiting

Concurrency-safe workers

Restart-safe

No duplicate sends

Frontend

Google login

Dashboard

Compose screen

Scheduled list

Sent list

Assumptions and Trade-offs

Ethereal is used instead of real SMTP

UI focuses on functionality over pixel-perfect design

Rate limiting is global (not per sender)

CSV parsing assumes one email per row

Final Notes

This project focuses on system correctness, reliability, and real-world behavior, not just a demo.

It demonstrates:

Queue-based scheduling

Persistence

Distributed rate limiting

Restart safety

Production-style backend design
