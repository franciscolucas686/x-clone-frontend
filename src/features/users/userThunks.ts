import { createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "@/features/users/api/user-service";
import { getErrorMessage } from "@/shared/api/api-error";
import type { FollowToggleResponse, PaginatedResponse, User } from "@/shared/api/types";

/**
 * Os thunks devolvem a página do servidor como ela veio.
 *
 * `fetchUsers` e `fetchUserByUsername` recopiavam os nove campos do usuário à mão, com
 * `?? 0` e `?? false` em cada um — dez linhas idênticas duplicadas nos dois. Era código
 * defensivo compensando um contrato em que não se confiava; com os tipos fiéis aos
 * serializers (shared/api/types.ts), não há o que remapear.
 */

interface Pagina {
  page: PaginatedResponse<User>;
  reset: boolean;
}

export const fetchUsers = createAsyncThunk<
  Pagina,
  { search?: string; cursor?: string | null } | void,
  { rejectValue: string }
>("users/fetchUsers", async (arg, { rejectWithValue, signal }) => {
  const params = arg ?? {};
  try {
    return { page: await userService.fetchUsers(params, signal), reset: !params.cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserByUsername = createAsyncThunk<User, string, { rejectValue: string }>(
  "users/fetchUserByUsername",
  async (username, { rejectWithValue }) => {
    try {
      // Sem o desvio para `/profile/` quando é o próprio usuário: `/users/<username>/`
      // devolve o mesmo `UserProfileSerializer` para qualquer um, incluindo o
      // `is_following` calculado em relação a quem pergunta. O ramo existia porque o
      // cliente não confiava nisso.
      return await userService.fetchUserByUsername(username);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const toggleFollow = createAsyncThunk<
  { userId: number } & FollowToggleResponse,
  number,
  { rejectValue: string }
>("users/toggleFollow", async (userId, { rejectWithValue }) => {
  try {
    // O servidor devolve o contador já atualizado; o cliente não soma nem subtrai delta.
    return { userId, ...(await userService.toggleFollow(userId)) };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchFollowers = createAsyncThunk<
  Pagina,
  { userId: number; cursor?: string | null },
  { rejectValue: string }
>("users/fetchFollowers", async ({ userId, cursor }, { rejectWithValue }) => {
  try {
    return { page: await userService.fetchFollowers(userId, cursor), reset: !cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchFollowing = createAsyncThunk<
  Pagina,
  { userId: number; cursor?: string | null },
  { rejectValue: string }
>("users/fetchFollowing", async ({ userId, cursor }, { rejectWithValue }) => {
  try {
    return { page: await userService.fetchFollowing(userId, cursor), reset: !cursor };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
