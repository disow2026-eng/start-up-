import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}
