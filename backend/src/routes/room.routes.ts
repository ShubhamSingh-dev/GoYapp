import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { createRoomSchema, updateRoomSchema } from "../utils/validation.utils";

const router = Router();
const roomController = new RoomController();

// All routes require authentication
router.use(authenticateToken);

// Room management
router.post("/", validateRequest(createRoomSchema), roomController.createRoom);
router.get("/", roomController.getUserRooms);
router.get("/:roomId", roomController.getRoomById);
router.put(
  "/:roomId",
  validateRequest(updateRoomSchema),
  roomController.updateRoom
);
router.delete("/:roomId", roomController.deleteRoom);

// Room participation
router.post("/:roomId/join", roomController.joinRoom);
router.post("/:roomId/leave", roomController.leaveRoom);
router.post("/join-by-code", roomController.joinRoomByCode);

// Room content
router.get("/:roomId/messages", roomController.getRoomMessages);
router.post(
  "/:roomId/participants/:participantId/role",
  roomController.updateParticipantRole
);

export default router;