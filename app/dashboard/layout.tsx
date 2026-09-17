import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/app/Sidebar";
import { MobileTabBar } from "@/components/app/MobileTabBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    select: { companyName: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar companyName={user.companyName} />
      <div className="lg:pl-64">
        <main className="container-page py-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
