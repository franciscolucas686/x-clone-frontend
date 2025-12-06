import { createSlice } from "@reduxjs/toolkit";
import {
  createComment,
  createPost,
  fetchFollowingPosts,
  fetchPosts,
  fetchUserPosts,
  toggleLike,
} from "./postThunks";
import type { Post } from "./types";

export interface PostState {
  items: Post[];
  nextUrl: string | null;
  hasMore: boolean;

  userPosts: {
    items: Post[];
    loading: boolean;
    error: string | null;
    nextUrl: string | null;
    hasMore: boolean;
    count: number;
  };

  loading: boolean;
  creating: boolean;
  commentingPostIds: number[];
  likingPostIds: number[];
  error: string | null;
}

export const initialState: PostState = {
  items: [],
  nextUrl: null,
  hasMore: true,

  userPosts: {
    items: [],
    loading: false,
    error: null,
    nextUrl: null,
    hasMore: true,
    count: 0,
  },

  loading: false,
  creating: false,
  likingPostIds: [],
  commentingPostIds: [],
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearUserPosts(state) {
      state.userPosts = {
        items: [],
        loading: false,
        error: null,
        nextUrl: null,
        hasMore: true,
        count: 0,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Erro ao buscar posts";
      });

    builder
      .addCase(fetchFollowingPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowingPosts.fulfilled, (state, action) => {
        const { results, next, isInitialLoad } = action.payload;

        state.loading = false;
        state.nextUrl = next;

        state.hasMore = next !== null;

        if (isInitialLoad) {
          state.items = results;
        } else {
          state.items.push(...results);
        }
      })
      .addCase(fetchFollowingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Erro ao carregar posts dos seguidos";
      });

    builder
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload ?? "Erro ao criar post";
      });

    builder
      .addCase(toggleLike.pending, (state, action) => {
        state.likingPostIds.push(action.meta.arg.postId);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, is_liked, likes_delta, serverPost } = action.payload;

        const updateList = (list: Post[]) => {
          const index = list.findIndex((p) => p.id === postId);
          if (index === -1) return;

          if (serverPost) {
            list[index] = serverPost;
          } else {
            list[index].is_liked = is_liked;
            list[index].likes_count += likes_delta;
          }
        };

        updateList(state.items);
        updateList(state.userPosts.items);

        state.likingPostIds = state.likingPostIds.filter((id) => id !== postId);
      })
      .addCase(toggleLike.rejected, (state, action) => {
        const postId = action.meta.arg.postId;
        state.likingPostIds = state.likingPostIds.filter((id) => id !== postId);
        state.error = action.payload ?? "Erro ao curtir post";
      });

    builder
      .addCase(createComment.pending, (state, action) => {
        state.commentingPostIds.push(action.meta.arg.postId);
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const newComment = action.payload;

        state.commentingPostIds = state.commentingPostIds.filter(
          (id) => id !== newComment.post
        );

        const updateList = (list: Post[]) => {
          const post = list.find((p) => p.id === newComment.post);
          if (!post) return;

          post.comments.unshift(newComment);
          post.comments_count += 1;
        };

        updateList(state.items);
        updateList(state.userPosts.items);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Erro ao criar comentário";
      });

    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.userPosts.loading = true;
        state.userPosts.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const isInitialLoad = action.meta.arg.isInitialLoad ?? true;

        state.userPosts.loading = false;
        state.userPosts.items = isInitialLoad
          ? action.payload.results
          : [...state.userPosts.items, ...action.payload.results];

        state.userPosts.nextUrl = action.payload.next;
        state.userPosts.count = action.payload.count;
        state.userPosts.hasMore = action.payload.next !== null;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.userPosts.loading = false;
        state.userPosts.error =
          typeof action.payload === "string"
            ? action.payload
            : "Erro ao carregar posts do usuário";
      });
  },
});

export const { clearUserPosts } = postSlice.actions;
export default postSlice.reducer;
