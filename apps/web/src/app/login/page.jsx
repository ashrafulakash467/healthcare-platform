import UnifiedAuthPage from "../../components/auth/UnifiedAuthPage";

export default function LoginPage({ searchParams }) {
  return <UnifiedAuthPage mode="login" initialRole={searchParams?.role ?? "user"} />;
}
