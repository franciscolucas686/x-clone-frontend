import { createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "@/features/auth/api/auth-service";
import type { UpdateProfilePayload } from "@/features/auth/api/auth-service";
import { getErrorMessage } from "@/shared/api/api-error";
import { clearToken, getToken, setToken } from "@/shared/api/auth-storage";
import type { User } from "@/shared/api/types";

export type { UpdateProfilePayload };

export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credenciais, { rejectWithValue }) => {
  try {
    // Duas idas ao servidor porque `/token/` devolve só os tokens, sem o usuário. É uma
    // limitação do contrato do simplejwt, e está anotada como próximo passo no README.
    const { access } = await authService.obtainToken(credenciais);
    setToken(access);
    return await authService.fetchProfile();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const registerUser = createAsyncThunk<
  User,
  { username: string; name: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/registerUser", async (dados, { rejectWithValue }) => {
  try {
    await authService.register({
      username: dados.username,
      name: dados.name,
      password: dados.password,
      confirm_password: dados.confirmPassword,
    });
    const { access } = await authService.obtainToken({
      username: dados.username,
      password: dados.password,
    });
    setToken(access);
    return await authService.fetchProfile();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  clearToken();
  return null;
});

/**
 * Restaura a sessão no boot do app.
 *
 * Os três casos deste thunk é que alimentam o `status` do slice. Antes ele não tinha
 * `.pending` nem `.rejected`, então `auth.loading` nunca ficava `true` durante o boot —
 * e o PrivateRoute usava `setTimeout(2000)` como substituto.
 */
export const restoreUser = createAsyncThunk<User | null, void, { rejectValue: string }>(
  "auth/restoreUser",
  async (_, { rejectWithValue }) => {
    if (!getToken()) return null;
    try {
      return await authService.fetchProfile();
    } catch (error) {
      // Token inválido ou expirado: descarta e segue como anônimo. Sem o try/catch, a
      // rejeição não era tratada em lugar nenhum.
      clearToken();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk<User, UpdateProfilePayload, { rejectValue: string }>(
  "auth/updateProfile",
  async (dados, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(dados);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
