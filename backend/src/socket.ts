import { WebSocketServer } from "ws";
import { Server } from "http";
import { WebSocketService } from "./services/websocket.service";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });
  const wsService = new WebSocketService(wss);

  wss.on("connection", (ws, request) => {
    wsService.handleConnection(ws, request);
  });

  return wsService;
}
