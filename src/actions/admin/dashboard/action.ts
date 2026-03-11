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

  const mainRoles = await prisma.mainRole.findMany({
    where: { dashboardId },
  });

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
      dashboardId: dashboardId,
    },
  },
  select: {
    id: true,
    name: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    mainRole: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

  return subRoles;
}

export async function insertDashboardSubRole(dashboardId: string, roleName: string, mainRoleId: string) {
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

  return {
    success: true,
    message: "Dashboard created successfully",
    dashboard: newDashboard,
  }
};
