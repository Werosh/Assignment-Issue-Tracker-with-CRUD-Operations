import type { RequestHandler } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { HttpError } from "../middleware/errorHandler";

const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export function createAuthController(jwtSecret: string) {
  const register: RequestHandler = async (req, res) => {
    const body = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      throw new HttpError(409, "An account with this email already exists");
    }
    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      email: body.email.toLowerCase(),
      passwordHash,
      name: body.name,
    });
    const token = signToken(user._id, jwtSecret);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  };

  const login: RequestHandler = async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Invalid email or password");
    }
    const token = signToken(user._id, jwtSecret);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  };

  const me: RequestHandler = async (req, res) => {
    const id = req.userId;
    if (!id) {
      throw new HttpError(401, "Not authenticated");
    }
    const user = await User.findById(id).select("email name").lean();
    if (!user) {
      throw new HttpError(401, "User not found");
    }
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  };

  return { register, login, me };
}
