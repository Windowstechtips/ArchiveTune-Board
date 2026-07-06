# ArchiveTune Feedback Board

A sleek, responsive feedback and suggestion board for the ArchiveTune community. Built with React, Vite, and Supabase.

## Features

- **Public Pinboard**: View all bugs and suggestions submitted by the community.
- **Upvote System**: Secure, account-tied upvoting system.
- **User Authentication**: Sign up and login functionality using Supabase Auth. Rate-limited to prevent spam.
- **Issue Submission**: Users can submit bugs and suggestions (rate-limited to 3 per day).
- **Admin Dashboard**: Dedicated dashboard for admins to manage issues (mark as open, underway, resolved, or denied), and delete spam.

## Tech Stack

- **Frontend**: React, Vite, React Router, Framer Motion (for animations), Lucide React (for icons)
- **Backend & Database**: Supabase (PostgreSQL, GoTrue for Auth)
- **Styling**: Vanilla CSS with a customized dark-mode design system.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd archivetune-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a new project in [Supabase](https://supabase.com/).
   - Go to the SQL Editor and run the migration files located in the `supabase/migrations/` directory in this order:
     1. `supabase_setup.sql` (Creates base issues table)
     2. `supabase_trigger_fix.sql` (Sets up user profiles & auth triggers)
     3. `supabase_migration_v2.sql` (Adds author relations)
     4. `supabase_admin_fix.sql` (Adds admin roles)
     5. `supabase_migration_votes.sql` (Sets up the votes junction table)
   - To make an account an Admin, find the user in the `profiles` table and set `is_admin` to `TRUE`.

4. **Environment Variables**
   - Rename `.env.example` to `.env`.
   - Fill in your Supabase URL and Anon Key.

5. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment (Netlify)

This project is configured to be deployed easily on Netlify.
1. Connect your GitHub repository to Netlify.
2. The build settings are automatically handled by the `netlify.toml` file (`npm run build`, publish directory `dist`).
3. **IMPORTANT:** Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in your Netlify Site Settings.
