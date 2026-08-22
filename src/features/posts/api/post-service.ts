import api from "@/shared/api/api-client";
import type { PaginatedResponse, Post, PostComment } from "@/shared/api/types";

/**
 * Transporte: fala HTTP e mais nada.
 *
 * Sem React, sem Redux, sem cache. Os thunks chamavam o axios direto, então não havia
 * nenhum ponto entre "o que a API expõe" e "como o cliente guarda" — testar a camada de
 * rede exigia montar um store, e trocar um endpoint significava caçar chamadas dentro de
 * reducers. É a mesma separação entre `*-service.ts` e os hooks no real-estate-app.
 *
 * Convenção: quando existe um cursor (`next` do DRF), ele é a URL absoluta que o próprio
 * servidor devolveu, e é usada como está.
 */

export function fetchFeed(cursor?: string | null) {
  return api.get<PaginatedResponse<Post>>(cursor ?? "/posts/following/").then((r) => r.data);
}

export function fetchUserPosts(username: string, cursor?: string | null) {
  return api
    .get<PaginatedResponse<Post>>(cursor ?? `/users/${username}/posts/`)
    .then((r) => r.data);
}

export function createPost(text: string) {
  return api.post<Post>("/posts/", { text }).then((r) => r.data);
}

/**
 * Alterna a curtida e devolve o post como o servidor o vê.
 *
 * A resposta era `{"message": "Curtido"|"Descurtido", "post": {...}}`, e o cliente
 * comparava `message === "Curtido"` para saber o novo estado — uma string de interface em
 * português usada como protocolo. Traduzir a UI quebraria as curtidas.
 */
export function toggleLike(postId: number) {
  return api.post<Post>(`/posts/${postId}/like/`).then((r) => r.data);
}

export function fetchComments(postId: number, cursor?: string | null) {
  return api
    .get<PaginatedResponse<PostComment>>(cursor ?? `/posts/${postId}/comments/`)
    .then((r) => r.data);
}

export function createComment(postId: number, text: string) {
  return api.post<PostComment>(`/posts/${postId}/comments/`, { text }).then((r) => r.data);
}
