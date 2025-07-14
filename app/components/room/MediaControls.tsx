import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/app/hooks/useRoom";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Share,
  Copy,
  Check,
} from "lucide-react";

interface MediaControlsProps {
  mediaState: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  roomId: string;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  mediaState,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  roomId,
}) => {
  const router = useRouter();
  const { leaveCurrentRoom } = useRoom();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLeaveRoom = async () => {
    try {
      await leaveCurrentRoom(roomId);
    } catch (error) {
      console.error("Failed to leave room:", error);
      router.push("/dashboard");
    }
  };

  const handleCopyRoomLink = async () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy room link:", error);
    }
  };

  const handleShareRoom = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={mediaState.video ? "secondary" : "destructive"}
              size="sm"
              onClick={onToggleVideo}
              className="flex items-center space-x-2"
            >
              {mediaState.video ? <Video size={20} /> : <VideoOff size={20} />}
              <span className="hidden sm:inline">
                {mediaState.video ? "Camera On" : "Camera Off"}
              </span>
            </Button>

            <Button
              variant={mediaState.audio ? "secondary" : "destructive"}
              size="sm"
              onClick={onToggleAudio}
              className="flex items-center space-x-2"
            >
              {mediaState.audio ? <Mic size={20} /> : <MicOff size={20} />}
              <span className="hidden sm:inline">
                {mediaState.audio ? "Mic On" : "Mic Off"}
              </span>
            </Button>

            <Button
              variant={mediaState.screen ? "primary" : "outline"}
              size="sm"
              onClick={onToggleScreenShare}
              className="flex items-center space-x-2"
            >
              {mediaState.screen ? (
                <MonitorOff size={20} />
              ) : (
                <Monitor size={20} />
              )}
              <span className="hidden sm:inline">
                {mediaState.screen ? "Stop Share" : "Share Screen"}
              </span>
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareRoom}
              className="flex items-center space-x-2"
            >
              <Share size={20} />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <MessageSquare size={20} />
              <span className="hidden sm:inline">Chat</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Users size={20} />
              <span className="hidden sm:inline">Participants</span>
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveRoom}
              className="flex items-center space-x-2"
            >
              <PhoneOff size={20} />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Share Room Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Room"
        size="md"
      >
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRoomLink}
                className="flex items-center space-x-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={roomId}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center space-x-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Share via:
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: "Join my video room",
                        text: "Join me in this video call room",
                        url: `${window.location.origin}/room/${roomId}`,
                      })
                      .catch((err) => console.error("Error sharing:", err));
                  }
                }}
                className="flex items-center space-x-2"
              >
                <Share size={16} />
                <span>Native Share</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
