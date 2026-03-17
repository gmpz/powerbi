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

export async function getUserDefaultRole() {
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

 const userDefualtRole = await prisma.user.findMany({
  where: {
    defaultRoles: {
      some: {}
    }
  },
  include: {
    defaultRoles: {
      include: {
        mainRole: {
          select: {
            id: true,
            name: true,
          }
        },
        subRole: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  }
});


  return userDefualtRole;
}

export async function getAvailableUserDefaultRole() {
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

 const userDefualtRole = await prisma.user.findMany({
  where: {
    defaultRoles: {
      none: {}
    },
    
  },
  select:{
    id:true,
    displayName:true,
    role:true
  }
});


  return userDefualtRole;
}

/* ------------------ MainRole ของ Dashboard ------------------ */
export async function getDefaultMainRoles() {
  const roles = await prisma.mainRole.findMany({
    where: {
      type:"SYSTEM",
      status: "ACTIVE",
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return roles;
}


/* ------------------ MainRole ของ Dashboard ------------------ */
export async function insertUserDefaultRole(userId : string, data : {
    userId: string;
    mainRoleId: string;
    subRoleId?: string | undefined;
}) {
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
  
  
  await prisma.defaultRole.create({
    data : {
      userId,
      mainRoleId: data.mainRoleId,
      subRoleId: data.subRoleId || null,
      createdBy: user.id
    }
  });


  return {
    success: true,
    message: "User updated successfully",
  };
}


export async function DelUserDefualtRole(id: string) {
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
  if (user.role !== "SUPER_ADMIN") {
    notFound();
  }

  await prisma.defaultRole.deleteMany({
    where: { userId: id },
  });

  return {
    success: true,
    message: "deleted successfully",
  };
}

export async function updateDefualtRole(dashId : string, data : {
    dashboardId: string;
    mainRoleId: string;
    subRoleId?: string | undefined;
    status: "ACTIVE" | "INACTIVE"
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect("/login");
  }
  console.log("dashId -> ", dashId);
  console.log("data -> ", data);
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

  
  
  
  await prisma.defaultRole.update({
    where : { id : dashId},
    data : {
      mainRoleId: data.mainRoleId,
      subRoleId: data.subRoleId || null,
      updatedBy: user.id,
      status: data.status
    }
  })


  return {
    success: true,
    message: "User updated successfully",
  };
}









