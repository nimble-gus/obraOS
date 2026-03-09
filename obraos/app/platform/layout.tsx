import { auth } from "@/auth";
import { PlatformShell } from "../components/PlatformShell";
import { PlatformGuard } from "./PlatformGuard";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <PlatformShell session={session}>
      <PlatformGuard
        rol={session?.user?.role ?? ""}
        modulosAcceso={session?.user?.modulosAcceso}
      />
      {children}
    </PlatformShell>
  );
}
