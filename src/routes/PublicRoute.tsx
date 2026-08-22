import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Spinner } from "@/ui/Spinner";

/**
 * Tela de entrada: quem já tem sessão vai direto para o feed.
 *
 * Também espera o `checking` terminar. Antes lia um `loading` que nunca ficava `true`,
 * então quem tinha sessão via a página de marketing renderizar antes de ser redirecionado
 * — um piscar de conteúdo errado a cada carregamento.
 */
export default function PublicRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Spinner size={50} color="border-t-blue-500" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
