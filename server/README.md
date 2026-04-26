# Server

This folder contains the Express backend API and Socket.io server for WhiteboardCollaboration.

## Server package information

- `server/package.json`
- Scripts:
  - `npm run dev` — start the server with `nodemon`
  - `npm start` — start the server with `node`
- Main dependencies:
  - `express` for building the REST API
  - `socket.io` for realtime board synchronization
  - `mongoose` for MongoDB models and schema validation
  - `jsonwebtoken` for JWT token support
  - `bcryptjs` for secure password hashing/comparison
  - `cookie-parser` and `cors` for request handling and frontend integration
  - `dotenv` for loading environment variables

## Quick start

```bash
cd server
npm install
npm run dev
```

Refer to the root `README.md` at the project root for complete setup, environment configuration, and usage details.
