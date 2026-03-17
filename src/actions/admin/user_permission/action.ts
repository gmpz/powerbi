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


export async function syncUserDashboard() {
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


  // 1. ดึง dashboard ทั้งหมดในระบบ
  const dashboards = await prisma.dashboard.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  // 2. ดึง user ที่มี defaultRole
  const users = await prisma.user.findMany({
  where: {
    defaultRoles: {
      some: {
        status: "ACTIVE", // ✅ filter เฉพาะ active
      },
    },
  },
  include: {
    defaultRoles: {
      where: {
        status: "ACTIVE", // ✅ เอาเฉพาะ active จริงๆ ตอน include
      },
    },
  },
});

  for (const user of users) {
    // 3. dashboard ที่ user มีอยู่แล้ว
    const existing = await prisma.userDashboard.findMany({
      where: { userId: user.id },
      select: { dashboardId: true },
    });

    const existingSet = new Set(existing.map(e => e.dashboardId));

    const toCreate: any[] = [];

    for (const dashboard of dashboards) {
      // ❌ มีแล้ว → ข้าม
      if (existingSet.has(dashboard.id)) continue;

      // 👉 เอา defaultRole ตัวแรก (หรือจะ custom logic ก็ได้)
      const defaultRole = user.defaultRoles[0];

      toCreate.push({
        userId: user.id,
        dashboardId: dashboard.id,
        mainRoleId: defaultRole?.mainRoleId ?? null,
        subRoleId: defaultRole?.subRoleId ?? null,
        status: "ACTIVE",
      });
    }

    // 4. bulk insert
    if (toCreate.length > 0) {
      await prisma.userDashboard.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }
  }


  return {
    success: true,
    message: "updated successfully",
  };
}








