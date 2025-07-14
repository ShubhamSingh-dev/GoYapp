import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Room, RoomState, CreateRoomData, Participant } from "@/app/types/room";
import api from "@/app/lib/api";

const initialState: RoomState = {
  room: [],
  currentRoom: null,
  isLoading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/rooms");
      return response.data.data.rooms;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (roomData: CreateRoomData, { rejectWithValue }) => {
    try {
      const response = await api.post("/rooms", roomData);
      return response.data.data.room;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create room"
      );
    }
  }
);

export const joinRoom = createAsyncThunk(
  "room/joinRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      const response = await api.get(`/rooms/${roomId}`);
      return response.data.data.room;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join room"
      );
    }
  }
);

export const joinRoomByCode = createAsyncThunk(
  "room/joinRoomByCode",
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/rooms/join-by-code", { inviteCode });
      return response.data.data.room;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join room"
      );
    }
  }
);

export const leaveRoom = createAsyncThunk(
  "room/leaveRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
      return roomId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to leave room"
      );
    }
  }
);

export const fetchRoom = createAsyncThunk(
  "room/fetchRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data.data.room;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch room"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },
    updateRoomParticipants: (
      state,
      action: PayloadAction<{ roomId: string; participants: Participant[] }>
    ) => {
      if (state.currentRoom && state.currentRoom.id === action.payload.roomId) {
        state.currentRoom.participants = action.payload.participants;
      }
    },
    addParticipant: (
      state,
      action: PayloadAction<{ roomId: string; participant: Participant }>
    ) => {
      if (state.currentRoom && state.currentRoom.id === action.payload.roomId) {
        state.currentRoom.participants.push(action.payload.participant);
      }
    },
    removeParticipant: (
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) => {
      if (state.currentRoom && state.currentRoom.id === action.payload.roomId) {
        state.currentRoom.participants = state.currentRoom.participants.filter(
          (p) => p.user.id !== action.payload.userId
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch rooms
    builder.addCase(fetchRooms.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRooms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.room = action.payload;
    });
    builder.addCase(fetchRooms.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create room
    builder.addCase(createRoom.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.isLoading = false;
      state.room.push(action.payload);
    });
    builder.addCase(createRoom.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Join room
    builder.addCase(joinRoom.fulfilled, (state, action) => {
      state.currentRoom = action.payload;
    });
    builder.addCase(joinRoom.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Join room by code
    builder.addCase(joinRoomByCode.fulfilled, (state, action) => {
      state.currentRoom = action.payload;
    });
    builder.addCase(joinRoomByCode.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Leave room
    builder.addCase(leaveRoom.fulfilled, (state, action) => {
      if (state.currentRoom && state.currentRoom.id === action.payload) {
        state.currentRoom = null;
      }
    });

    // Fetch room
    builder.addCase(fetchRoom.fulfilled, (state, action) => {
      state.currentRoom = action.payload;
    });
    builder.addCase(fetchRoom.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  clearError,
  setCurrentRoom,
  updateRoomParticipants,
  addParticipant,
  removeParticipant,
} = roomSlice.actions;
export default roomSlice.reducer;
