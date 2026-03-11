import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
  } catch {
    return null;
  }
}