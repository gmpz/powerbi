"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();

  // ลบ cookie
  cookieStore.delete("access_token");

  // redirect ไปหน้า login
  redirect("/login");
}