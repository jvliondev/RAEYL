import { auth } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await auth();

  return children;
}
