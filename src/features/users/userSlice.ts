import { createSlice } from "@reduxjs/toolkit";
import type { User } from "@/shared/api/types";
import {
  applyPage,
  emptyList,
  failLoading,
  startLoading,
  type PaginatedList,
} from "@/shared/paginated-list";
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserByUsername,
  fetchUsers,
  toggleFollow,
} from "@/features/users/userThunks";
import { updateProfile } from "@/features/auth/authThunks";

export interface UsersState {
  /** Perfil aberto no momento. */
  selectedUser: User | null;
  loadingSelectedUser: boolean;
  /** `fetchUserByUsername.rejected` descartava `action.payload` — uma falha de rede
   * virava `selectedUser: null` sem motivo nenhum guardado, e ProfilePage/PublicProfile
   * tratavam `!user` como "ainda carregando", travando num spinner para sempre. */
  selectedUserError: string | null;
  /** Listagem/busca de usuários. */
  list: PaginatedList<User>;
  followers: PaginatedList<User>;
  following: PaginatedList<User>;
  /** Ids com um toggle de seguir em voo, para desabilitar o botão certo. */
  loadingFollowIds: number[];
}

/**
 * O estado tinha 13 campos, com pares paralelos para followers e following
 * (`followersNext`/`followingNext`, `hasMoreFollowers`/`hasMoreFollowing`,
 * `loadingFollowers`/`loadingFollowing`) — a mesma máquina de estados copiada duas vezes,
 * mais uma terceira em `postSlice`. `PaginatedList` é essa forma, nomeada uma vez.
 */
const initialState: UsersState = {
  selectedUser: null,
  loadingSelectedUser: false,
  selectedUserError: null,
  list: emptyList<User>(),
  followers: emptyList<User>(),
  following: emptyList<User>(),
  loadingFollowIds: [],
};

/** Aplica uma mudança ao mesmo usuário em todas as listas onde ele apareça. */
function emCadaLista(state: UsersState, userId: number, aplicar: (user: User) => void) {
  for (const lista of [state.list, state.followers, state.following]) {
    const encontrado = lista.items.find((u) => u.id === userId);
    if (encontrado) aplicar(encontrado);
  }
  if (state.selectedUser?.id === userId) aplicar(state.selectedUser);
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearFollowLists(state) {
      state.followers = emptyList<User>();
      state.following = emptyList<User>();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => startLoading(state.list))
      .addCase(fetchUsers.fulfilled, (state, action) => {
        applyPage(state.list, action.payload.page, { reset: action.payload.reset });
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        // Uma requisição abortada (ExplorerPage cancela a anterior a cada tecla nova,
        // via AbortController) não é uma falha de busca — é a busca certa que ainda vai
        // chegar. Sem esta guarda, cada tecla digitada gravava um erro passageiro em
        // `list.error`, que a lista chegou a mostrar por uma fração de segundo.
        if (action.meta.aborted) return;
        failLoading(state.list, action.payload ?? "Erro ao buscar usuários.");
      });

    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.loadingSelectedUser = true;
        state.selectedUserError = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.loadingSelectedUser = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.loadingSelectedUser = false;
        state.selectedUser = null;
        state.selectedUserError = action.payload ?? "Não foi possível carregar o perfil.";
      });

    builder
      .addCase(fetchFollowers.pending, (state) => startLoading(state.followers))
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        applyPage(state.followers, action.payload.page, { reset: action.payload.reset });
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        failLoading(state.followers, action.payload ?? "Erro ao buscar seguidores.");
      });

    builder
      .addCase(fetchFollowing.pending, (state) => startLoading(state.following))
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        applyPage(state.following, action.payload.page, { reset: action.payload.reset });
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        failLoading(state.following, action.payload ?? "Erro ao buscar seguidos.");
      });

    builder
      .addCase(toggleFollow.pending, (state, action) => {
        state.loadingFollowIds.push(action.meta.arg);
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { userId, is_following, followers_count } = action.payload;
        // Alcança também `followers` e `following`. O reducer anterior corrigia apenas
        // `list` e `selectedUser`, então seguir alguém pela tela de seguidores deixava o
        // botão da outra aba com o estado errado.
        emCadaLista(state, userId, (user) => {
          user.is_following = is_following;
          user.followers_count = followers_count;
        });
        state.loadingFollowIds = state.loadingFollowIds.filter((id) => id !== userId);
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.loadingFollowIds = state.loadingFollowIds.filter((id) => id !== action.meta.arg);
        // O erro passa a ser guardado. `users.error` era escrito por quatro reducers e
        // lido por nenhum componente: uma falha ao seguir era completamente invisível.
        state.list.error = action.payload ?? "Erro ao seguir o usuário.";
      });

    // Mesmo acoplamento intencional do authSlice com fetchUserByUsername, na direção
    // oposta: quando o próprio usuário troca avatar/nome/username em "Editar perfil",
    // essa mudança precisa alcançar qualquer cópia dele já carregada aqui — perfil
    // visitado, listas de seguidores/seguindo e busca — sem esperar um novo fetch.
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      const u = action.payload;
      emCadaLista(state, u.id, (user) => {
        user.avatar_url = u.avatar_url;
        user.name = u.name;
        user.username = u.username;
      });
    });
  },
});

export const { clearFollowLists } = userSlice.actions;
export default userSlice.reducer;
