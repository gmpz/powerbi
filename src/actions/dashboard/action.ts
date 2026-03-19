"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { notFound, redirect } from "next/navigation";
import { tr } from "zod/v4/locales";


// 🔥 helper delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUserDashboards() {
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

  const userId = user.id;

  const dashboards = await prisma.userDashboard.findMany({
    where: {
      userId,
      status: "ACTIVE",
      dashboard: { status: "ACTIVE" },
    },
    include: {
      dashboard: true,
      mainRole: true,
      subRole: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return dashboards.map((item) => ({
    id: item.dashboard.id,
    name: item.dashboard.name,
    description: item.dashboard.description,
    color: item.dashboard.color,
    mainRole: item.mainRole?.name,
    subRole: item.subRole?.name,
  }));
}


export async function getDashboardById(dashboardId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);

  const userId = payload.userId as string;
  const access = await prisma.userDashboard.findFirst({
    where: {
      userId,
      dashboardId,
      status: "ACTIVE",
      dashboard: { status: "ACTIVE" },
    },
    include: {
      dashboard: true,
      mainRole: true,
      subRole: true,
    },
  });

  if (!access) {
    notFound();
  }

  return {
    id: access.dashboard.id,
    name: access.dashboard.name,
    description: access.dashboard.description,
    workspaceId: access.dashboard.workspaceId,
    reportId: access.dashboard.reportId,
    mainRole: access.mainRole?.name,
    subRole: access.subRole?.name,
  };
}

export async function getDashboardName(dashboardId: string) {  

  const dashboard = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  if (!dashboard) {
    notFound();
  }

  return dashboard.name;
}
