import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export interface CreateRoomData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxUsers?: number;
}

export interface RoomWithDetails {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  maxUsers: number;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    email: string;
  };
  participants: Array<{
    id: string;
    joinedAt: Date;
    role: string;
    status: string;
    user: {
      id: string;
      username: string;
      email: string;
      avatar?: string | null;
    };
  }>;
  _count: {
    participants: number;
    messages: number;
  };
}

export class RoomService {
  async createRoom(
    ownerId: string,
    data: CreateRoomData
  ): Promise<RoomWithDetails> {
    const inviteCode = this.generateInviteCode();

    const room = await prisma.room.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate || false,
        maxUsers: data.maxUsers || 10,
        inviteCode,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
    });

    // Add owner as participant
    await prisma.participant.create({
      data: {
        userId: ownerId,
        roomId: room.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    return room;
  }

  async getRoomById(roomId: string): Promise<RoomWithDetails | null> {
    return await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
    });
  }

  async getRoomByInviteCode(inviteCode: string): Promise<RoomWithDetails | null> {
    return await prisma.room.findUnique({
      where: { inviteCode },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
    });
  }

  async getUserRooms(userId: string): Promise<RoomWithDetails[]> {
    return await prisma.room.findMany({
      where: {
        participants: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async joinRoom(userId: string, roomId: string): Promise<void> {
    const room = await this.getRoomById(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    //check if room is full
    if (room._count.participants >= room.maxUsers) {
      throw new Error("Room is full");
    }

    //check if user is already in room
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingParticipant) {
      //Reactivate if inactive
      await prisma.participant.update({
        where: {
          userId_roomId: {
            userId,
            roomId,
          },
        },
        data: {
          status: "ACTIVE",
          leftAt: null,
        },
      });
    } else {
      //Add user new participant
      await prisma.participant.create({
        data: {
          userId,
          roomId,
          role: "MEMBER",
          status: "ACTIVE",
        },
      });
    }
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    await prisma.participant.updateMany({
      where: {
        userId,
        roomId,
        status: "ACTIVE",
      },
      data: {
        status: "INACTIVE",
        leftAt: new Date(),
      },
    });
  }

  async deleteRoom(roomId: string, userId: string): Promise<void> {
    //verify ownership
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room || room.ownerId !== userId) {
      throw new Error("Unauthorized to delete room");
    }

    // Delete room (cascade will handle participants and messages)
    await prisma.room.delete({
      where: { id: roomId },
    });
  }

  async updateRoom(
    roomId: string,
    userId: string,
    data: Partial<CreateRoomData>
  ): Promise<RoomWithDetails> {
    //verify ownership
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room || room.ownerId !== userId) {
      throw new Error("Unauthorized to update room");
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
    });

    return updatedRoom;
  }

  async getRoomMessages(
    roomId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    //verify user has access to room
    const participant = await prisma.participant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!participant) {
      throw new Error("Access denied to room messages");
    }

    return await prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  }

  private generateInviteCode(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  async validateRoomAccess(userId: string, roomId: string): Promise<boolean> {
    const participant = await prisma.participant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    return participant?.status === "ACTIVE";
  }

  async updateParticipantRole(
    roomId: string,
    ownerId: string,
    participantId: string,
    newRole: "MODERATOR" | "MEMBER"
  ): Promise<void> {
    // Verify ownership
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room || room.ownerId !== ownerId) {
      throw new Error("Unauthorized to update participant roles");
    }

    await prisma.participant.updateMany({
      where: {
        userId: participantId,
        roomId,
        status: "ACTIVE",
      },
      data: {
        role: newRole,
      },
    });
  }
}
