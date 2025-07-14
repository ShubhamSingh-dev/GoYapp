import { useState } from "react";
import { useRoom } from "@/app/hooks/useRoom";
import { Modal } from "@/app/components/ui/Modal";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { CreateRoomData } from "@/app/types/room";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: "",
    description: "",
    isPrivate: false,
    maxUsers: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createNewRoom, isLoading } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Room name is required";
    }
    if (formData.maxUsers < 2 || formData.maxUsers > 50) {
      newErrors.maxUsers = "Max participants must be between 2 and 50";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createNewRoom(formData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        maxUsers: 10,
      });
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to create room" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {errors.general}
          </div>
        )}

        <Input
          label="Room Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Enter room name"
          disabled={isLoading}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter room description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Max Participants"
          name="maxUsers"
          type="number"
          value={formData.maxUsers.toString()}
          onChange={handleInputChange}
          error={errors.maxUsers}
          min="2"
          max="50"
          disabled={isLoading}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={isLoading}
          />
          <label htmlFor="isPrivate" className="text-sm text-gray-700">
            Make room private
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};
