import { useEffect, useRef, useState } from "react";
import { WebRTCClient } from "@/app/lib/webrtc";
import { useWebSocket } from "./useWebSocket";

export const useWebRTC = () => {
  const { ws, sendSignalingMessage, isConnected } = useWebSocket();
  const webRTCRef = useRef<WebRTCClient | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [mediaState, setMediaState] = useState({
    video: true,
    audio: true,
    screen: false,
  });

  useEffect(() => {
    if (ws && isConnected) {
      const webRTC = new WebRTCClient(ws);
      webRTCRef.current = webRTC;

      // Set up remote stream handlers
      webRTC.onRemoteStream((userId, stream) => {
        setRemoteStreams((prev) => new Map(prev).set(userId, stream));
      });

      webRTC.onRemoteStreamRemoved((userId) => {
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });

      // Set up signaling message handlers
      ws.on("offer", async (data) => {
        await webRTC.handleOffer(data.fromUserId, data.sdp);
      });

      ws.on("answer", async (data) => {
        await webRTC.handleAnswer(data.fromUserId, data.sdp);
      });

      ws.on("ice-candidate", async (data) => {
        await webRTC.handleIceCandidate(data.fromUserId, data.candidate);
      });

      ws.on("user-joined", async (data) => {
        // Create offer for new user
        await webRTC.createOffer(data.userId);
      });

      ws.on("user-left", (data) => {
        webRTC.removePeerConnection(data.userId);
      });

      return () => {
        webRTC.cleanup();
      };
    }
  }, [ws, isConnected]);

  const initializeMedia = async () => {
    if (webRTCRef.current) {
      try {
        const stream = await webRTCRef.current.initializeLocalStream();
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error("Failed to initialize media:", error);
        throw error;
      }
    }
  };

  const toggleVideo = (enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !mediaState.video;
    if (webRTCRef.current) {
      webRTCRef.current.toggleVideo(newEnabled);
      setMediaState((prev) => ({ ...prev, video: newEnabled }));
    }
  };

  const toggleAudio = (enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !mediaState.audio;
    if (webRTCRef.current) {
      webRTCRef.current.toggleAudio(newEnabled);
      setMediaState((prev) => ({ ...prev, audio: newEnabled }));
    }
  };

  const startScreenShare = async () => {
    if (webRTCRef.current) {
      try {
        await webRTCRef.current.startScreenShare();
        setMediaState((prev) => ({ ...prev, screen: true }));
      } catch (error) {
        console.error("Failed to start screen share:", error);
        throw error;
      }
    }
  };

  const stopScreenShare = async () => {
    if (webRTCRef.current) {
      try {
        await webRTCRef.current.stopScreenShare();
        setMediaState((prev) => ({ ...prev, screen: false }));
      } catch (error) {
        console.error("Failed to stop screen share:", error);
        throw error;
      }
    }
  };

  const cleanup = () => {
    if (webRTCRef.current) {
      webRTCRef.current.cleanup();
    }
    setLocalStream(null);
    setRemoteStreams(new Map());
  };

  return {
    localStream,
    remoteStreams,
    mediaState,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    cleanup,
  };
};
