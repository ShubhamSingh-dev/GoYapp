import { useState } from "react";
import { useRoom } from "@/app/hooks/useRoom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

import {
  Users,
  Clock,
  Lock,
  Globe,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
} from "lucide-react";
import { Room } from "@/app/types/room";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

interface RoomCardProps {
  room: Room;
  onDelete?: (roomId: string) => void;
}

export const RoomCard = ({ room, onDelete }: RoomCardProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoomById } = useRoom();

  const handleJoinRoom = async () => {
    setIsJoining(true);
    try {
      await joinRoomById(room.id);
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    // You might want to show a toast notification here
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {room.description && (
              <p className="text-sm text-gray-500 mt-1">{room.description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{room._count.participants || 0} participants</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                Created{" "}
                {formatDistanceToNow(new Date(room.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {room.isPrivate ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            <span>{room.isPrivate ? "Private" : "Public"}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-50 rounded-md p-2">
            <p className="text-sm font-mono text-gray-700">
              Code: {room.inviteCode}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyInviteCode}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleJoinRoom}
            loading={isJoining}
            disabled={isJoining}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Join Room
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(room.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
