"use server";

import { cookies } from "next/headers";

import { notFound, redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export async function logout() {
  const cookieStore = await cookies();

  // ลบ cookie
  cookieStore.delete("access_token");

  // redirect ไปหน้า login
  redirect("/login");
}

export async function checkAndRefreshRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
  });

  if (!user) return { role: null };

  // 🔥 อัปเดต token ใหม่ทุกครั้ง (หรือจะเช็คก่อนก็ได้)

  const newToken = await new SignJWT({
    userId: user.id,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);

  cookieStore.set("access_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { role: user.role };
}
