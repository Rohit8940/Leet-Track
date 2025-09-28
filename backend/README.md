# Leet-Track Backend

Express + MongoDB API that stores LeetCode questions per user and enforces the 3-7-15 review cadence. Each request must include a valid Clerk session token (JWT) in the Authorization header.

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or hosted)
- A Clerk application with Secret Key + Publishable Key

## Environment variables

Create a .env file in this directory based on .env.example:

`ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/leet-track
MONGO_DB_NAME=leet-track
CLIENT_ORIGIN=http://localhost:5173
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
`

- CLIENT_ORIGIN accepts a comma-separated list for CORS allowed origins.
- CLERK_SECRET_KEY is used by @clerk/express to validate session tokens.

## Installation

`ash
npm install
`

## Development

`ash
npm run dev
`

The server connects to MongoDB and listens on PORT (defaults to 5000).

## Production

`ash
npm run start
`

## API Overview

All routes require a bearer token obtained from Clerk on the frontend.

### GET /api/questions
Returns the authenticated user\'s questions sorted by ddedOn (newest first).

### POST /api/questions
Body:
`json
{
  "url": "https://leetcode.com/problems/two-sum/"
}
`
Creates a question, infers the slug/title from the URL, and seeds review checkpoints at +3, +7, +15 days. Duplicate slugs per user return HTTP 409.

### PATCH /api/questions/:id/reviews/:type
Toggles the completion state for a review (e.g. day3, day7, day15). Rejects attempts to mark a review before its due date.

## Health check

GET /health ? { "status": "ok" }

## Error handling

Errors return JSON bodies with an error code and human-readable message. Server-side logs emit to stdout/stderr for hosting platforms to capture.
