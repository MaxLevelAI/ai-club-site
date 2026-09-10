# AI Club registration site

A fast, mobile-first registration page for **AI CLUB — For Student Success**. Students enter their name, 480 number, and personal email, receive an immediate confirmation, see the meeting details, and can open directions. A protected organizer page lists registrations.

Below the fast event flow, a mobile-first “What We’ll Explore” section introduces five AI topics, a first-meeting teaser, and an “I’m In” action that returns visitors to registration or their confirmation. Its text-free visual atlas is stored at `public/ai-topics-atlas.webp` and displayed as optimized crops so phones download one lightweight image instead of separate assets.

## 1. Run the site locally

Requirements: Node.js 22.13 or newer and pnpm.

1. Copy `.env.example` to `.env.local`.
2. Replace `organizer@example.com` with the email used for your ChatGPT account.
3. Run `pnpm install`.
4. Run `pnpm dev`.
5. Open the local URL printed in the terminal.

The local Sites preview provides a test signed-in organizer account automatically.

## 2. How registration storage works

Each submission is stored in a Cloudflare D1 database with:

- the student's name;
- their 480 number;
- their personal email;
- an ISO-8601 registration timestamp;
- a random browser-session key used only to prevent an accidental double submission.

The server database is the registration source of truth. The browser also stores a small `ai-club-registration` flag so the same browser goes straight to the confirmation screen on a return visit. No secret keys are placed in browser code.

The confirmation screen fetches only the total number of registrations from `app/api/registration-count/route.ts`. Student names remain available only on the protected organizer page.

`preExistingRegistrationCount` in `app/config.ts` is added to the live database total so registrations collected outside this website can be represented. It is currently set to `4`, making the displayed total `5` when one online registration exists. Set it to `0` to display only database registrations.

The database setup is isolated in `db/registrations.ts`; the declarative schema is in `db/schema.ts`; the public write endpoint is `app/api/register/route.ts`.

## 3. Configure the database and organizer access

The Sites project declares the logical D1 binding `DB` in `.openai/hosting.json`. During deployment, Sites creates and connects the real free-tier Cloudflare D1 database. The app creates the small registrations table safely on first use, and the generated SQL migration is included with the deployment.

Organizer access uses two server-side checks:

1. the viewer must sign in with ChatGPT;
2. their email must appear in the server-side `ADMIN_EMAILS` allowlist.

Set `ADMIN_EMAILS` as a hosted runtime value before publishing. Multiple organizers can be comma-separated, for example:

`ADMIN_EMAILS=organizer@example.com,advisor@example.com`

Never put this setting or other private values in client-side files.

## 4. View registrations

Open `/admin` on the deployed site. After sign-in, an allowed organizer can see:

- student name;
- 480 number;
- personal email;
- registration date;
- registration time.

The list is never returned by a public API. If `ADMIN_EMAILS` is missing in production, access is denied by default.

## 5. Change the meeting location

Edit `app/config.ts` and replace:

- `venueName`;
- `venueArea`;
- `venueDescription`;
- `address`;
- `googleMapsUrl`;
- `appleMapsUrl`.

Once the exact address is entered, the embedded preview and fallback directions use it. Supplying the exact Google and Apple Maps URLs gives the most precise one-tap experience.

The current destination is Hawkers Windermere at 9100 Conroy Windermere Rd Ste 110, Windermere, FL 34786. The food image comes from the official [Hawkers dining menu](https://eathawkers.com/menus/dining/).

## 6. Change the date and time

Edit `eventDate` and `eventTime` in `app/config.ts`. The organizer table displays timestamps in the `timeZone` configured in the same file.

## 7. Deploy for free

1. Confirm the production values for the address, map links, date, and time.
2. Set the hosted `ADMIN_EMAILS` runtime value.
3. Publish the project with OpenAI Sites in Codex.
4. After the first deployment, set `SITE_URL` to the deployed URL and publish once more so shared links use the final absolute preview image URL.

The site uses the free-friendly Sites and Cloudflare D1 setup and does not require a paid third-party database or a browser-exposed API key.

## 8. Get the URL for the poster QR code

After deployment succeeds, Sites returns the final public URL. Open it in a private/incognito window to confirm the registration screen, then paste that exact URL into a QR-code generator. Print and test the QR code with both an iPhone and an Android phone before distributing the poster.

## Useful project locations

- Club and event settings: `app/config.ts`
- Student experience: `app/club-experience.tsx`
- Registration endpoint: `app/api/register/route.ts`
- Protected organizer list: `app/admin/page.tsx`
- Database setup: `db/registrations.ts`
- Database schema: `db/schema.ts`
