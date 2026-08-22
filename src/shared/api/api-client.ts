import axios, { type AxiosError } from "axios";
import { getToken } from "@/shared/api/auth-storage";
import type { ApiErrorResponse } from "@/shared/api/types";

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
  const semResposta = !error.response;
  return {
    code: semResposta ? "NETWORK_ERROR" : "INTERNAL_ERROR",
    message: semResposta
      ? "Não foi possível falar com o servidor. Verifique sua conexão."
      : "Ocorreu um erro inesperado. Tente novamente em instantes.",
    details: null,
    status_code: error.response?.status ?? 0,
    path: error.config?.url ?? "",
  };
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !ehRotaDeCredencial(error.config?.url)) {
      aoPerderSessao?.();
    }
    return Promise.reject(normalizarErro(error));
  },
);

export default api;
