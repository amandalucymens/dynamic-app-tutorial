# Poetry Sharing

A simple poetry sharing website built with Next.js, Tailwind CSS, and InstantDB. Users sign in with magic code (email) authentication and can post poems (title + body). The home page shows all poems from all users, newest first.

## Getting Started

### Prerequisites

- Node.js 18+
- An [InstantDB](https://instantdb.com) account and app (App ID is set in `.env.local`)

### Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root with your InstantDB App ID:

   ```
   NEXT_PUBLIC_INSTANT_APP_ID=your-app-id
   ```

3. Push the schema to your InstantDB app (one-time, or when the schema changes):

   ```bash
   npx instant-cli login
   npx instant-cli init   # if not already linked
   npx instant-cli push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

### InstantDB permissions

In the [InstantDB dashboard](https://instantdb.com/dash) for your app, configure rules so that:

- **Read**: Anyone can read `poems` and the author fields needed for the feed.
- **Write**: Authenticated users can create/update/delete their own poems (e.g. link to `auth.id()`).

## Deploy on Vercel

1. Push your code to a Git repository and [import the project on Vercel](https://vercel.com/new).

2. In the Vercel project **Settings → Environment Variables**, add:
   - **Name**: `NEXT_PUBLIC_INSTANT_APP_ID`
   - **Value**: your InstantDB App ID (e.g. `27410b1e-94a9-4655-8581-7f15b9b5c6a7`)
   - Apply to Production (and Preview if you want).

3. Redeploy. Vercel uses the default Next.js build (`next build`) with no extra configuration.

See [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) for more details.
