"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

// 🔥 helper delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUser() {
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

  if (!user) {
    notFound();
  }
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      provider_id: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    provider_id: user.provider_id,
  }));
}

export async function getUserById(userID: string) {
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

  if (!user) {
    notFound();
  }
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const userData = await prisma.user.findUnique({
    where: { id: userID },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      provider_id: true,
    },
  });

  return userData;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    redirect("/login");
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
}


export async function updateUser(
  userID: string,
  displayName: string,
  role: string,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;



  if (!token) {
    redirect("/login");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);

  const currentUser = await prisma.user.findUnique({
    where: { id: payload.userId as string },
  });

  if (!currentUser) {
    notFound();
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    notFound();
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userID },
  });

  if (!targetUser) {
    notFound();
  }

  /* ---------------- ROLE HIERARCHY ---------------- */

  const roleLevel: Record<string, number> = {
    ANONYMOUS: 0,
    VIEWER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  const currentLevel = roleLevel[currentUser.role];
  const targetLevel = roleLevel[targetUser.role];
  const newRoleLevel = roleLevel[role];

  // 🚨 ห้ามแก้ role ตัวเอง
  if (currentUser.id === userID && role !== currentUser.role) {
    throw new Error("You cannot change your own role.");
  }

  // 🚨 ห้ามแก้ user ที่ role สูงกว่า
  if (targetLevel > currentLevel) {
    throw new Error("You cannot modify a user with higher role.");
  }

  // 🚨 ห้ามตั้ง role สูงกว่าตัวเอง
  if (newRoleLevel > currentLevel) {
    throw new Error("You cannot assign a role higher than your own.");
  }

  /* ---------------- UPDATE ---------------- */

  await prisma.user.update({
    where: { id: userID },
    data: {
      displayName,
      role: role as UserRole,
    },
  });

  return {
    success: true,
    message: "User updated successfully",
  };
}

export async function CreateUser(data: any) {
  
  const user = await prisma.user.create({
    data: {
      provider_id: data.provider_id,
      username: data.username.toLowerCase(),
      displayName: data.displayName,
      email: data.email || null,
      password: data.password || null,
      role: data.role,
    },
  });

  return {
    message: "User created successfully",
    user,
  };
}