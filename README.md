# Dots and Boxes — Client

Next.js frontend for a real-time multiplayer Dots and Boxes game. Talks to the backend entirely over Socket.io, no REST.

**Backend:** [socketio-dots-and-boxes-server](https://github.com/TheIlkinAlizade/socketio-dots-and-boxes-server)

---

## What it does

- Enter a name, create a room or join via code/link — no accounts
- Opening a shared link cold prompts for a name inline instead of redirecting home
- Live lobby: player list, host-only grid size + kick, host starts the game
- Clickable SVG board, lines/boxes colored per player
- Resign, live scores, rematch flow back to a fresh lobby
- Refresh reconnects into the running game via a `sessionStorage` player ID instead of dropping you

## Stack

- Next.js (App Router), TypeScript
- Tailwind CSS
- socket.io-client
- React state only, no external store, no database
- Docker, multi-stage build, `standalone` output

## Setup

```bash
git clone https://github.com/TheIlkinAlizade/nextjs-dots-and-boxes-client.git
cd nextjs-dots-and-boxes-client
cp .env.example .env.local
npm install
npm run dev
```

Runs on `http://localhost:3000`. Needs the [backend](https://github.com/TheIlkinAlizade/socketio-dots-and-boxes-server) running.

### Docker

`NEXT_PUBLIC_SERVER_URL` gets inlined into the JS bundle at build time, so it's a build arg, not a runtime env var:

```bash
docker build --build-arg NEXT_PUBLIC_SERVER_URL=http://localhost:4000 -t dots-and-boxes-client .
docker run -p 3000:3000 dots-and-boxes-client
```

Changing the backend URL later means rebuilding the image.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | URL of the Socket.io backend |

See [`.env.example`](./.env.example).