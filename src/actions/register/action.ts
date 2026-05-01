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

export async function checkSubmitRegister() {
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

    const register = await prisma.register.findFirst({
        where: {
            userId: user.id,
            status: "PENDING"
        }
    });
    return {
        hasSubmit: !!register,
        status: register?.status || null
    }
}

export async function register(role: "VIEWER" | "EXECUTIVE" , orgCode: string, orgDesc: string) {
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

  

  await prisma.register.create({
    data: {
      userId: user.id,
      role: role,
      orgCode: orgCode,
      orgDesc: orgDesc,
    },
  });
  return {
    success: true,
    message: "Register successfully",
  };
}

export async function getRegisterSubRole() {
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
  
  const subRoles = await prisma.subRole.findMany({
    where: { type: "SYSTEM", status: "ACTIVE" },
    orderBy: { code: "asc" },
  })

  return subRoles;
}



