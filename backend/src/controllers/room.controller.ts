import { Response } from "express";
import { RoomService } from "../services/room.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class RoomController {
  private roomService = new RoomService();

  createRoom = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const room = await this.roomService.createRoom(
        req.user!.userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: { room },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create room",
      });
    }
  };

  getUserRooms = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const rooms = await this.roomService.getUserRooms(req.user!.userId);

      res.json({
        success: true,
        data: { rooms },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch rooms",
      });
    }
  };

  getRoomById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      const room = await this.roomService.getRoomById(roomId);

      if (!room) {
        res.status(404).json({
          success: false,
          message: "Room not found",
        });
        return;
      }

      // Check if user has access to room
      const hasAccess = await this.roomService.validateRoomAccess(
        req.user!.userId,
        roomId
      );
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      res.json({
        success: true,
        data: { room },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch room",
      });
    }
  };

  joinRoom = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      await this.roomService.joinRoom(req.user!.userId, roomId);

      res.json({
        success: true,
        message: "Joined room successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to join room",
      });
    }
  };

  joinRoomByCode = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { inviteCode } = req.body;
      const room = await this.roomService.getRoomByInviteCode(inviteCode);

      if (!room) {
        res.status(404).json({
          success: false,
          message: "Invalid invite code",
        });
        return;
      }

      await this.roomService.joinRoom(req.user!.userId, room.id);

      res.json({
        success: true,
        message: "Joined room successfully",
        data: { room },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to join room",
      });
    }
  };

  leaveRoom = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      await this.roomService.leaveRoom(req.user!.userId, roomId);

      res.json({
        success: true,
        message: "Left room successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to leave room",
      });
    }
  };

  deleteRoom = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      await this.roomService.deleteRoom(roomId, req.user!.userId);

      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || "Failed to delete room",
      });
    }
  };

  updateRoom = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      const room = await this.roomService.updateRoom(
        roomId,
        req.user!.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Room updated successfully",
        data: { room },
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || "Failed to update room",
      });
    }
  };

  getRoomMessages = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await this.roomService.getRoomMessages(
        roomId,
        req.user!.userId,
        Number(limit),
        Number(offset)
      );

      res.json({
        success: true,
        data: { messages },
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || "Failed to fetch messages",
      });
    }
  };

  updateParticipantRole = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { roomId, participantId } = req.params;
      const { role } = req.body;

      await this.roomService.updateParticipantRole(
        roomId,
        req.user!.userId,
        participantId,
        role
      );

      res.json({
        success: true,
        message: "Participant role updated successfully",
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || "Failed to update participant role",
      });
    }
  };
}
