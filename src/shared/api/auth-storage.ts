/**
 * Único lugar que conhece onde o token vive.
 *
 * A chave `"access"` estava escrita à mão em quatro arquivos (o interceptor, dois
 * thunks e o initialState do authSlice). Trocar o mecanismo de armazenamento — para
 * cookie httpOnly, por exemplo — exigia achar todas elas.
 */
const CHAVE = "access";

export function getToken(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    // Navegador com armazenamento bloqueado. Sem token é um estado válido: o usuário
    // simplesmente não está autenticado.
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    /* idem */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* idem */
  }
}
