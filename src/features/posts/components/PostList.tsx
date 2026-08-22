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
}: Props) {
  const vazio = !list.loading && list.items.length === 0;

  return (
    <div>
      {list.loading && list.items.length === 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={30} color="border-t-blue-500" />
        </div>
      )}

      {list.error && (
        <p role="alert" className="py-4 text-center text-red-500">
          {list.error}
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
          <Spinner size={25} color="border-t-blue-500" />
        </div>
      )}
    </div>
  );
}
