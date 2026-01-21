
# 📬 ReachInbox-Style Email Scheduler

A production-style **email scheduling system** with a modern dashboard.  
It supports **delayed scheduling**, **rate limiting**, **CSV uploads**, and **persists jobs across restarts** using **BullMQ + Redis**.

---

## ✨ Features

### Backend
- Node.js + TypeScript + Express
- PostgreSQL + Prisma
- Redis + BullMQ (no cron jobs)
- Nodemailer + Ethereal (test SMTP)
- Campaign scheduling with:
  - Start time
  - Delay between emails
  - Hourly rate limit (per campaign)
- CSV upload or manual recipients
- Persistent jobs (survive restarts)
- Worker updates status: `PENDING → SENT / FAILED`
- Re-enqueue when rate limit is hit
- APIs:
  - `POST /campaign/create`
  - `POST /campaign/from-csv`
  - `GET /campaign/scheduled`
  - `GET /campaign/sent`

### Frontend
- Next.js (App Router) + TypeScript + Tailwind
- Google OAuth via NextAuth
- Protected dashboard
- Sidebar + Topbar + Inbox-style list
- Scheduled / Sent tabs
- Auto refresh every 5 seconds
- Full-page Compose screen
- CSV upload or manual email entry
- Proper login / logout flow

---

## 🧱 Architecture

- **PostgreSQL** → persistent storage for campaigns & emails
- **Redis** → queue + rate limit counters
- **BullMQ** → delayed job scheduling
- **Worker** → sends emails & updates DB
- **Next.js** → dashboard UI
- **NextAuth** → Google login

---

## 🐳 Infrastructure (Recommended)

We recommend using Docker for Postgres & Redis.

Create a `docker-compose.yml` at project root:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: email-postgres
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: email_scheduler
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    container_name: email-redis
    ports:
      - "6379:6379"
```

Start them:

```bash
docker compose up -d
```

---

## ⚙️ Backend Setup

```bash
cd Backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

### Backend `.env.example`

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/email_scheduler
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=4000
```

---

## 🌐 Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Frontend `.env.example`

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some-random-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🔐 Google OAuth Setup

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth Client ID (Web)
3. Add redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

4. Copy Client ID & Secret into `frontend/.env.local`

---

## ▶️ Running The App

Open two terminals:

### Terminal 1 (Backend)
```bash
cd Backend
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🧪 How To Use

1. Login with Google
2. Click **Compose**
3. Enter:
   - Subject
   - Body
   - Recipients (or upload CSV)
   - Start time
   - Delay
   - Hourly limit
4. Schedule campaign
5. Watch:
   - Emails appear in Scheduled
   - Then move to Sent automatically

---

## 🚫 Hard Constraints (Followed)

- ❌ No cron jobs
- ✅ Only BullMQ delayed jobs
- ✅ Persistent across restarts
- ✅ No duplicate sends
- ✅ Redis-backed rate limiting
- ✅ Safe for multiple workers

---

## 📌 Notes

- Ethereal is used for fake SMTP (emails don’t reach real inboxes)
- Check console logs for Ethereal preview links

---

## 🏁 Status

- Backend: ✅ Complete
- Worker: ✅ Complete
- Auth: ✅ Complete
- UI: ✅ Complete
- Scheduler: ✅ Production-style

---

## 👨‍💻 Author

Built as an assignment-style production system demonstrating:
- Job queues
- Rate limiting
- Persistence
- Full-stack integration
