import type { PaginatedResponse } from "@/shared/api/types";

/**
 * Estado de uma lista paginada.
 *
 * `postSlice` e `userSlice` repetiam esta mesma quíntupla — items, cursor, hasMore,
 * loading, error — quatro vezes, cada uma com nomes um pouco diferentes
 * (`nextUrl`/`followersNext`, `loading`/`loadingFollowers`), e cada reducer reescrevia
 * os cinco campos à mão.
 *
 * O helper anterior, `handlePaginatedList`, resolvia menos do que aparentava: deduzia
 * "é a primeira página?" de `currentList.length === 0` — uma heurística, não o sinal real
 * — e devolvia `hasMore` mas **descartava o `next`**, então todo caller continuava
 * atribuindo o cursor e a flag de loading manualmente. Economizava duas linhas e não
 * deduplicava nada.
 */
export interface PaginatedList<T> {
  items: T[];
  /** URL da próxima página, como o DRF a devolve. `null` quando acabou. */
  next: string | null;
  count: number;
  loading: boolean;
  error: string | null;
}

export function emptyList<T>(): PaginatedList<T> {
  return { items: [], next: null, count: 0, loading: false, error: null };
}

export function startLoading<T>(list: PaginatedList<T>): void {
  list.loading = true;
  list.error = null;
}

export function failLoading<T>(list: PaginatedList<T>, error: string): void {
  list.loading = false;
  list.error = error;
}

/**
 * Aplica uma página ao estado.
 *
 * `reset` é passado explicitamente por quem chama, a partir de ter seguido ou não um
 * cursor — não deduzido do tamanho da lista atual, que confunde "primeira página" com
 * "página vazia".
 *
 * A deduplicação por id não é zelo excessivo: entre carregar a página 1 e pedir a 2, um
 * post novo desloca todos os outros uma posição, e o item que estava na fronteira volta
 * repetido. Era o motivo de `FollowListPage` ter que aplicar `uniqueById` na leitura —
 * um remendo do lado errado.
 */
export function applyPage<T extends { id: number }>(
  list: PaginatedList<T>,
  page: PaginatedResponse<T>,
  { reset }: { reset: boolean },
): void {
  const combinados = reset ? page.results : [...list.items, ...page.results];
  list.items = Array.from(new Map(combinados.map((item) => [item.id, item])).values());
  list.next = page.next;
  list.count = page.count;
  list.loading = false;
  list.error = null;
}

export function hasMore<T>(list: PaginatedList<T>): boolean {
  return list.next !== null;
}
