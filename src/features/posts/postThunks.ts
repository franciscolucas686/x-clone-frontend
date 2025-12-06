import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../api/axios";
import type { PaginatedResponse } from "../../features/pagination/types";
import { handleThunkError } from "../../utils/errors";
import type { Post, PostComment } from "./types";

export const fetchPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Post[]>("/posts/");
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return [];
    }
    return rejectWithValue(handleThunkError(error, "Erro ao buscar posts"));
  }
});

export const fetchFollowingPosts = createAsyncThunk<
  {
    results: Post[];
    next: string | null;
    isInitialLoad: boolean;
  },
  { nextUrl?: string | null } | void,
  { rejectValue: string }
>("posts/fetchFollowingPosts", async (arg, { rejectWithValue }) => {
  try {
    const nextUrl = arg && "nextUrl" in arg ? arg.nextUrl : undefined;
    const endpoint = nextUrl ?? "/posts/following/";

    const { data } = await api.get<PaginatedResponse<Post>>(endpoint);

    return {
      results: data.results,
      next: data.next,
      isInitialLoad: !nextUrl,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return {
        results: [],
        next: null,
        isInitialLoad: true,
      };
    }
    return rejectWithValue(
      handleThunkError(error, "Erro ao buscar posts dos seguidos")
    );
  }
});

export const createPost = createAsyncThunk<
  Post,
  { text: string },
  { rejectValue: string }
>("posts/createPost", async ({ text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Post>("/posts/", { text });
    return data;
  } catch (error) {
    return rejectWithValue(handleThunkError(error, "Erro ao criar post"));
  }
});

export const createComment = createAsyncThunk<
  PostComment,
  { postId: number; text: string },
  { rejectValue: string }
>("posts/createComment", async ({ postId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<PostComment>(`/posts/${postId}/comment/`, {
      text,
    });
    return data;
  } catch (error) {
    return rejectWithValue(
      handleThunkError(error, "Erro ao enviar comentário")
    );
  }
});

export const toggleLike = createAsyncThunk<
  {
    postId: number;
    is_liked: boolean;
    likes_delta: number;
    serverPost?: Post;
  },
  { postId: number },
  { rejectValue: string }
>("posts/toggleLike", async ({ postId }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/like/`);

    if (
      data &&
      typeof data === "object" &&
      "id" in data &&
      "likes_count" in data
    ) {
      const serverPost = data as Post;
      return {
        postId,
        is_liked: serverPost.is_liked,
        likes_delta: 0,
        serverPost,
      };
    }

    const message: string = data?.message ?? "";
    const is_liked = message === "Curtido";
    const likes_delta = is_liked ? 1 : -1;

    return { postId, is_liked, likes_delta };
  } catch (error) {
    return rejectWithValue(
      handleThunkError(error, "Erro ao curtir/descurtir post")
    );
  }
});

export const fetchUserPosts = createAsyncThunk<
  {
    results: Post[];
    count: number;
    next: string | null;
    previous: string | null;
  },
  { username: string; isInitialLoad?: boolean },
  { rejectValue: string }
>("posts/fetchUserPosts", async ({ username }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/posts/user/${username}/posts/`);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      handleThunkError(error, "Erro ao carregar posts do usuário")
    );
  }
});
