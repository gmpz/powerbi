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

export async function getUserPermissionDashboard(userId: string) {
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

  const userDashboards = await prisma.userDashboard.findMany({
    where : { userId },
    include: {
      dashboard: true,
      mainRole: true,
      subRole: true
    }
  });


  return userDashboards;
}


/* ------------------ Dashboard ที่ user ยังไม่ได้ใช้ ------------------ */
export async function getAvailableDashboards(userId: string) {
  const dashboards = await prisma.dashboard.findMany({
    where: {
      status: "ACTIVE",
      users: {
        none: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return dashboards;
}

/* ------------------ MainRole ของ Dashboard ------------------ */
export async function getMainRoles(dashboardId: string) {
  const roles = await prisma.mainRole.findMany({
    where: {
      OR: [
        { type: "SYSTEM" },
        { dashboardId: dashboardId }
      ],
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


/* ------------------ SubRole ของ MainRole ------------------ */
export async function getSubRoles(mainRoleId: string) {
  const roles = await prisma.subRole.findMany({
    where: {
      mainRoleId,
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

export async function insertDashboardPermission(userId : string, data : {
    dashboardId: string;
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
  
  
  await prisma.userDashboard.create({
    data : {
      userId,
      dashboardId : data.dashboardId,
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

export async function updateDashboardPermission(dashId : string, data : {
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

  
  
  await prisma.userDashboard.update({
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

export async function updateDashboardMainRole(roleId : string, data : {
    name: string;
    status: "ACTIVE" | "INACTIVE";
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


  
  await prisma.mainRole.update({
    where : { id : roleId},
    data : {
      name: data.name,
      status: data.status,
      updatedBy: user.id
    }
  })


  return {
    success: true,
    message: "updated successfully",
  };
}

export async function updateDashboardSubRole(roleId : string, data : {
    name: string;
    status: "ACTIVE" | "INACTIVE";
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


  
  await prisma.subRole.update({
    where : { id : roleId},
    data : {
      name: data.name,
      status: data.status,
      updatedBy: user.id
    }
  })


  return {
    success: true,
    message: "updated successfully",
  };
}


export async function DelUserDashboard(id : string, userId: string) {
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
  
  await prisma.userDashboard.delete({
    where : {id, userId}
  })


  return {
    success: true,
    message: "deleted successfully",
  };
}


export async function DelUser(id: string) {
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

  // ❌ ห้ามลบตัวเอง
  if (currentUser.id === id) {
    return { success: false, message: "Cannot delete yourself" };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    return { success: false, message: "User not found" };
  }

  const roleLevel: Record<string, number> = {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    VIEWER: 1,
  };

  const currentLevel = roleLevel[currentUser.role] || 0;
  const targetLevel = roleLevel[targetUser.role] || 0;

  // ❌ ลบ role เท่ากัน หรือ สูงกว่าไม่ได้
  if (currentLevel <= targetLevel) {
    return {
      success: false,
      message: "You don't have permission to delete this user",
    };
  }

  await prisma.user.delete({
    where: { id },
  });

  return {
    success: true,
    message: "deleted successfully",
  };
}


export async function DelSubRoleDashboard(id : string) {
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
  
  await prisma.subRole.delete({
    where : {id}
  })


  return {
    success: true,
    message: "deleted successfully",
  };
}


export async function DelMainRoleDashboard(id : string) {
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
  
  await prisma.mainRole.delete({
    where : {id}
  })


  return {
    success: true,
    message: "deleted successfully",
  };
}

export async function DelDashboards(id : string) {
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
  
  await prisma.dashboard.delete({
    where : {id}
  })


  return {
    success: true,
    message: "deleted successfully",
  };
}







