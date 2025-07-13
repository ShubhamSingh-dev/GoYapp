import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/jwt.utils";
import {
  WebSocketMessage,
  SignalingMessage,
  ChatMessage,
  ConnectedUser,
} from "../types/websocket.types";

const prisma = new PrismaClient();

export class WebSocketService {
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  async handleConnection(ws: WebSocket, request: any) {
    try {
      // Extract token from query params or headers
      const url = new URL(request.url, `http://${request.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(1008, "Token required");
        return;
      }

      const payload = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });

      if (!user) {
        ws.close(1008, "Invalid token");
        return;
      }

      //store connected user
      const connectedUser: ConnectedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        ws: ws,
        mediaState: {
          video: false,
          audio: false,
          screen: false,
        },
      };

      this.connectedUsers.set(user.id, connectedUser);

      //handle messages
      ws.on("message", (data) => {
        this.handleMessage(user.id, data.toString());
      });

      // Handle disconnection
      ws.on("close", () => {
        this.handleDisconnection(user.id);
      });

      // Send connection confirmation
      this.sendToUser(user.id, {
        type: "connection-established",
        payload: { userId: user.id, username: user.username },
      });
    } catch (error) {
      console.error("Error handling WebSocket connection:", error);
      ws.close(1008, "Error handling WebSocket connection");
    }
  }

  private async handleMessage(userId: string, message: string) {
    try {
      const data: WebSocketMessage = JSON.parse(message);

      switch (data.type) {
        case "join-room":
          await this.handleJoinRoom(userId, data.payload.roomId);
          break;
        case "leave-room":
          await this.handleLeaveRoom(userId, data.payload.roomId);
          break;
        case "offer":
        case "answer":
        case "ice-candidate":
          await this.handleSignaling(userId, data as SignalingMessage);
          break;
        case "chat-message":
          await this.handleChatMessage(userId, data as ChatMessage);
          break;
        case "media-state-changed":
          await this.handleMediaStateChanged(userId, data.payload);
          break;
        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  }

  private async handleJoinRoom(userId: string, roomId: string) {
    try {
      //Verify room exists and user has permission
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { participants: true },
      });

      if (!room) {
        this.sendToUser(userId, {
          type: "error",
          payload: "Room not found",
        });
        return;
      }

      //Add user to room
      await prisma.participant.upsert({
        where: { userId_roomId: { userId, roomId } },
        update: { userId, roomId, status: "ACTIVE" },
        create: { userId, roomId, status: "ACTIVE" },
      });

      //Update users current room
      const user = this.connectedUsers.get(userId);

      if (user) {
        user.currentRoom = roomId;
      }

      //Add to room map
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      this.rooms.get(roomId)!.add(userId);

      //Get other users in room
      const roomUsers = Array.from(this.rooms.get(roomId)!)
        .filter((id) => id !== userId)
        .map((id) => {
          const user = this.connectedUsers.get(id);
          return user
            ? {
                id: user.id,
                username: user.username,
                mediaState: user.mediaState,
              }
            : null;
        })
        .filter(Boolean);

      //Send room joined confrmation
      this.sendToUser(userId, {
        type: "room-joined",
        payload: {
          users: roomUsers,
        },
      });

      //Notify other users in room
      this.broadcastToRoom(
        roomId,
        {
          type: "room-update",
          payload: {
            action: "user-joined",
            userId,
            username: user?.username || "Unknown",
          },
        },
        userId
      );
    } catch (error) {
      console.error("Join room error:", error);
      this.sendToUser(userId, {
        type: "error",
        payload: "Error joining room",
      });
    }
  }

  private async handleLeaveRoom(userId: string, roomId: string) {
    try {
      //Update participant status
      await prisma.participant.updateMany({
        where: { userId, roomId, status: "ACTIVE" },
        data: { status: "DISCONNECTED", leftAt: new Date() },
      });

      //Removefrom room map
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId)!.delete(userId);
        if (this.rooms.get(roomId)!.size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Update user's current room
      const user = this.connectedUsers.get(userId);
      if (user) {
        user.currentRoom = undefined;
      }

      // Notify other users
      this.broadcastToRoom(
        roomId,
        {
          type: "room-update",
          payload: {
            action: "user-left",
            userId,
            username: user?.username || "Unknown",
          },
        },
        userId
      );
    } catch (error) {
      console.error("Leave room error:", error);
    }
  }

  private handleSignaling(userId: string, message: SignalingMessage) {
    const { targetUserId, payload } = message;

    if (!targetUserId) {
      console.warn("Signaling message missing targetUserId");
      return;
    }

    // Forward signaling message to target user
    this.sendToUser(targetUserId, {
      type: message.type,
      payload: {
        ...payload,
        fromUserId: userId,
      },
    });
  }

  private async handleChatMessage(userId: string, message: ChatMessage) {
    try {
      const user = this.connectedUsers.get(userId);
      if (!user || !user.currentRoom) {
        return;
      }

      //Save message to db
      const savedMessage = await prisma.message.create({
        data: {
          content: message.payload.content,
          senderId: userId,
          roomId: user.currentRoom,
          type: "TEXT",
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      //Broadcast message to room
      this.broadcastToRoom(user.currentRoom, {
        type: "chat-message",
        payload: {
          id: savedMessage.id,
          content: savedMessage.content,
          sender: savedMessage.sender,
          timestamp: savedMessage.createdAt.getTime(),
          roomId: user.currentRoom,
        },
      });
    } catch (error) {
      console.error("Chat message error:", error);
    }
  }

  private handleMediaStateChanged(userId: string, mediaState: any) {
    const user = this.connectedUsers.get(userId);
    if (!user || !user.currentRoom) {
      return;
    }

    // Update user's media state
    user.mediaState = { ...user.mediaState, ...mediaState };

    // Broadcast to room
    this.broadcastToRoom(
      user.currentRoom,
      {
        type: "room-update",
        payload: {
          action: "user-media-changed",
          userId,
          username: user.username,
          mediaState: user.mediaState,
        },
      },
      userId
    );
  }

  private handleDisconnection(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (!user || !user.currentRoom) {
      return;
    }

    //leave current room if any
    this.handleLeaveRoom(userId, user.currentRoom);

    //rremove from connected users
    this.connectedUsers.delete(userId);
  }

  private sendToUser(userId: string, message: WebSocketMessage) {
    const user = this.connectedUsers.get(userId);
    if (user && user?.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(
    roomId: string,
    message: WebSocketMessage,
    excludeUserId?: string
  ) {
    const roomUsers = this.rooms.get(roomId);
    if (!roomUsers) return;

    roomUsers.forEach((userId) => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message);
      }
    });
  }

  getRoomUsers(roomId: string): ConnectedUser[] {
    const roomUsers = this.rooms.get(roomId);
    if (!roomUsers) return [];

    return Array.from(roomUsers)
      .map((userId) => this.connectedUsers.get(userId))
      .filter(Boolean) as ConnectedUser[];
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
