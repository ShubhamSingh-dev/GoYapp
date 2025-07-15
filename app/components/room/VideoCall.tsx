import { useEffect, useRef, useState } from "react";
import { useWebRTC } from "@/app/hooks/useWebRTC";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { MediaControls } from "./MediaControls";
import { ParticipantsList } from "./ParticipantsList";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
} from "lucide-react";

export const VideoCall: React.FC = () => {
  const { currentRoom } = useSelector((state: RootState) => state.room);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    localStream,
    remoteStreams,
    mediaState,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    cleanup,
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (currentRoom && user && !isInitialized) {
      initializeMedia()
        .then(() => {
          setIsInitialized(true);
        })
        .catch((error) => {
          console.error("Failed to initialize media:", error);
        });
    }

    return () => {
      cleanup();
    };
  }, [currentRoom, user, isInitialized, initializeMedia, cleanup]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    // Update participants based on remote streams
    const newParticipants = new Map();
    remoteStreams.forEach((stream, userId) => {
      newParticipants.set(userId, {
        userId,
        stream,
        // Add more participant info here
      });
    });
    setParticipants(newParticipants);
  }, [remoteStreams]);

  const handleToggleVideo = () => {
    toggleVideo();
  };

  const handleToggleAudio = () => {
    toggleAudio();
  };

  const handleToggleScreenShare = () => {
    if (mediaState.screen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No room selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Grid Layout for Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              You {!mediaState.video && "(Camera off)"}
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              {!mediaState.video && (
                <div className="bg-red-500 p-1 rounded">
                  <VideoOff size={16} className="text-white" />
                </div>
              )}
              {!mediaState.audio && (
                <div className="bg-red-500 p-1 rounded">
                  <MicOff size={16} className="text-white" />
                </div>
              )}
              {mediaState.screen && (
                <div className="bg-green-500 p-1 rounded">
                  <Monitor size={16} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <RemoteVideoComponent
              key={userId}
              userId={userId}
              stream={stream}
            />
          ))}

          {/* Placeholder for empty slots */}
          {Array.from({ length: Math.max(0, 8 - remoteStreams.size - 1) }).map(
            (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <div className="text-gray-500 text-center">
                  <Video size={48} className="mx-auto mb-2" />
                  <p className="text-sm">Waiting for participant...</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Participants List (Sidebar) */}
        <ParticipantsList roomId={currentRoom.id} />
      </div>

      {/* Media Controls */}
      <MediaControls
        mediaState={mediaState}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onToggleScreenShare={handleToggleScreenShare}
        roomId={currentRoom.id}
      />
    </div>
  );
};

interface RemoteVideoComponentProps {
  userId: string;
  stream: MediaStream;
}

const RemoteVideoComponent: React.FC<RemoteVideoComponentProps> = ({
  userId,
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        User {userId.slice(0, 8)}
      </div>
    </div>
  );
};
