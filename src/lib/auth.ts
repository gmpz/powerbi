import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

const authDebug = process.env.AUTH_DEBUG === "true";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    if (authDebug) {
      console.log("[auth][getCurrentUser] missing access_token");
    }
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (authDebug) {
      console.log("[auth][getCurrentUser] verified token", {
        userId: payload.userId,
        role: payload.role,
      });
    }

    return await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
  } catch (error) {
    if (authDebug) {
      console.error("[auth][getCurrentUser] jwt verify failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
}
