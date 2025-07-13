export interface Room {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  maxUsers: number;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    email: string;
  };
  participants: Participant[];
  _count: {
    participants: number;
    messages: number;
  };
}

export interface Participant {
  id: string;
  joinedAt: Date;
  role: "OWNER" | "MODERATOR" | "MEMBER";
  status: "ACTIVE" | "INACTIVE" | "DISCONNECTED";
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateRoomData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxUsers?: number;
}

export interface RoomState {
  room: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: number;
  roomId: string;
}
