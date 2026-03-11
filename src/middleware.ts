import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // ===== 1️⃣ ยังไม่ login =====
  if (!token) {
    if (pathname.startsWith("/login") || pathname.startsWith("/providerid")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // ===== 2️⃣ Login แล้ว ห้ามกลับไป login =====
    if (pathname.startsWith("/login")) {
      if (role === "ANONYMOUS") {
        return NextResponse.redirect(new URL("/unauthorize", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ===== 3️⃣ เป็น ANONYMOUS =====
    if (role === "ANONYMOUS") {
      if (pathname.startsWith("/unauthorize")) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/unauthorize", req.url));
    }

    // ===== 4️⃣ Admin group route =====
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorize", req.url));
      }
    }

    // ===== 5️⃣ ถ้า login แล้วไม่ควรเข้า unauthorize =====
    if (pathname.startsWith("/unauthorize")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();

  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};