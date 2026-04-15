# Vibe

A spatial social app for college campuses — see who's around, what they're up to, and slide into the conversation without the awkward "hey what's up" text.

Built at the Claude Hackathon. The map drops you onto the UW Madison grass quad with a 3D radar of people nearby, little accessory icons showing their vibe (headphones, books, coffee), and mini games to break the ice.

## Features
- 3D people radar on a real campus backdrop
- Accessory icons that hint at what someone's doing
- Mini games to start a convo without the cringe
- Claude-powered chat for casual college-tone replies

## Stack
- **Client**: React + Vite + Tailwind
- **Server**: Node.js + Express, with a Claude API route
- **Data**: local JSON (for now)

## Getting started
```bash
npm install
npm run dev
```

This runs the server and the Vite client together via `concurrently`.

## Structure
- `client/` — Vite frontend (components, assets, radar)
- `server/` — Node backend (`routes/claude.js` handles AI replies)
