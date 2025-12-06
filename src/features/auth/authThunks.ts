import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { handleThunkError } from "../../utils/errors";
import type { User } from "../users/types";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  password?: string;
  confirm_password?: string;
  avatar?: File | null;
}

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  localStorage.removeItem("access");
  return null;
});

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/token/", credentials);
    const token = res.data.access as string;

    localStorage.setItem("access", token);

    const userRes = await api.get<User>("/profile/");
    return { token, user: userRes.data };
  } catch (err) {
    return rejectWithValue(
      handleThunkError(err, "Falha ao fazer login. Tente novamente.")
    );
  }
});

export const registerUser = createAsyncThunk<
  LoginResponse,
  RegisterCredentials,
  { rejectValue: string }
>("auth/registerUser", async (credentials, { rejectWithValue }) => {
  try {
    await api.post("/register/", {
      username: credentials.username,
      name: credentials.name,
      password: credentials.password,
      confirm_password: credentials.confirmPassword,
    });

    const loginRes = await api.post("/token/", {
      username: credentials.username,
      password: credentials.password,
    });

    const token = loginRes.data.access as string;
    localStorage.setItem("access", token);

    const userRes = await api.get("/profile/");

    return { token, user: userRes.data } as LoginResponse;
  } catch (err) {
    return rejectWithValue(handleThunkError(err, "Erro ao registrar usuário."));
  }
});

export const restoreUser = createAsyncThunk<User | null>(
  "auth/restoreUser",
  async () => {
    const token = localStorage.getItem("access");
    if (!token) return null;

    const res = await api.get("/profile/");

    return res.data;
  }
);

export const updateProfile = createAsyncThunk<
  User,
  UpdateProfilePayload,
  { rejectValue: string }
>("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    const res = await api.patch<User>("/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err) {
    return rejectWithValue(
      handleThunkError(err, "Erro ao atualizar o perfil.")
    );
  }
});
