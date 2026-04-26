# WhiteboardCollaboration

A collaborative online whiteboard platform built with a Next.js React client and an Express.js + MongoDB backend. Users can create boards, draw together in real time, save board state, invite collaborators, and manage boards with authentication.

## Project Overview

- **Client**: Next.js `16.2.4`, React `19.2.4`, Tailwind CSS v4, `fabric` canvas, Socket.io client, `axios`, `next-auth`, `next-themes`
- **Server**: Express `4.18.2`, Socket.io `4.7.5`, MongoDB / Mongoose `8.3.0`, JWT auth, `bcryptjs`, `cookie-parser`, `cors`, `dotenv`
- **Core features**:
  - Realtime canvas syncing across connected users
  - User authentication and protected board routes
  - Persistent board data stored in MongoDB
  - Hybrid local + remote canvas storage
  - Invite links for collaborating on a board
  - Theme toggling (light / dark)

## Package Information

### Client package summary

- `client/package.json`
- Scripts:
  - `dev` — start Next.js development server
  - `build` — build the production client
  - `start` — run the production build
  - `lint` — run ESLint checks
- Key dependencies:
  - `next`, `react`, `react-dom`
  - `fabric` for canvas drawing
  - `socket.io-client` for realtime collaboration
  - `axios` for API requests
  - `next-auth` for authentication flows
  - `next-themes` for theme support

### Server package summary

- `server/package.json`
- Scripts:
  - `dev` — start the backend with `nodemon`
  - `start` — start the backend with `node`
- Key dependencies:
  - `express` for API routing
  - `socket.io` for realtime events
  - `mongoose` for MongoDB models
  - `jsonwebtoken` for JWT auth tokens
  - `bcryptjs` for password hashing/comparison
  - `cookie-parser` and `cors` for cookie and cross-origin support
  - `dotenv` for environment variables

## Folder Structure

- `client/` — Next.js frontend application
- `server/` — Express backend API and Socket.io server

## Prerequisites

- Node.js 18+ or later
- npm
- MongoDB instance (local or hosted)

## Environment Variables

### Server

Create a `.env` file inside `server/` with:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/whiteboard
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### Client

Create a `.env.local` file inside `client/` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Setup and Run

### Server

```bash
cd server
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

Open the client at `http://localhost:3000` and verify the backend is reachable at `http://localhost:4000`.

## How it Works

### Authentication

- The server handles `/api/auth/register` and `/api/auth/login`
- Login sets an HTTP-only cookie called `token`
- Protected board routes use auth middleware to validate the token

### Boards

- `GET /api/boards` retrieves boards for the logged-in user
- `POST /api/boards` creates a new board
- `GET /api/boards/:id` retrieves board details and canvas state
- `PUT /api/boards/:id` updates board metadata or canvasState
- Invite links are handled via `POST /api/boards/:id/invite` and `GET /api/boards/join/:token`

### Real-Time Canvas Sync

- Socket.io is used for live canvas updates
- The canvas state is saved locally and synced to the database
- Users on the same board receive real-time drawing events and cursor updates

## API Reference

### Authentication

- `POST /api/auth/register`
  - Body: `{ name, email, password }`
  - Creates a new user and returns authentication data
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns a JWT token in an HTTP-only cookie on success
- `POST /api/auth/logout`
  - Clears the authentication cookie

### Board APIs

- `GET /api/boards`
  - Returns boards available to the authenticated user
- `POST /api/boards`
  - Body: `{ title, isPublic }`
  - Creates a new board for the user
- `GET /api/boards/:id`
  - Fetches board metadata and canvas state
- `PUT /api/boards/:id`
  - Body may include `{ title, canvasState, isPublic }`
  - Updates the board data
- `POST /api/boards/:id/invite`
  - Creates or returns an invite token for sharing access
- `GET /api/boards/join/:token`
  - Validates an invite token and returns the associated board

## Notes

- Ensure `CLIENT_URL` and `NEXT_PUBLIC_API_URL` match the actual client/backend addresses
- The app currently uses simple password comparison in server auth and should be improved before production
- Board canvas state is saved as JSON and loaded with `fabric`

## Troubleshooting

- If authentication fails, verify cookies are enabled and `withCredentials: true` is set on Axios requests
- If MongoDB cannot connect, verify `MONGO_URI` and that the database is running
- If Socket.io fails to connect, verify server CORS `CLIENT_URL` configuration and same protocol/host

## Future Improvements

- Hash passwords instead of comparing plaintext
- Add user profile pages
- Add board deletion and collaborator management UI
- Improve error handling and validation

## License

This project does not include a license file.
