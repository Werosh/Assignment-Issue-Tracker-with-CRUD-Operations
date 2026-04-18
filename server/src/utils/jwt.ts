import jwt from "jsonwebtoken";
import type { Types } from "mongoose";

export interface JwtPayload {
  sub: string;
}

export function signToken(userId: Types.ObjectId | string, secret: string): string {
  const payload: JwtPayload = { sub: String(userId) };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
