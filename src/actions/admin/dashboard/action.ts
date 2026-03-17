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

export async function getDashboard() {
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

  const dashboards = await prisma.dashboard.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      color:true,
      description: true,
      createdAt: true,
      updatedAt: true,
      accessCtrl:true,
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return dashboards;
}

export async function getDashboardById(dashboardId: string) {
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

  const dashboardData = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  return dashboardData;
}


export async function updateDashboard(
  dashboardId: string,
  data: {
    name: string;
    description: string ;
    color: string;
    workspaceId: string;
    reportId: string;
    accessCtrl: "ACTIVE" | "INACTIVE";
    status: "ACTIVE" | "INACTIVE";
  }

) {
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

  const updatedDashboard = await prisma.dashboard.update({
    where: { id: dashboardId },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      workspaceId: data.workspaceId,
      reportId: data.reportId,
      status: data.status,
      accessCtrl: data.accessCtrl,
    },
  });

  return {
    success: true,
    message: "Dashboard updated successfully",
    dashboard: updatedDashboard,
  };
}

export async function getDashboardMainRole(dashboardId: string) {
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

  // const mainRoles = await prisma.mainRole.findMany({
  //   where: { dashboardId },
  // });
  const mainRoles = await prisma.mainRole.findMany({
    where: {
      OR: [
        { type: "SYSTEM" },
        { dashboardId: dashboardId }
      ]
    },
    orderBy : {name: "asc"}
  })

  return mainRoles;
}

export async function insertDashboardMainRole(dashboardId: string, roleName: string) {
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

  const newMainRole = await prisma.mainRole.create({
    data: {
      code: roleName,
      name: roleName,
      dashboardId,
      createdBy: payload.userId as string,
    }
  });

  return {
    success: true,
    message: "Main role added successfully",
    mainRole: newMainRole,
  };
}

export async function getDashboardSubRole(dashboardId: string) {
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

  const subRoles = await prisma.subRole.findMany({
  where: {
    mainRole: {
      OR: [
        { type: "SYSTEM" },
        { dashboardId: dashboardId }
      ]
    },
  },
  select: {
    id: true,
    code: true,
    name: true,
    status: true,
    type: true,
    createdAt: true,
    updatedAt: true,
    mainRole: {
      select: {
        id: true,
        name: true,
      },
    },
  },
  orderBy : { code : "asc"}
});

  return subRoles;
}

export async function insertDashboardSubRole(dashboardId: string,roleCode: string, roleName: string, mainRoleId: string) {
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

  const newMainRole = await prisma.subRole.create({
    data: {
      code: Number(roleCode),
      name: roleName,
      mainRoleId,
      createdBy: payload.userId as string,
    }
  });

  return {
    success: true,
    message: "Sub role added successfully",
    subRole: newMainRole,
  };
}


export async function insertDashboard(data: {
    name: string;
    workspaceId: string;
    reportId: string;
    rbac: "ACTIVE" | "INACTIVE";
    status: "ACTIVE" | "INACTIVE";
    color: string;
    description?: string | undefined;
}){
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

  const newDashboard = await prisma.dashboard.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      workspaceId: data.workspaceId,
      reportId: data.reportId,
      accessCtrl: data.rbac,
      status: data.status,
      createdBy: payload.userId as string,
    }
  });

  const isSyncDefaultDashboard = await prisma.systemSetting.findFirst({
    where: {
      code: "SYNC_DEFAULT_DASHBOARD"
    },
    select : {
      status: true
    }
  });

  if (isSyncDefaultDashboard) {
    const defaultRole = await prisma.defaultRole.findMany({
      where : {
        status : "ACTIVE"
      }
    });

    await Promise.all(
      defaultRole.map((item) =>
        prisma.userDashboard.create({
          data: {
            userId: item.userId,
            dashboardId: newDashboard.id,
            mainRoleId: item.mainRoleId,
            subRoleId: item.subRoleId || null,
            status: "ACTIVE",
            createdBy: user.id
          }
        })
      )
    )

  }

  return {
    success: true,
    message: "Dashboard created successfully",
    dashboard: newDashboard,
  }
};
