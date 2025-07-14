import { useState } from "react";
import { useRoom } from "@/app/hooks/useRoom";
import { Modal } from "@/app/components/ui/Modal";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinRoomModal = ({ isOpen, onClose }: JoinRoomModalProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const { joinByCode, isLoading } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }

    try {
      await joinByCode(inviteCode.trim());
      onClose();
      setInviteCode("");
    } catch (error: any) {
      setError(error.message || "Failed to join room");
    }
  };

  const handleClose = () => {
    onClose();
    setInviteCode("");
    setError("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Room" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter room invite code"
          disabled={isLoading}
          className="font-mono"
        />

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            Join Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};
