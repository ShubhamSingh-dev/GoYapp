"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useRoom } from "@/app/hooks/useRoom";
import { useWebRTC } from "@/app/hooks/useWebRTC";
import { VideoCall } from "@/app/components/room/VideoCall";
import { ChatPanel } from "@/app/components/room/ChatPanel";
import { ParticipantsList } from "@/app/components/room/ParticipantsList";
import { MediaControls } from "@/app/components/room/MediaControls";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import {
  Users,
  MessageSquare,
  Settings,
  Share2,
  PhoneOff,
  Copy,
  AlertCircle,
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const { user, isAuthenticated } = useAuth();
  const { currentRoom, getRoomById, leaveCurrentRoom, isLoading } = useRoom();
  const {
    mediaState,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    cleanup,
  } = useWebRTC();

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false);

  // Load room data and initialize media
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadRoom = async () => {
      try {
        setIsJoining(true);
        await getRoomById(roomId);
        await initializeMedia();
        setConnectionStatus(true);
      } catch (error) {
        setError("Failed to load room. Please check if the room exists.");
        console.error("Error loading room:", error);
      } finally {
        setIsJoining(false);
      }
    };

    loadRoom();

    return () => {
      cleanup();
    };
  }, [roomId, isAuthenticated]);

  const handleLeaveRoom = async () => {
    try {
      await cleanup();
      await leaveCurrentRoom(roomId || "");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
  };

  const handleShareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${currentRoom?.name || "Room"}`,
        text: `Join me in this video meeting room`,
        url: `${window.location.origin}/room/${roomId}`,
      });
    } else {
      handleCopyRoomLink();
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (mediaState.screen) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  if (isJoining || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to join room
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-medium">
              {currentRoom?.name || "Meeting Room"}
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-300">
                {connectionStatus ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-gray-300 hover:text-white"
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {currentRoom?._count?.participants || 0}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-gray-300 hover:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chat</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareRoom}
              className="text-gray-300 hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveRoom}
              className="ml-2"
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Call Area */}
        <div
          className={`flex-1 flex flex-col ${
            showChat || showParticipants ? "lg:mr-80" : ""
          }`}
        >
          <div className="flex-1 relative">
            <VideoCall />

            {/* Room Info Overlay */}
            {currentRoom && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 text-white">
                <p className="font-medium">{currentRoom.name}</p>
                {currentRoom.description && (
                  <p className="text-sm text-gray-300">
                    {currentRoom.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Media Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <MediaControls
              mediaState={mediaState}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              roomId={roomId}
            />
          </div>
        </div>

        {/* Side Panels */}
        {(showChat || showParticipants) && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-30 lg:relative lg:w-80">
            {/* Panel Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant={showParticipants ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowParticipants(true);
                    setShowChat(false);
                  }}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Participants
                </Button>
                <Button
                  variant={showChat ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowChat(true);
                    setShowParticipants(false);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChat(false);
                  setShowParticipants(false);
                }}
                className="lg:hidden"
              >
                ×
              </Button>
            </div>

            {/* Panel Content */}
            <div className="h-[calc(100%-56px)] overflow-hidden">
              {showParticipants && <ParticipantsList roomId={roomId} />}
              {showChat && <ChatPanel roomId={roomId} />}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Room Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/room/${roomId}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <Button size="sm" onClick={handleCopyRoomLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
