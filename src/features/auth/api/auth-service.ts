import api from "@/shared/api/api-client";
import type { RegisterResponse, TokenResponse, User } from "@/shared/api/types";

/** Transporte de autenticação e perfil. */

export function obtainToken(credentials: { username: string; password: string }) {
  return api.post<TokenResponse>("/token/", credentials).then((r) => r.data);
}

/** Troca um refresh token por um par novo. Usado pelo interceptor do api-client quando
 * o access token expira — nunca chamado diretamente pelos thunks. */
export function refreshToken(refresh: string) {
  return api.post<TokenResponse>("/token/refresh/", { refresh }).then((r) => r.data);
}

export function register(payload: {
  username: string;
  name: string;
  password: string;
  confirm_password: string;
}) {
  return api.post<RegisterResponse>("/register/", payload).then((r) => r.data);
}

export function fetchProfile() {
  return api.get<User>("/profile/").then((r) => r.data);
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
  /** `null` remove a foto e volta ao avatar padrão; ausente significa "não mexeu". */
  avatar?: File | null;
}

export function updateProfile(payload: UpdateProfilePayload) {
  const form = new FormData();

  for (const [chave, valor] of Object.entries(payload)) {
    if (valor === undefined) continue;

    // `null` no avatar é a instrução de remover, e precisa chegar ao servidor. O código
    // anterior filtrava vazio, null e undefined juntos, então o botão "remover foto" só
    // limpava o preview local — a remoção era impossível de expressar.
    if (chave === "avatar" && valor === null) {
      form.append("avatar", "");
      continue;
    }
    if (valor === "" || valor === null) continue;

    form.append(chave, valor instanceof File ? valor : String(valor));
  }

  return api
    .patch<User>("/profile/", form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
}
