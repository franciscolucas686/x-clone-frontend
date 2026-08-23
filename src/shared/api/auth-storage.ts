/**
 * Único lugar que conhece onde os tokens vivem.
 *
 * A chave `"access"` estava escrita à mão em quatro arquivos (o interceptor, dois
 * thunks e o initialState do authSlice). Trocar o mecanismo de armazenamento — para
 * cookie httpOnly, por exemplo — exigia achar todas elas.
 *
 * O refresh token ganhou uma segunda chave pelo mesmo motivo: antes ele era descartado
 * no próprio thunk (`const { access } = await authService.obtainToken(...)`), então a
 * sessão não tinha como se renovar sozinha e morria com o access token, a cada 15
 * minutos — direto no travamento que sessionExpired causava (ver authSlice.ts).
 */
const CHAVE_ACCESS = "access";
const CHAVE_REFRESH = "refresh";

export function getToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_ACCESS);
  } catch {
    // Navegador com armazenamento bloqueado. Sem token é um estado válido: o usuário
    // simplesmente não está autenticado.
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_REFRESH);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(CHAVE_ACCESS, token);
  } catch {
    /* idem */
  }
}

/** Grava o par inteiro de uma vez — é assim que login, cadastro e renovação chegam. */
export function setTokens(tokens: { access: string; refresh: string }): void {
  setToken(tokens.access);
  try {
    localStorage.setItem(CHAVE_REFRESH, tokens.refresh);
  } catch {
    /* idem */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(CHAVE_ACCESS);
  } catch {
    /* idem */
  }
}

export function clearTokens(): void {
  clearToken();
  try {
    localStorage.removeItem(CHAVE_REFRESH);
  } catch {
    /* idem */
  }
}
