import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/app/store/store";
import {
  fetchRooms,
  createRoom,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  fetchRoom,
  setCurrentRoom,
} from "@/app/store/roomSlice";
import { CreateRoomData } from "@/app/types/room";

export const useRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { room, currentRoom, isLoading, error } = useSelector(
    (state: RootState) => state.room
  );

  const fetchAllRooms = async () => {
    try {
      await dispatch(fetchRooms()).unwrap();
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const createNewRoom = async (roomData: CreateRoomData) => {
    try {
      const room = await dispatch(createRoom(roomData)).unwrap();
      router.push(`/room/${room.id}`);
      return room;
    } catch (error) {
      throw error;
    }
  };

  const joinRoomById = async (roomId: string) => {
    try {
      await dispatch(joinRoom(roomId)).unwrap();
      router.push(`/room/${roomId}`);
    } catch (error) {
      throw error;
    }
  };

  const joinByCode = async (inviteCode: string) => {
    try {
      const room = await dispatch(joinRoomByCode(inviteCode)).unwrap();
      router.push(`/room/${room.id}`);
      return room;
    } catch (error) {
      throw error;
    }
  };

  const leaveCurrentRoom = async (roomId: string) => {
    try {
      await dispatch(leaveRoom(roomId)).unwrap();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to leave room:", error);
      router.push("/dashboard");
    }
  };

  const getRoomById = async (roomId: string) => {
    try {
      const room = await dispatch(fetchRoom(roomId)).unwrap();
      return room;
    } catch (error) {
      throw error;
    }
  };

  const setRoom = (room: any) => {
    dispatch(setCurrentRoom(room));
  };

  return {
    room,
    currentRoom,
    isLoading,
    error,
    fetchAllRooms,
    createNewRoom,
    joinRoomById,
    joinByCode,
    leaveCurrentRoom,
    getRoomById,
    setRoom,
  };
};
