import Post from "@/components/feed/Post";
import type { Post as PostType } from "@/shared/api/types";
import type { PaginatedList } from "@/shared/paginated-list";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

interface Props {
  list: PaginatedList<PostType>;
  onLoadMore: () => void;
  onCommentClick: (postId: number) => void;
  emptyText?: string;
  /** Erro de uma ação sobre um post já carregado — publicar, curtir, comentar — e não
   * da busca da lista em si (essa já tem `list.error`). Escrito em `postSlice.error` e,
   * antes desta prop existir, lido por ninguém: uma curtida que falhava era
   * completamente silenciosa. */
  actionError?: string | null;
}

/**
 * Lista de posts com carregamento, estado vazio e "ver mais".
 *
 * O mesmo trio — spinner inicial, mensagem de vazio, botão de próxima página — estava
 * escrito à mão no Feed, no ProfilePage e no PublicProfile, com condições ligeiramente
 * diferentes em cada um.
 */
export function PostList({
  list,
  onLoadMore,
  onCommentClick,
  emptyText = "Ainda não há posts",
  actionError,
}: Props) {
  // `!list.error` é o que faltava: sem ele, uma falha de rede renderizava a mensagem de
  // erro **e** "nenhum post encontrado" ao mesmo tempo, porque as duas condições liam
  // só `loading`/`items.length` e nenhuma olhava a outra.
  const vazio = !list.loading && !list.error && list.items.length === 0;

  return (
    <div>
      {list.loading && list.items.length === 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={30} />
        </div>
      )}

      {list.error && (
        <p role="alert" className="py-4 text-center text-red-500">
          {list.error}
        </p>
      )}

      {actionError && (
        <p role="alert" className="py-4 text-center text-red-500">
          {actionError}
        </p>
      )}

      {vazio && <p className="py-6 text-center text-gray-500">{emptyText}</p>}

      {list.items.map((post) => (
        <Post key={post.id} post={post} onCommentClick={() => onCommentClick(post.id)} />
      ))}

      {list.next && !list.loading && (
        <div className="flex justify-center py-4">
          <Button variant="secondary" onClick={onLoadMore}>
            Ver mais postagens
          </Button>
        </div>
      )}

      {list.loading && list.items.length > 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={25} />
        </div>
      )}
    </div>
  );
}
