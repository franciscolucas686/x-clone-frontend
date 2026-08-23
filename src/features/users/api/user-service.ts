import api from "@/shared/api/api-client";
import type { FollowToggleResponse, PaginatedResponse, User } from "@/shared/api/types";

/** Transporte de usuários e relações de seguir. Ver post-service.ts para a convenção. */

export function fetchUsers(
  params: { search?: string; cursor?: string | null } = {},
  signal?: AbortSignal,
) {
  const { search, cursor } = params;
  if (cursor) return api.get<PaginatedResponse<User>>(cursor, { signal }).then((r) => r.data);

  // A busca acontece no servidor. O ExplorerPage filtrava no cliente, sobre a página já
  // carregada — com 10 itens por página, procurar era procurar entre os 10 primeiros
  // usuários do sistema, nunca entre todos.
  //
  // `signal` cancela a requisição anterior quando uma nova tecla chega antes dela
  // responder: sem ele, uma resposta lenta para "ab" podia chegar depois da de "abc" e
  // sobrescrever o resultado certo com o de uma busca já obsoleta.
  return api
    .get<PaginatedResponse<User>>("/users/", { params: search ? { search } : undefined, signal })
    .then((r) => r.data);
}

export function fetchUserByUsername(username: string) {
  return api.get<User>(`/users/${username}/`).then((r) => r.data);
}

export function toggleFollow(userId: number) {
  return api.post<FollowToggleResponse>(`/follow/${userId}/toggle/`).then((r) => r.data);
}

export function fetchFollowers(userId: number, cursor?: string | null) {
  return api
    .get<PaginatedResponse<User>>(cursor ?? `/follow/${userId}/followers/`)
    .then((r) => r.data);
}

export function fetchFollowing(userId: number, cursor?: string | null) {
  return api
    .get<PaginatedResponse<User>>(cursor ?? `/follow/${userId}/following/`)
    .then((r) => r.data);
}
