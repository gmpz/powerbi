"use server";

import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function getPowerbi(dashboardId: string) {
  // await delay(3000);
  try {
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
        user: true,
      },
    });

    if (!access) {
      notFound();
    }
    
    
    // TODO: query dashboard จาก db ด้วย dashboardId
    const workspaceId = access.dashboard.workspaceId;
    const reportId = access.dashboard.reportId;

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
      username: access.user.username, // ใส่อะไรก็ได้ แต่ห้ามว่าง  user+subRole  
      roles: [access.mainRole?.name], // ต้องตรงกับชื่อ role ที่สร้างใน PowerBI mainRole
      datasets: [datasetId],
    }
    const body = {
      accessLevel: "View",
      ...(access.dashboard.accessCtrl === "ACTIVE" && {
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
      embedUrl: reportData.embedUrl,
      embedToken: embedTokenData.token,
    };
  } catch (error) {
    console.error("PowerBI error:", error);

    return {
      error: "POWERBI_ERROR",
    };
  }
}