const path = require("path");
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";
const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || "ws://localhost:7880";
const DEFAULT_ROOM = process.env.LIVEKIT_DEFAULT_ROOM || "unity-test-room";
const PORT = parseInt(process.env.PORT || "3010", 10);

app.get("/health", (req, res) => {
  res.json({ ok: true, livekitUrl: LIVEKIT_WS_URL });
});

app.get("/config", (req, res) => {
  res.json({ defaultRoom: DEFAULT_ROOM, livekitUrl: LIVEKIT_WS_URL });
});

app.get("/", (req, res) => {
  res.send("LiveKit token server running. Open /viewer.html for the browser viewer.");
});

app.post("/token", async (req, res) => {
  try {
    const roomName = req.body.roomName || DEFAULT_ROOM;
    const { identity } = req.body;

    if (!identity) {
      return res.status(400).json({ error: "identity is required" });
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: "1h",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      serverUrl: LIVEKIT_WS_URL,
      roomName,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LiveKit token + viewer: http://0.0.0.0:${PORT}`);
  console.log(`LiveKit WebSocket URL for clients: ${LIVEKIT_WS_URL}`);
});