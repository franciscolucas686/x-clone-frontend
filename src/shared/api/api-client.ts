import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getRefreshToken, getToken, setTokens } from "@/shared/api/auth-storage";
import { ERROR_CODE_MESSAGES } from "@/shared/api/error-code-map";
import type { ApiErrorResponse, TokenResponse } from "@/shared/api/types";

/** Marca posta na config de uma requisição já reenviada uma vez após renovar o token,
 * para o interceptor nunca tentar renovar duas vezes a mesma requisição original. */
interface ConfigComRetry extends InternalAxiosRequestConfig {
  _renovada?: boolean;
}

/**
 * Rotas cujo 401 significa "credencial errada", nunca "sessão expirada".
 *
 * Sem esta distinção, errar a senha no login era tratado como token vencido: o
 * interceptor limpava o storage e fazia `window.location.href = "/"`, um reload
 * completo. O `rejectWithValue` do thunk até rodava, mas o store era destruído antes de
 * o LoginModal renderizar o erro — o usuário digitava a senha errada e a tela só
 * piscava. A mensagem existia e nunca aparecia.
 */
const ROTAS_DE_CREDENCIAL = ["/token/", "/register/"];

// `/token/refresh/` casa em `ROTAS_DE_CREDENCIAL` porque o teste é `url.includes("/token/")`.
// Isso é desejado: o 401 do próprio refresh não pode disparar um novo refresh. Mas
// significa que o caminho de falha do refresh, abaixo, precisa chamar `aoPerderSessao()`
// explicitamente — este filtro não faz isso por ele.

function ehRotaDeCredencial(url: string | undefined): boolean {
  if (!url) return false;
  return ROTAS_DE_CREDENCIAL.some((rota) => url.includes(rota));
}

/**
 * Callback chamado quando a sessão cai — injetado, não importado.
 *
 * A camada de transporte não conhece o store nem o router. Antes ela navegava sozinha
 * (`window.location.href = "/"`), o que a tornava impossível de testar isolada e a
 * acoplava ao React Router. Quem decide o que fazer com uma sessão vencida é o
 * PrivateRoute, reagindo ao estado — como no ProtectedRoute do real-estate-app.
 */
let aoPerderSessao: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  aoPerderSessao = handler;
}

/**
 * Renovação do access token — em voo único.
 *
 * `ACCESS_TOKEN_LIFETIME` é 15 minutos, e o backend já tinha `/token/refresh/` com
 * rotação e blacklist configuradas; só o cliente descartava o refresh token no
 * destructuring (`const { access } = ...`). Sem isso, toda sessão morria em 15 minutos
 * — e morria mal: caía em `sessionExpired`, e o travamento que essa ação causava (ver
 * authSlice.ts) é o que motivou esta correção.
 *
 * O `let` no módulo é o que faz duas requisições que expiram juntas compartilhar a
 * mesma renovação em vez de disparar uma cada: com `ROTATE_REFRESH_TOKENS` e
 * `BLACKLIST_AFTER_ROTATION` no backend, dois refreshes concorrentes colocam um ao
 * outro na blacklist — o segundo a chegar desloga o usuário com um refresh token que
 * era válido um instante atrás.
 */
let renovacaoEmVoo: Promise<TokenResponse> | null = null;

function renovarSessao(): Promise<TokenResponse> {
  if (!renovacaoEmVoo) {
    const refresh = getRefreshToken();
    if (!refresh) {
      renovacaoEmVoo = Promise.reject(new Error("Sem refresh token."));
    } else {
      renovacaoEmVoo = api
        .post<TokenResponse>("/token/refresh/", { refresh })
        .then((r) => r.data)
        .finally(() => {
          renovacaoEmVoo = null;
        });
    }
  }
  return renovacaoEmVoo;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Sem timeout, uma requisição pendurada deixa o botão em "Salvando..." para sempre.
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Traduz qualquer falha do axios para o envelope da API, para o cliente ter um tipo só. */
function normalizarErro(error: AxiosError): ApiErrorResponse {
  const data = error.response?.data as Partial<ApiErrorResponse> | undefined;

  if (data && typeof data.code === "string") {
    return data as ApiErrorResponse;
  }

  // Sem resposta: rede caiu, CORS barrou, ou o timeout estourou. O backend nunca falou,
  // então o envelope é sintetizado aqui para que quem consome não precise distinguir.
  //
  // A mensagem vem de ERROR_CODE_MESSAGES, não de um literal duplicado aqui: as duas
  // versões já divergiram por engano uma vez, uma reescrita na outra sem que ninguém
  // notasse — um code sem tradução própria ali é bug de configuração, não algo para este
  // arquivo reimplementar.
  const semResposta = !error.response;
  const code = semResposta ? "NETWORK_ERROR" : "INTERNAL_ERROR";
  return {
    code,
    message: ERROR_CODE_MESSAGES[code],
    details: null,
    status_code: error.response?.status ?? 0,
    path: error.config?.url ?? "",
  };
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as ConfigComRetry | undefined;
    const podeRenovar =
      error.response?.status === 401 &&
      config &&
      !config._renovada &&
      !ehRotaDeCredencial(config.url) &&
      getRefreshToken();

    if (podeRenovar) {
      try {
        const tokens = await renovarSessao();
        setTokens(tokens);
        config._renovada = true;
        config.headers.Authorization = `Bearer ${tokens.access}`;
        return api.request(config);
      } catch {
        clearTokens();
        aoPerderSessao?.();
        return Promise.reject(normalizarErro(error));
      }
    }

    if (error.response?.status === 401 && !ehRotaDeCredencial(config?.url)) {
      aoPerderSessao?.();
    }
    return Promise.reject(normalizarErro(error));
  },
);

export default api;
