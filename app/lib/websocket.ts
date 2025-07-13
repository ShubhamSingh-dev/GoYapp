import { WS_BASE_URL } from "@/app/utils/constants";
import { WebSocketMessage, SignalingMessage } from "@/app/types/websocket";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(token: string) {
    this.token = token;
    this.url = `${WS_BASE_URL}?token=${token}`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect().catch(console.error);
      }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  on(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  off(type: string) {
    this.messageHandlers.delete(type);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  joinRoom(roomId: string) {
    this.send({
      type: "join-room",
      payload: { roomId },
    });
  }

  leaveRoom(roomId: string) {
    this.send({
      type: "leave-room",
      payload: { roomId },
    });
  }

  sendChatMessage(roomId: string, content: string) {
    this.send({
      type: "chat-message",
      payload: { roomId, content, timestamp: Date.now() },
    });
  }

  sendSignalingMessage(
    targetUserId: string,
    type: SignalingMessage["type"],
    payload: SignalingMessage["payload"]
  ) {
    const message: SignalingMessage = {
      type,
      targetUserId,
      payload,
    };
    this.send(message);
  }

  updateMediaState(mediaState: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  }) {
    this.send({
      type: "media-state-changed",
      payload: mediaState,
    });
  }
}
