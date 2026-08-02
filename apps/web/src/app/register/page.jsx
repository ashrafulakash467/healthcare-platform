import { redirect } from "next/navigation";
import UnifiedAuthPage from "../../components/auth/UnifiedAuthPage";

export default function RegisterPage({ searchParams }) {
  if (searchParams?.role === "admin") {
    redirect("/login?role=admin");
  }

  return <UnifiedAuthPage mode="register" initialRole={searchParams?.role ?? "user"} />;
}
