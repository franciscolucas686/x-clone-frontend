import { useEffect } from "react";
import { clearUserPosts } from "@/features/posts/postSlice";
import { fetchUserPosts } from "@/features/posts/postThunks";
import { fetchUserByUsername } from "@/features/users/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";

/**
 * Carrega um perfil e a timeline dele.
 *
 * `ProfilePage` (183 linhas) e `PublicProfile` (161) eram a mesma página com quatro
 * diferenças: de quem é o perfil, botão Editar contra botão Seguir, um bloco de nome a
 * mais, e o texto do spinner. Três trechos de JSX eram idênticos byte a byte, e o efeito
 * de carga estava copiado nos dois — inclusive um `setTimeout(500)` fazendo as vezes de
 * estado de carregamento.
 */
export function useProfile(username: string | undefined) {
  const dispatch = useAppDispatch();
  const { selectedUser, loadingSelectedUser, selectedUserError } = useAppSelector((s) => s.users);
  const posts = useAppSelector((s) => s.posts.userPosts);

  useEffect(() => {
    if (!username) return;

    // Limpa antes de buscar: sem isto, navegar de um perfil para outro mostra os posts
    // do anterior enquanto os novos carregam.
    dispatch(clearUserPosts());
    dispatch(fetchUserByUsername(username));
    dispatch(fetchUserPosts({ username }));
  }, [username, dispatch]);

  const carregarMaisPosts = () => {
    if (!username || posts.loading || !posts.next) return;
    dispatch(fetchUserPosts({ username, cursor: posts.next }));
  };

  // Perfil de novo, sem tocar nos posts: é o que "tentar de novo" precisa depois de uma
  // falha, sem duplicar a página de posts que talvez já tenha carregado.
  const tentarDeNovo = () => {
    if (username) dispatch(fetchUserByUsername(username));
  };

  return {
    user: selectedUser,
    // Um estado de carregamento de verdade, alimentado pelos três casos do thunk. O que
    // havia era `setTimeout(() => setLocalLoading(false), 500)`.
    loading: loadingSelectedUser,
    // Antes, uma falha de rede virava `selectedUser: null` sem mais nada: as telas
    // liam `!user` como "ainda carregando" e ficavam presas no spinner para sempre.
    error: selectedUserError,
    tentarDeNovo,
    posts,
    carregarMaisPosts,
  };
}
