import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { User } from "@/shared/api/types";
import { fetchUserByUsername } from "@/features/users/userThunks";
import {
  loginUser,
  logoutUser,
  registerUser,
  restoreUser,
  updateProfile,
} from "@/features/auth/authThunks";

/**
 * Estado da sessão.
 *
 * `checking` é o estado que faltava. Sem ele, `PrivateRoute` não tinha como distinguir
 * "ainda não sei se há sessão" de "não há sessão", e usava um `setTimeout(2000)` fixo
 * para dar tempo ao `/profile/` responder: toda navegação para uma rota privada custava
 * dois segundos, mesmo com a sessão já conhecida, e se a requisição demorasse mais que
 * isso o usuário era mandado para a tela de login com sessão válida.
 */
type Status = "checking" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  status: Status;
  /** Requisição de login/cadastro/atualização em voo. */
  submitting: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "checking",
  submitting: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    /**
     * Disparada pelo api-client quando um 401 chega fora das rotas de credencial.
     *
     * O interceptor não navega mais sozinho: avisa, o estado muda, e o PrivateRoute
     * reage. Antes ele fazia `window.location.href = "/"` — um reload completo, que
     * descartava o store e engolia a mensagem que o próprio thunk acabara de gravar.
     *
     * O rootReducer em app/store.ts intercepta esta ação e zera todos os slices — mas
     * repassa a ação adiante, então este reducer roda **depois** do reset e corrige o
     * único campo que o reset deixa errado.
     *
     * O corpo já foi vazio, e isso era o bug: zerado, o slice volta ao initialState, cujo
     * status é `checking`. Como `restoreUser` só é despachado no mount do AppRoutes,
     * ninguém tirava o status de lá — e PrivateRoute/PublicRoute renderizam um Spinner
     * `fixed inset-0` enquanto ele durar. O usuário saía da conta e ficava olhando um
     * spinner até apertar F5. `checking` significa "ainda não sei se há sessão"; aqui já
     * se sabe: não há.
     */
    sessionExpired: (state) => {
      state.status = "anonymous";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreUser.pending, (state) => {
        state.status = "checking";
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "anonymous";
      })
      .addCase(restoreUser.rejected, (state) => {
        state.user = null;
        state.status = "anonymous";
      })
      // Mesmo motivo do `sessionExpired` acima: sem este caso, sair da conta deixava o
      // status em `checking` e travava o app no spinner de tela cheia.
      //
      // `logoutUser` não faz chamada de rede de propósito — não existe rota de logout em
      // backend/urls.py, e o simplejwt só revoga refresh token na rotação. Se um dia
      // existir, é lá que ela entra, não aqui.
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "anonymous";
      });

    for (const thunk of [loginUser, registerUser]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.submitting = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.submitting = false;
          state.user = action.payload;
          state.status = "authenticated";
        })
        .addCase(thunk.rejected, (state, action) => {
          state.submitting = false;
          state.error = action.payload?.message ?? "Não foi possível continuar.";
        });
    }

    builder
      .addCase(updateProfile.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message ?? "Não foi possível salvar o perfil.";
      });

    builder.addCase(fetchUserByUsername.fulfilled, (state, action) => {
      // Mantém o usuário da sessão em dia quando o perfil dele é recarregado por outra
      // tela. É acoplamento entre features, mas o alternativo — cada tela lembrar de
      // sincronizar — é pior.
      if (state.user && state.user.username === action.payload.username) {
        state.user = action.payload;
      }
    });
  },
});

export const { setError, clearError, sessionExpired } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
