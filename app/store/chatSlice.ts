import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/app/types/room";

interface ChatState {
  messages: Record<string, Message[]>; // roomId -> messages
  unreadCounts: Record<string, number>;
  isTyping: Record<string, string[]>; // roomId -> userIds
}

const initialState: ChatState = {
  messages: {},
  unreadCounts: {},
  isTyping: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const { roomId } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(action.payload);
    },
    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: Message[] }>
    ) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      delete state.messages[roomId];
      delete state.unreadCounts[roomId];
      delete state.isTyping[roomId];
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
    },
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = 0;
    },
    setTyping: (
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
      const { roomId, userId, isTyping } = action.payload;
      if (!state.isTyping[roomId]) {
        state.isTyping[roomId] = [];
      }

      if (isTyping) {
        if (!state.isTyping[roomId].includes(userId)) {
          state.isTyping[roomId].push(userId);
        }
      } else {
        state.isTyping[roomId] = state.isTyping[roomId].filter(
          (id) => id !== userId
        );
      }
    },
  },
});

export const {
  addMessage,
  setMessages,
  clearMessages,
  incrementUnreadCount,
  resetUnreadCount,
  setTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
