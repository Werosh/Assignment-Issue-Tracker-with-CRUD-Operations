import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
  sub: string;
}

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signToken(userId: unknown, secret: string): Promise<string> {
  const sub = String(userId);
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key(secret));
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, key(secret), { algorithms: ["HS256"] });
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub };
}
