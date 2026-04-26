# Client

This folder contains the Next.js frontend for WhiteboardCollaboration.

## Client package information

- `client/package.json`
- Scripts:
  - `npm run dev` — start the Next.js development server
  - `npm run build` — build the client for production
  - `npm start` — run the built production app
  - `npm run lint` — run ESLint checks
- Main dependencies:
  - `next`, `react`, `react-dom`
  - `fabric` for canvas drawing
  - `socket.io-client` for realtime board collaboration
  - `axios` for REST API requests
  - `next-auth` for authentication handling
  - `next-themes` for appearance mode support

## Quick start

```bash
cd client
npm install
npm run dev
```

Refer to the root `README.md` at the project root for the full system overview, backend instructions, and environment settings.
