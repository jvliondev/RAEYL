import { requireAdmin, requireSession } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  await requireAdmin(session.user.id);

  return children;
}
