import { useEffect } from "react";
import { clearError } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks/useAppSelector";

/**
 * Limpa `auth.error` ao montar.
 *
 * `useEffect(() => { dispatch(clearError()); }, [dispatch])` estava escrito, idêntico,
 * em LoginModal, RegisterModal e EditProfileModal — sem ele, o erro de uma tentativa
 * anterior (numa sessão do mesmo modal, ou vazando de outro) aparecia por um instante
 * antes do usuário fazer nada.
 */
export function useClearAuthErrorOnMount(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
}
