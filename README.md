# AI Club registration site

A fast, mobile-first registration page for **AI CLUB — For Student Success**. Students enter their name, 480 number, and personal email, receive an immediate confirmation, see the meeting details, and can open directions. A code-protected organizer page lists registrations.

Below the fast event flow, a mobile-first “What We’ll Explore” section introduces five AI topics, a first-meeting teaser, and an “I’m In” action that returns visitors to registration or their confirmation.

This is a standard **Next.js** app that deploys on **Vercel**, using a **Neon Postgres** database for storage.

## 1. Run the site locally

Requirements: Node.js 22.13 or newer and npm.

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to a Neon Postgres connection string (see section 3).
3. Set `ADMIN_CODE` to your private organizer code.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL printed in the terminal.

## 2. How registration storage works

Each submission is stored in a Neon Postgres database with:

- the student's name;
- their 480 number;
- their personal email;
- an ISO-8601 registration timestamp;
- a random browser-session key used only to prevent an accidental double submission.

The server database is the registration source of truth. The browser also stores a small `ai-club-registration` flag so the same browser goes straight to the confirmation screen on a return visit. No secret keys are placed in browser code.

The confirmation screen fetches only the total number of registrations from `app/api/registration-count/route.ts`. Student names remain available only on the code-protected organizer page.

`preExistingRegistrationCount` in `app/config.ts` is added to the live database total so registrations collected outside this website can be represented. It is currently set to `5`, so the displayed total starts at `5` with no online registrations and counts up (6, 7, 8…) as students sign up. Set it to `0` to display only database registrations.

The database setup is isolated in `db/registrations.ts`; the registrations table is created automatically on first use. The public write endpoint is `app/api/register/route.ts`.

## 3. Set up the database (Neon Postgres)

1. Create a free database at [neon.tech](https://neon.tech) — or, from your Vercel project, add the **Neon** integration under **Storage**, which creates the database and sets `DATABASE_URL` for you automatically.
2. Copy the connection string (it looks like `postgresql://user:password@host/dbname?sslmode=require`).
3. Set it as `DATABASE_URL` locally (in `.env.local`) and in Vercel (Project → Settings → Environment Variables).

The app creates the `registrations` table automatically the first time someone registers, so there is no manual migration step.

## 4. Organizer access (the access code)

The `/admin` page is protected by a single private access code. The organizer must enter the code before any registration details are shown.

Set `ADMIN_CODE` as an environment variable, for example:

`ADMIN_CODE=your-private-organizer-code`

Keep this code private and hard to guess — anyone who has it can view every student's details. If `ADMIN_CODE` is missing, `/admin` stays locked for everyone. Never put this value in client-side files.

After entering the code, the organizer sees student name, 480 number, personal email, registration date, and registration time. The list is never returned by a public API.

## 5. Change the meeting location, date, and time

Edit `app/config.ts`:

- location: `venueName`, `venueArea`, `venueDescription`, `address`, `googleMapsUrl`, `appleMapsUrl`;
- date and time: `eventDate`, `eventTime`;
- the organizer table displays timestamps in the `timeZone` set in the same file.

The current destination is Hawkers Windermere at 9100 Conroy Windermere Rd Ste 110, Windermere, FL 34786. The food image comes from the official [Hawkers dining menu](https://eathawkers.com/menus/dining/).

## 6. Deploy on Vercel

1. Push this project to a GitHub repository.
2. In [vercel.com](https://vercel.com), import that repository as a new project (Vercel auto-detects Next.js).
3. Add the **Neon** database integration (Storage tab) or set `DATABASE_URL` manually in Environment Variables.
4. Set `ADMIN_CODE` and `SITE_URL` in Environment Variables.
5. Deploy. After the first deploy, set `SITE_URL` to the final deployed URL and redeploy so shared-link preview images use the absolute URL.

## 7. Get the URL for the poster QR code

After deployment succeeds, open the public URL in a private/incognito window to confirm the registration screen, then paste that exact URL into a QR-code generator. Print and test the QR code with both an iPhone and an Android phone before distributing the poster.

## Useful project locations

- Club and event settings: `app/config.ts`
- Student experience: `app/club-experience.tsx`
- Registration endpoint: `app/api/register/route.ts`
- Code-protected organizer list: `app/admin/page.tsx`
- Organizer access-code logic: `app/admin-auth.ts`
- Database setup: `db/registrations.ts`
