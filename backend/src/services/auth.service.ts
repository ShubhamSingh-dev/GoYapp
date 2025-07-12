import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt.utils";

const prisma = new PrismaClient();

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    //check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    //create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    //generate token
    const token = generateToken(user as any);

    return { user, token };
  }

  async Login(data: LoginData) {
    //find user

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    //verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    //generate token
    const token = generateToken(user);

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });
  }
}
