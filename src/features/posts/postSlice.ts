import { createSlice } from "@reduxjs/toolkit";
import {
  applyPage,
  emptyList,
  failLoading,
  startLoading,
  type PaginatedList,
} from "@/shared/paginated-list";
import type { Post, PostComment } from "@/shared/api/types";
import {
  createComment,
  createPost,
  fetchComments,
  fetchFollowingPosts,
  fetchUserPosts,
  toggleLike,
} from "@/features/posts/postThunks";

export interface PostState {
  /** Feed de quem o usuário segue. */
  feed: PaginatedList<Post>;
  /** Timeline do perfil aberto. */
  userPosts: PaginatedList<Post>;
  /** Comentários do post aberto no modal, indexados por post. */
  comments: Record<number, PaginatedList<PostComment>>;
  creating: boolean;
  likingPostIds: number[];
  error: string | null;
}

export const initialState: PostState = {
  feed: emptyList<Post>(),
  userPosts: emptyList<Post>(),
  comments: {},
  creating: false,
  likingPostIds: [],
  error: null,
};

/**
 * Aplica uma alteração ao mesmo post onde quer que ele esteja.
 *
 * O feed e a timeline do perfil guardam cópias independentes do mesmo post, então uma
 * curtida precisa alcançar as duas. A função existia duplicada, definida de novo dentro
 * de cada reducer que precisava dela.
 */
function emCadaLista(state: PostState, postId: number, aplicar: (post: Post) => void) {
  for (const lista of [state.feed, state.userPosts]) {
    const post = lista.items.find((p) => p.id === postId);
    if (post) aplicar(post);
  }
}

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearUserPosts(state) {
      state.userPosts = emptyList<Post>();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowingPosts.pending, (state) => startLoading(state.feed))
      .addCase(fetchFollowingPosts.fulfilled, (state, action) => {
        applyPage(state.feed, action.payload.page, { reset: action.payload.reset });
      })
      .addCase(fetchFollowingPosts.rejected, (state, action) => {
        failLoading(state.feed, action.payload ?? "Erro ao carregar o feed.");
      });

    builder
      .addCase(fetchUserPosts.pending, (state) => startLoading(state.userPosts))
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        applyPage(state.userPosts, action.payload.page, { reset: action.payload.reset });
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        failLoading(state.userPosts, action.payload ?? "Erro ao carregar os posts.");
      });

    builder
      .addCase(createPost.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.feed.items.unshift(action.payload);
        // A timeline do perfil também recebe o post novo. Antes só o feed recebia,
        // então publicar estando no próprio perfil não mostrava nada até recarregar.
        if (state.userPosts.items.some((p) => p.user.id === action.payload.user.id)) {
          state.userPosts.items.unshift(action.payload);
          state.userPosts.count += 1;
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload ?? "Erro ao criar o post.";
      });

    builder
      .addCase(toggleLike.pending, (state, action) => {
        state.likingPostIds.push(action.meta.arg.postId);
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const doServidor = action.payload;
        emCadaLista(state, doServidor.id, (post) => {
          post.is_liked = doServidor.is_liked;
          post.likes_count = doServidor.likes_count;
        });
        state.likingPostIds = state.likingPostIds.filter((id) => id !== doServidor.id);
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.likingPostIds = state.likingPostIds.filter((id) => id !== action.meta.arg.postId);
        state.error = action.payload ?? "Erro ao curtir o post.";
      });

    builder
      .addCase(fetchComments.pending, (state, action) => {
        const { postId } = action.meta.arg;
        state.comments[postId] ??= emptyList<PostComment>();
        startLoading(state.comments[postId]);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, page, reset } = action.payload;
        state.comments[postId] ??= emptyList<PostComment>();
        applyPage(state.comments[postId], page, { reset });
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        state.comments[postId] ??= emptyList<PostComment>();
        failLoading(state.comments[postId], action.payload ?? "Erro ao carregar comentários.");
      });

    builder
      .addCase(createComment.fulfilled, (state, action) => {
        const comentario = action.payload;
        state.comments[comentario.post] ??= emptyList<PostComment>();
        state.comments[comentario.post].items.unshift(comentario);
        state.comments[comentario.post].count += 1;
        emCadaLista(state, comentario.post, (post) => {
          post.comments_count += 1;
        });
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload ?? "Erro ao enviar o comentário.";
      });
  },
});

export const { clearUserPosts } = postSlice.actions;
export default postSlice.reducer;
