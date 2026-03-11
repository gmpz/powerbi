import { log } from "console";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 },
      );
    }

    // ===============================
    // STEP 1: ขอ Health ID Access Token
    // ===============================

    const healthParams = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/providerid/",
      client_id: "01992c8d-2aef-7e03-988d-a70d06e8b7d8",
      client_secret: "26e7f1f8197eaff47e160be46cbd378ee797141f",
    };

    const healthRes = await fetch("https://moph.id.th/api/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(healthParams).toString(),
    });

    const healthResult = await healthRes.json();

    if (healthResult.status_code !== 200) {
      return NextResponse.json(
        { error: "Health token failed", detail: healthResult },
        { status: 500 },
      );
    }

    const healthAccessToken = healthResult.data.access_token;

    // ===============================
    // STEP 2: ขอ Provider Token
    // ===============================

    const providerRes = await fetch(
      "https://provider.id.th/api/v1/services/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: "64fd0c44-0a23-4541-840b-3bec05e20d19",
          secret_key: "vBROTJyTnFy1gnU0U0pVyc18rFTAt972",
          token_by: "Health ID",
          token: healthAccessToken,
        }),
      },
    );

    const providerResult = await providerRes.json();

    if (providerResult.status !== 200) {
      return NextResponse.json(
        { error: "Provider token failed", detail: providerResult },
        { status: 500 },
      );
    }

    const providerAccessToken = providerResult.data.access_token;

    // ===============================
    // STEP 3: ขอ Profile
    // ===============================

    const profileRes = await fetch(
      "https://provider.id.th/api/v1/services/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${providerAccessToken}`,
          "Content-Type": "application/json",
          "client-id": "64fd0c44-0a23-4541-840b-3bec05e20d19",
          "secret-key": "vBROTJyTnFy1gnU0U0pVyc18rFTAt972",
        },
      },
    );

    const profileResult = await profileRes.json();

    if (profileResult.status !== 200) {
      return NextResponse.json(
        { error: "Profile fetch failed", detail: profileResult },
        { status: 500 },
      );
    }

    const profile = profileResult.data;


    let user = await prisma.user.findUnique({
      where: { provider_id: profile.provider_id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          provider_id: profile.provider_id,
          username: profile.firstname_en.trim().toLowerCase() + "." + profile.lastname_en.trim().toLowerCase().slice(0,3), // หรือจะใช้ provider_id เป็น username ก็ได้
          displayName: `${profile.firstname_en} ${profile.lastname_en}`,
          email: profile.email ?? null,
          role: "ANONYMOUS",
        },
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.redirect(new URL("/dashboard", req.url));

    // set cookie
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", detail: error.message },
      { status: 500 },
    );
  }
}
