import express from "express";
import expressWs from "express-ws";
import dotenv from "dotenv";
import crypto from 'crypto';
import axios from "axios";
import path from "path";
import WebSocket from 'ws';

dotenv.config();

// Define a custom interface for the extended Express app
interface WsExpress extends express.Express {
  ws: typeof expressWs.prototype.ws;
  getWss: typeof expressWs.prototype.getWss;
}

const app = express() as WsExpress;
const expressPort = parseInt(process.env.PORT || "3456");
const wsInstance = expressWs(app);

// --- UI WebSocket Server Setup ---
// This WebSocket server is for sending log messages from this backend to the browser UI.
const uiClients = new Set<WebSocket>();

app.ws("/ui-updates", (ws: WebSocket, res: express.Request) => {
  uiClients.add(ws);
  console.log("UI WebSocket client connected");
  broadcastToUIClients("New UI client connected to server logs.");

  ws.on("close", () => {
    uiClients.delete(ws);
    console.log("UI WebSocket client disconnected");
  });
  ws.on("error", (error) => console.error("UI WebSocket error:", error));
});
// Function to send a message to all connected browser UI clients
function broadcastToUIClients(logMessage?: string, data?: string) {

  const message = (data !== undefined) ? data : JSON.stringify({
    log: logMessage,
    data: data,
    timestamp: new Date().toISOString(),
  });
  uiClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  // Also log the broadcasted message to the server console
  console.log(`[UI Broadcast] ${logMessage}`, data || "");
}

// --- End UI WebSocket Server Setup ---

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

app.get("/", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});


// Including the Zoom RTMS webhook endpoint
// This endpoint will receive real-time events from Zoom RTMS
// But currently we don't support RTMS in this sample
app.post("/zoom-webhook", async (req: express.Request, res: express.Response) => {
    broadcastToUIClients(
      "Received zoom webhook:" +req.body
    );
    const { event, payload } = req.body;
    console.log("Received Zoom webhook event:", event, "with payload:", payload);

    res.sendStatus(200);
});

// --- WebSocket Server for Recall.ai Bot Connections ---
// This server listens for incoming WebSocket connections from the Recall.ai bot after it has joined a meeting.
// It receives real-time events (audio, video, transcripts) from the bot.
app.ws("/recall-websocket", (ws: WebSocket, res: express.Request) => {
  console.log("Recall WebSocket client connected");
  const connectedMsg =
    "Recall.ai bot connected";
  console.log(connectedMsg);
  broadcastToUIClients(connectedMsg);

  // Handle messages received from a connected Recall.ai bot
  ws.on("message", (message: WebSocket.Data) => {
    console.log("Received message from Recall Bot WebSocket:", message.toString());
    try {
      broadcastToUIClients(undefined, message.toString());
    } catch (e: any) {
      const errorDetails = e.message || e;
      const errMsg =
        "Error parsing message from Recall Bot WebSocket or processing data:";
      console.error(
        errMsg,
        errorDetails,
        message.toString().substring(0, 200) + "..."
      ); // Log more of the message for debugging
      broadcastToUIClients(errMsg);
    }
  });

  ws.on("error", (error) => {
    const errMsg = "Recall Bot WebSocket connection error:";
    console.error(errMsg, error);
    broadcastToUIClients(errMsg + error.message);
  });

  ws.on("close", () => {
    const closeMsg =
      "Recall Bot WebSocket client disconnected (Recall.ai bot disconnected).";
    console.log(closeMsg);
    broadcastToUIClients(closeMsg);
  });
});
// --- End WebSocket Server for Recall.ai Bot Connections ---

// Handle 404
app.use((req, res, next) => {
  res.status(404).send('Sorry, the page you requested could not be found.');
  if (req.path.endsWith("favicon.ico"))
    return;
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  if (req.method == "POST"){
    broadcastToUIClients("Received 404 POST error, this may mean that your Zoom \"Event notification endpoint URL\" is configured for a different path! This sample expects /zoom-webhook");
  }
});

// Start the HTTP server (which also hosts the UI WebSocket server)
app.listen(expressPort, () => {
  const serverStartMsg = `HTTP server with UI WebSocket is running at http://localhost:${expressPort}`;
  console.log(serverStartMsg);
  broadcastToUIClients(serverStartMsg);
});
