# livekit-token-server

LiveKit token API + browser viewer (from Tushar’s LiveKitLocal bundle), ready for GCP.

**Not** the VRAS WebRTC stack (8081 / 3002). This is a separate LiveKit path for Unity + browser tests.

## What runs where

| Service | Default port | Notes |
|--------|--------------|--------|
| LiveKit server | 7880 (WS), 7881 (TCP), UDP 50000–60000 | Docker (`docker-compose.yml`) |
| This app (token + `viewer.html`) | 3010 | PM2 / `npm start` |

Port **3000** is reserved for Tushar’s WebRTC viewer — do not use it here.

## Local

```bash
cp .env.example .env
npm install
npm start
```

Open [http://localhost:3010/viewer.html](http://localhost:3010/viewer.html) (LiveKit must be running on 7880).

## GCP

1. Open firewall: TCP **7880**, **7881**, **3010**; UDP **50000–60000**.
2. Clone repo, `npm install`, copy `.env` from `.env.example` and set `LIVEKIT_WS_URL`.
3. Start LiveKit: `docker compose up -d` (from repo root; needs Docker + `network_mode: host` on Linux).
4. PM2:  
   `pm2 start server.js --name livekit-app --cwd /path/to/livekit-token-server`  
   (set env in `ecosystem` or `pm2 start` with `--update-env` after exporting vars from `.env`).

## API

- `POST /token` — body: `{ "identity", "roomName?" }` → `{ token, serverUrl, roomName }`
- `GET /health` — sanity check
- `GET /viewer.html` — browser viewer (`?room=unity-test-room` optional)

## Tushar (short)

- LiveKit: `LIVEKIT_WS_URL` from your `.env` (e.g. `ws://104.154.136.189:7880`)
- API key / secret: same as `livekit/livekit.yaml` and `.env`
- Room: `unity-test-room` (default)
- Token: `POST http://<host>:3010/token`
- Viewer: `http://<host>:3010/viewer.html`