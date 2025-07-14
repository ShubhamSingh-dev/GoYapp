import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store/store";
import { WebSocketClient } from "@/app/lib/websocket";
import { addMessage, setTyping } from "@/app/store/chatSlice";
import { addParticipant, removeParticipant } from "@/app/store/roomSlice";
import { SignalingMessage } from "../types/websocket";

export const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const wsRef = useRef<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token && user) {
      const ws = new WebSocketClient(token);
      wsRef.current = ws;

      //Set up message handlers
      ws.on("chat-message", (data) => dispatch(addMessage(data)));

      ws.on("user-joined", (data) =>
        dispatch(
          addParticipant({ roomId: data.roomId, participant: data.participant })
        )
      );

      ws.on("user-left", (data) =>
        dispatch(
          removeParticipant({ roomId: data.roomId, userId: data.userId })
        )
      );

      ws.on("typing-started", (data) =>
        dispatch(
          setTyping({
            roomId: data.roomId,
            userId: data.userId,
            isTyping: true,
          })
        )
      );

      ws.on("typing-stopped", (data) =>
        dispatch(
          setTyping({
            roomId: data.roomId,
            userId: data.userId,
            isTyping: false,
          })
        )
      );

      ws.connect()
        .then(() => setIsConnected(true))
        .catch((error) => console.error("WebSocket connection error:", error));

      return () => {
        ws.disconnect();
        setIsConnected(false);
      };
    }
  }, [token, user, dispatch]);

  const sendMessage = (roomId: string, content: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendChatMessage(roomId, content);
    }
  };

  const joinRoom = (roomId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.joinRoom(roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.leaveRoom(roomId);
    }
  };

  const sendSignalingMessage = (
    targetUserId: string,
    type: SignalingMessage["type"],
    payload: any
  ) => {
    if (wsRef.current && isConnected) {
      wsRef.current.sendSignalingMessage(targetUserId, type, payload);
    }
  };

  const updateMediaState = (mediaState: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  }) => {
    if (wsRef.current && isConnected) {
      wsRef.current.updateMediaState(mediaState);
    }
  };

  return {
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendSignalingMessage,
    updateMediaState,
    ws: wsRef.current,
  };
};
