import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Spinner } from "@/ui/Spinner";

/**
 * Só deixa passar quem tem sessão.
 *
 * Reage ao `status` do authSlice. A versão anterior usava um `setTimeout(2000)` fixo como
 * substituto de estado de carregamento — porque `restoreUser` não tinha reducers de
 * `.pending`/`.rejected` e `auth.loading` nunca ficava `true` no boot. Toda navegação
 * para uma rota privada custava dois segundos de tela em branco, e se `/profile/`
 * demorasse mais que isso, o usuário era mandado para o login com sessão válida.
 */
export default function PrivateRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Spinner size={50} color="border-t-blue-500" />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
