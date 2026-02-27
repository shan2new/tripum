import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "./types";

export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  return role === "admin" ? "admin" : "viewer";
}

export async function requireAdmin() {
  const role = await getUserRole();
  if (role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
}

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
