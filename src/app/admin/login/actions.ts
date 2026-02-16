"use server";

import { redirect } from "next/navigation";
import { setSession } from "@/lib/session";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return { error: "Admin login is not configured." };
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { error: "Invalid email or password." };
  }

  await setSession(email);
  redirect(callbackUrl);
}
