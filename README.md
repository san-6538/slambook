# Slambook

Create personalized, emotional digital "slambooks" (friendship memory books). Build your own set
of questions, share a link, and let friends fill it out — they get back a beautiful, self-contained
keepsake file (photos embedded, nothing uploaded to a server).

## Stack
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4, Framer Motion, lucide-react
- MongoDB via Mongoose (text answers only — photos never leave the device)

## Getting started

1. Provide a MongoDB connection (local Docker, or set `MONGODB_URI` in `.env.local` for MongoDB Atlas):

   ```bash
   docker run -d --name slambook-mongo -p 27017:27017 -v slambook-data:/data/db mongo:7
   ```

2. Run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

## How it works
- **/create → /questions** — name yourself, pick 10–30 questions (curated or custom), generate a share link.
- **/share** — copy the `/fill/<id>` link and send it to friends.
- **/fill/[id]** — a friend answers and adds photos; on submit they download a self-contained HTML
  keepsake (photos embedded, never uploaded) to send back to you.
- **Dashboard** — your filled slambooks. Import the file a friend sent to recover its photos
  (stored only in your browser), view a slambook, delete entries, or merge everything into one PDF.

## Privacy & cost
Photos are never stored on the server or in the database — they live only on the device and inside
the downloadable keepsake file. The app is designed to run entirely on free tiers (Vercel + MongoDB Atlas M0).
