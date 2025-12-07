import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { handlePaginatedList } from "../../features/pagination/handler";
import type { User, UsersState } from "./types";
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserByUsername,
  fetchUsers,
  toggleFollow,
} from "./userThunks";

const initialState: UsersState = {
  selectedUser: null,
  loading: false,
  error: null,
  list: [],
  followers: [],
  following: [],
  followersNext: null,
  followingNext: null,
  hasMoreFollowers: true,
  hasMoreFollowing: true,
  loadingFollowers: false,
  loadingFollowing: false,
  loadingFollowIds: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearFollowLists(state) {
      state.followers = [];
      state.following = [];
      state.followersNext = null;
      state.followingNext = null;
      state.hasMoreFollowers = true;
      state.hasMoreFollowing = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserByUsername.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.selectedUser = action.payload;
          state.followers = [];
          state.following = [];
          state.followersNext = null;
          state.followingNext = null;
          state.hasMoreFollowers = true;
          state.hasMoreFollowing = true;
        }
      )
      .addCase(
        fetchUserByUsername.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.selectedUser = null;
          state.error = action.payload ?? "Erro ao buscar usuário";
        }
      )
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.list = action.payload;
      })
      .addCase(toggleFollow.pending, (state, action) => {
        state.loadingFollowIds.push(action.meta.arg);
      })
      .addCase(
        toggleFollow.fulfilled,
        (
          state,
          action: PayloadAction<{
            userId: number;
            isFollowing: boolean;
            delta: number;
          }>
        ) => {
          const { userId, isFollowing, delta } = action.payload;
          const target = state.list.find((u) => u.id === userId);
          if (target) {
            target.is_following = isFollowing;
            target.followers_count = (target.followers_count || 0) + delta;
          }
          if (state.selectedUser?.id === userId) {
            state.selectedUser.is_following = isFollowing;
            state.selectedUser.followers_count =
              (state.selectedUser.followers_count || 0) + delta;
          }
          state.loadingFollowIds = state.loadingFollowIds.filter(
            (id) => id !== userId
          );
        }
      )
      .addCase(toggleFollow.rejected, (state, action) => {
        state.loadingFollowIds = state.loadingFollowIds.filter(
          (id) => id !== action.meta.arg
        );
      })
      .addCase(fetchFollowers.pending, (state) => {
        state.loadingFollowers = true;
      })
      .addCase(
        fetchFollowers.fulfilled,
        (
          state,
          action: PayloadAction<{ results: User[]; next: string | null }>
        ) => {
          const { results, next } = action.payload;
          const { updatedList, hasMore } = handlePaginatedList(
            state.followers,
            results,
            next
          );
          state.followers = updatedList;
          state.followersNext = next;
          state.hasMoreFollowers = hasMore;
          state.loadingFollowers = false;
        }
      )
      .addCase(
        fetchFollowers.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loadingFollowers = false;
          state.error = action.payload ?? "Erro ao buscar seguidores";
        }
      )
      .addCase(fetchFollowing.pending, (state) => {
        state.loadingFollowing = true;
      })
      .addCase(
        fetchFollowing.fulfilled,
        (
          state,
          action: PayloadAction<{ results: User[]; next: string | null }>
        ) => {
          const { results, next } = action.payload;
          const { updatedList, hasMore } = handlePaginatedList(
            state.following,
            results,
            next
          );
          state.following = updatedList;
          state.followingNext = next;
          state.hasMoreFollowing = hasMore;
          state.loadingFollowing = false;
        }
      )
      .addCase(
        fetchFollowing.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loadingFollowing = false;
          state.error = action.payload ?? "Erro ao buscar seguidos";
        }
      );
  },
});

export const { clearFollowLists } = usersSlice.actions;
export default usersSlice.reducer;
