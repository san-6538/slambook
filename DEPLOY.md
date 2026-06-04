# Deploying Slambook (free tier, $0)

The code is ready. To go live you only need to create three free accounts (MongoDB Atlas,
Google OAuth, GitHub OAuth) and a Vercel project, then paste the credentials as environment
variables. Nothing here costs money within the free tiers.

---

## 1. MongoDB Atlas (free database)
1. Create a free account at https://www.mongodb.com/cloud/atlas → create an **M0** (free) cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → Add IP `0.0.0.0/0` (Vercel uses dynamic IPs on the free tier).
4. **Connect → Drivers** → copy the SRV connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/slambook?retryWrites=true&w=majority`
   (add `/slambook` before the `?` so it uses the `slambook` database).
5. This becomes the `MONGODB_URI` env var. No code change — `lib/mongodb.ts` already reads it.

## 2. Google OAuth (free)
1. https://console.cloud.google.com → create a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name + your email → save.
3. **Credentials → Create Credentials → OAuth client ID → Web application.**
4. **Authorized redirect URIs** — add both:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-APP.vercel.app/api/auth/callback/google`  *(add after step 4 below, once you know the URL)*
5. Copy the **Client ID** → `AUTH_GOOGLE_ID`, **Client secret** → `AUTH_GOOGLE_SECRET`.

## 3. GitHub OAuth (free)
GitHub allows one callback URL per app, so make **two** apps (or just one for prod):
- https://github.com/settings/developers → **New OAuth App.**
- **Local app** — Homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`.
- **Prod app** — Homepage `https://YOUR-APP.vercel.app`, callback `https://YOUR-APP.vercel.app/api/auth/callback/github`.
- Copy **Client ID** → `AUTH_GITHUB_ID`, generate a **Client secret** → `AUTH_GITHUB_SECRET`.

## 4. Vercel (free hosting)
1. Push this repo to GitHub.
2. https://vercel.com → **New Project** → import the repo (framework auto-detected as Next.js).
3. Before deploying, add **Environment Variables** (Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `AUTH_SECRET` | the value already in your local `.env.local` (or run `openssl rand -base64 33`) |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | from step 2 |
   | `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | from step 3 (prod app) |
   | `MONGODB_URI` | from step 1 |
   | `AUTH_TRUST_HOST` | `true` |

4. Deploy. Note the assigned `https://YOUR-APP.vercel.app` URL, then go back and add that exact URL
   to the Google (step 2.4) and GitHub (step 3) redirect URIs.
5. Redeploy if you changed the URIs. Sign in — done.

---

## Local development with sign-in
Your `.env.local` already has `AUTH_SECRET` and `MONGODB_URI`. To test real sign-in locally, paste the
Google/GitHub **local** credentials into `.env.local` and restart `npm run dev`. (Until then, the app
runs fine but the sign-in buttons won't complete.)

## Notes
- **Photos are never uploaded** — they live only in the friend's keepsake file and (after you import it)
  in your browser's IndexedDB. So recovered photos are per-device by design; text/answers sync via Atlas.
- Rotating `AUTH_SECRET` signs everyone out — set it once.
- Free-tier limits: Atlas M0 = 512MB (text-only entries are tiny), Vercel Hobby = non-commercial + 100GB/mo bandwidth.
