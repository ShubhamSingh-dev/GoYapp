export interface WebSocketMessage {
  type: string;
  payload: any;
  roomId?: string;
  userId?: string;
}

export interface SignalingMessage extends WebSocketMessage {
  type: "offer" | "answer" | "ice-candidate" | "join-room" | "leave-room";
  targetUserId?: string;
  payload: {
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    roomId?: string;
  };
}

export interface ChatMessage extends WebSocketMessage {
  type: "chat-message";
  payload: {
    content: string;
    roomId: string;
    timestamp: number;
    sender?: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
}

export interface RoomUpdate extends WebSocketMessage {
  type: "room-update";
  payload: {
    action: "user-joined" | "user-left" | "user-media-changed";
    userId: string;
    username: string;
    mediaState?: {
      video: boolean;
      audio: boolean;
      screen: boolean;
    };
  };
}

export interface ConnectedUser {
  id: string;
  username: string;
  mediaState: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
}
