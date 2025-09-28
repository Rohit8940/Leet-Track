# Leet-Track Frontend

Leet-Track is a responsive React dashboard that helps you revisit solved LeetCode problems using the 3-7-15 spaced-repetition cadence. The frontend now relies on a Node/Express API, MongoDB storage, and Clerk for authentication (email/password and Google).

## Prerequisites

- Node.js 18+
- A Clerk application with a publishable key and secret key
- A MongoDB database (local or hosted)

## Environment variables

Create a .env file in this directory based on .env.example:

`ini
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
VITE_API_URL=http://localhost:5000
`

The backend exposes the API on port 5000 by default. Update VITE_API_URL if you change the backend port or deploy the API elsewhere.

## Installation

`ash
npm install
`

## Running the stack locally

1. Configure the backend (see ../backend/README.md) and start it:
   `ash
   cd ../backend
   npm install
   npm run dev
   `
2. In a new terminal, run the frontend dev server:
   `ash
   npm run dev
   `
3. Open the printed Vite URL (default http://localhost:5173). You will be redirected to the Clerk sign-in page. Use the hosted Clerk UI for email/password or Google authentication.

## Production build

`ash
npm run build
npm run preview
`

## Linting

`ash
npm run lint
`

## Key features

- Secure authentication with Clerk (email/password + Google)
- Adds LeetCode problems by URL and stores them per-user in MongoDB
- Auto-schedules 3-, 7-, and 15-day review checkpoints
- Highlights the tasks due today, pending catch-ups, and upcoming reviews
- Full history table showing review status for every tracked problem
