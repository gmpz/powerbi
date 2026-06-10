"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { notFound, redirect } from "next/navigation";

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

  const [dashboards, publicDashboards] = await Promise.all([
    prisma.userDashboard.findMany({
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
    }),
    prisma.dashboard.findMany({
      where: {
        status: "ACTIVE",
        accessCtrl: "INACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const dashboardMap = new Map(
    dashboards.map((item) => [
      item.dashboard.id,
      {
        id: item.dashboard.id,
        name: item.dashboard.name,
        description: item.dashboard.description,
        color: item.dashboard.color,
        mainRole: item.mainRole?.name,
        subRole: item.subRole?.name,
        createdAt: item.dashboard.createdAt,
      },
    ])
  );

  for (const dashboard of publicDashboards) {
    if (!dashboardMap.has(dashboard.id)) {
      dashboardMap.set(dashboard.id, {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        color: dashboard.color,
        mainRole: undefined,
        subRole: undefined,
        createdAt: dashboard.createdAt,
      });
    }
  }

  return Array.from(dashboardMap.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((dashboard) => ({
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      color: dashboard.color,
      mainRole: dashboard.mainRole,
      subRole: dashboard.subRole,
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
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: dashboardId,
      status: "ACTIVE",
    },
  });

  if (!dashboard) {
    notFound();
  }

  const access = await prisma.userDashboard.findFirst({
    where: {
      userId,
      dashboardId,
      status: "ACTIVE",
    },
    include: {
      mainRole: true,
      subRole: true,
    },
  });

  if (dashboard.accessCtrl === "ACTIVE" && !access) {
    notFound();
  }

  return {
    id: dashboard.id,
    name: dashboard.name,
    description: dashboard.description,
    workspaceId: dashboard.workspaceId,
    reportId: dashboard.reportId,
    mainRole: access?.mainRole?.name,
    subRole: access?.subRole?.name,
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
