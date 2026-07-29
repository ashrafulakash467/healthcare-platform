import UnifiedAuthPage from "../../components/auth/UnifiedAuthPage";

export default function RegisterPage({ searchParams }) {
  return <UnifiedAuthPage mode="register" initialRole={searchParams?.role ?? "user"} />;
}
