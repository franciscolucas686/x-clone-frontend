import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../../app/store";
import { handleThunkError } from "../../utils/errors";
import type { PaginatedUsersResponse, User } from "./types";

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<PaginatedUsersResponse>("/users/");
    return response.data.results.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar_url: u.avatar_url,
      joined_display: u.joined_display ?? "",
      followers_count: u.followers_count ?? 0,
      following_count: u.following_count ?? 0,
      is_following: u.is_following ?? false,
      posts_count: u.posts_count ?? 0,
    }));
  } catch (error: unknown) {
    return rejectWithValue(handleThunkError(error, "Erro ao buscar usuários."));
  }
});

export const toggleFollow = createAsyncThunk<
  { userId: number; isFollowing: boolean; delta: number },
  number,
  { state: RootState; rejectValue: string }
>("users/toggleFollow", async (userId, { rejectWithValue }) => {
  try {
    const response = await api.post<{ is_following: boolean }>(
      `/follow/${userId}/toggle/`
    );
    const { is_following } = response.data;
    return { userId, isFollowing: is_following, delta: is_following ? 1 : -1 };
  } catch (error: unknown) {
    return rejectWithValue(
      handleThunkError(error, "Erro ao seguir/seguir usuário.")
    );
  }
});

export const fetchUserByUsername = createAsyncThunk<
  User,
  string,
  { state: RootState; rejectValue: string }
>(
  "users/fetchUserByUsername",
  async (username, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const loggedUsername = auth.user?.username;
      const endpoint =
        username === loggedUsername ? "/profile/" : `/users/${username}/`;
      const response = await api.get<User>(endpoint);
      const data = response.data;
      return {
        id: data.id,
        username: data.username,
        name: data.name,
        avatar_url: data.avatar_url,
        joined_display: data.joined_display ?? "",
        followers_count: data.followers_count ?? 0,
        following_count: data.following_count ?? 0,
        is_following: data.is_following ?? false,
        posts_count: data.posts_count ?? 0,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        handleThunkError(error, "Erro ao buscar usuário.")
      );
    }
  }
);

export const fetchFollowers = createAsyncThunk<
  PaginatedUsersResponse,
  { userId: number; url?: string },
  { rejectValue: string }
>("users/fetchFollowers", async ({ userId, url }, { rejectWithValue }) => {
  try {
    const endpoint = url ?? `/follow/${userId}/followers/`;
    const response = await api.get<PaginatedUsersResponse>(endpoint);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      handleThunkError(error, "Erro ao buscar seguidores.")
    );
  }
});

export const fetchFollowing = createAsyncThunk<
  PaginatedUsersResponse,
  { userId: number; url?: string },
  { rejectValue: string }
>("users/fetchFollowing", async ({ userId, url }, { rejectWithValue }) => {
  try {
    const endpoint = url ?? `/follow/${userId}/following/`;
    const response = await api.get<PaginatedUsersResponse>(endpoint);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleThunkError(error, "Erro ao buscar seguidos."));
  }
});
