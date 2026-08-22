import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Action } from "@reduxjs/toolkit";
import authReducer, { sessionExpired } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authThunks";
import postReducer from "@/features/posts/postSlice";
import userReducer from "@/features/users/userSlice";

const appReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  posts: postReducer,
});

type AppState = ReturnType<typeof appReducer>;

/**
 * Zera o estado inteiro quando a sessão termina.
 *
 * `logoutUser` só apagava o token e limpava o authSlice. Os slices `posts` e `users`
 * continuavam com o feed, o perfil e as listas do usuário anterior — então sair e entrar
 * com outra conta na mesma aba mostrava os dados de quem saiu até cada tela refazer o
 * fetch. Como um F5 resolvia, o defeito era intermitente e difícil de reproduzir.
 *
 * Feito aqui, no reducer raiz, e não com um `extraReducer` por slice: passando `undefined`
 * adiante, cada slice volta ao seu próprio initialState, e um slice novo herda o
 * comportamento sem ninguém precisar lembrar de registrá-lo.
 */
const rootReducer = (state: AppState | undefined, action: Action): AppState => {
  if (action.type === logoutUser.fulfilled.type || action.type === sessionExpired.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

/**
 * Fábrica em vez de um único store no escopo do módulo.
 *
 * O app usa a instância `store` exportada abaixo, mas os testes precisam de um store novo
 * por render: com um singleton, o estado de um teste vaza para o próximo e a ordem de
 * execução passa a alterar o resultado.
 */
export const createStore = () => configureStore({ reducer: rootReducer });

export const store = createStore();

export type AppStore = ReturnType<typeof createStore>;
export type RootState = AppState;
export type AppDispatch = AppStore["dispatch"];
