"use server";

import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export async function getPowerbi(dashboardId: string) {

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      redirect("/login"); 
    }


    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      notFound();
    }

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
      },
    });

    if (dashboard.accessCtrl === "ACTIVE" && !access) {
      notFound();
    }

    const workspaceId = dashboard.workspaceId;
    const reportId = dashboard.reportId;

    // 1️⃣ ขอ Azure AD token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.POWERBI_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.POWERBI_CLIENT_ID!,
          client_secret: process.env.POWERBI_CLIENT_SECRET!,
          scope: "https://analysis.windows.net/powerbi/api/.default",
        }),
      }
    );

    console.log("token:", tokenRes);

    if (!tokenRes.ok) {
      throw new Error("Failed to get Azure token");
    }

    const tokenData = await tokenRes.json();
    
    
    const accessToken = tokenData.access_token;

    // 2️⃣ ดึง report info
    const reportRes = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!reportRes.ok) {
      throw new Error("Failed to get report info");
    }

    const reportData = await reportRes.json();
    const datasetId = reportData.datasetId;


    const accessCtrl = {
      username: user.username,
      roles: access?.mainRole?.name ? [access.mainRole.name] : [],
      datasets: [datasetId],
    };
    const body = {
      accessLevel: "View",
      ...(dashboard.accessCtrl === "ACTIVE" && {
        identities: [accessCtrl],
      }),
    };


    // 3️⃣ Generate Embed Token
    const embedTokenRes = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!embedTokenRes.ok) {
      
      throw new Error("Failed to generate embed token");
    }

    const embedTokenData = await embedTokenRes.json();
    
    return {
      reportId,
      embedUrl: reportData.embedUrl + '&navContentPaneEnabled=false',
      embedToken: embedTokenData.token,
    };
  } catch (error) {
    console.error("PowerBI error:", error);

    return {
      error: "POWERBI_ERROR",
    };
  }
}
