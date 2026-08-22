import { createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "@/features/posts/api/post-service";
import { getErrorMessage } from "@/shared/api/api-error";
import type { PaginatedResponse, Post, PostComment } from "@/shared/api/types";

/**
 * Os thunks só orquestram: chamam o service, traduzem o erro e devolvem ao reducer.
 * Nenhum deles conhece axios, URL ou formato de resposta — isso é do service.
 *
 * `fetchPosts` foi removido daqui. Era código morto (nenhum componente o despachava) e
 * declarava `api.get<Post[]>("/posts/")` para um endpoint paginado, que devolve
 * `{count, next, previous, results}` — um objeto no lugar de um array. Passava
 * despercebido porque `api.get<T>` é asserção de tipo, não verificação.
 */

interface Pagina<T> {
  page: PaginatedResponse<T>;
  reset: boolean;
}

export const fetchFollowingPosts = createAsyncThunk<
  Pagina<Post>,
  { cursor?: string | null } | void,
  { rejectValue: string }
>("posts/fetchFollowingPosts", async (arg, { rejectWithValue }) => {
  const cursor = arg && "cursor" in arg ? arg.cursor : null;
  try {
    // `reset` vem de ter seguido ou não um cursor — o sinal real, e não uma dedução a
    // partir do tamanho da lista atual.
    return { page: await postService.fetchFeed(cursor), reset: !cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserPosts = createAsyncThunk<
  Pagina<Post>,
  { username: string; cursor?: string | null },
  { rejectValue: string }
>("posts/fetchUserPosts", async ({ username, cursor }, { rejectWithValue }) => {
  try {
    // O cursor é novo. O thunk anterior desestruturava só `{ username }` e fixava o
    // endpoint, então não havia como pedir a página 2: `nextUrl`, `hasMore` e `count`
    // eram preenchidos no estado e inutilizáveis, e a timeline do perfil parava nos 10
    // primeiros posts sem nada indicar que havia mais.
    return { page: await postService.fetchUserPosts(username, cursor), reset: !cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createPost = createAsyncThunk<Post, { text: string }, { rejectValue: string }>(
  "posts/createPost",
  async ({ text }, { rejectWithValue }) => {
    try {
      return await postService.createPost(text);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const toggleLike = createAsyncThunk<Post, { postId: number }, { rejectValue: string }>(
  "posts/toggleLike",
  async ({ postId }, { rejectWithValue }) => {
    try {
      // O servidor devolve o post inteiro; o cliente substitui o item pelo que ele
      // afirma, em vez de deduzir o novo estado a partir de uma mensagem de texto.
      return await postService.toggleLike(postId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchComments = createAsyncThunk<
  { postId: number } & Pagina<PostComment>,
  { postId: number; cursor?: string | null },
  { rejectValue: string }
>("posts/fetchComments", async ({ postId, cursor }, { rejectWithValue }) => {
  try {
    return { postId, page: await postService.fetchComments(postId, cursor), reset: !cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createComment = createAsyncThunk<
  PostComment,
  { postId: number; text: string },
  { rejectValue: string }
>("posts/createComment", async ({ postId, text }, { rejectWithValue }) => {
  try {
    return await postService.createComment(postId, text);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
