import { redirect } from "next/navigation";

/** Dashboard principal: redirige a la lista de proyectos. Toda la información es por proyecto. */
export default function PlatformDashboardPage() {
  redirect("/platform/proyectos");
}
