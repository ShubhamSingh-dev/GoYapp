import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Crown,
  MoreVertical,
} from "lucide-react";

interface ParticipantsListProps {
  roomId: string;
}

export const ParticipantsList = ({ roomId }: ParticipantsListProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentRoom } = useSelector((state: RootState) => state.room);

  const participants = currentRoom?.participants || [];

  return (
    <Card className="w-64 h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Participants</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 p-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {participant.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {participant.user.username}
                    {participant.id === user?.id && " (You)"}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {participant.role === "OWNER" && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                    {participant.mediaState?.audio ? (
                      <Mic className="w-3 h-3 text-green-500" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-500" />
                    )}
                    {participant.mediaState?.video ? (
                      <Video className="w-3 h-3 text-green-500" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-red-500" />
                    )}
                    {participant.mediaState?.screen && (
                      <Monitor className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
              <button className="p-1 rounded-md hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
