import { describe, expect, it } from "vitest";
import { sessionExpired } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authThunks";
import { makePost, makeUser } from "@/mocks/handlers";
import { createStore } from "@/app/store";

/**
 * `logoutUser` só apagava o token e limpava o authSlice. `posts` e `users` mantinham o
 * feed, o perfil e as listas de quem saiu — então entrar com outra conta na mesma aba
 * mostrava os dados do usuário anterior até cada tela refazer o fetch.
 */
describe("reset de sessão no rootReducer", () => {
  function comEstadoCarregado() {
    const store = createStore();
    store.dispatch({
      type: "posts/fetchFollowingPosts/fulfilled",
      payload: {
        page: {
          count: 1,
          next: null,
          previous: null,
          results: [makePost({ id: 1, user: makeUser({ id: 1 }) })],
        },
        reset: true,
      },
    });
    store.dispatch({
      type: "users/fetchUsers/fulfilled",
      payload: {
        page: { count: 1, next: null, previous: null, results: [makeUser({ id: 2 })] },
        reset: true,
      },
    });
    return store;
  }

  it("logout zera todos os slices, não só o de auth", async () => {
    const store = comEstadoCarregado();
    expect(store.getState().posts.feed.items).toHaveLength(1);
    expect(store.getState().users.list.items).toHaveLength(1);

    await store.dispatch(logoutUser());

    expect(store.getState().posts.feed.items).toEqual([]);
    expect(store.getState().users.list.items).toEqual([]);
    expect(store.getState().auth.user).toBeNull();
  });

  it("sessão expirada zera todos os slices", () => {
    const store = comEstadoCarregado();

    store.dispatch(sessionExpired());

    expect(store.getState().posts.feed.items).toEqual([]);
    expect(store.getState().users.list.items).toEqual([]);
  });
});
