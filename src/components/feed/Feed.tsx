import { useEffect, useState } from "react";
import CommentModal from "@/components/modal/CommentModal";
import { PostComposer } from "@/features/posts/components/PostComposer";
import { PostList } from "@/features/posts/components/PostList";
import { fetchFollowingPosts } from "@/features/posts/postThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";

/**
 * Feed de quem o usuário segue.
 *
 * Fazia cinco coisas: buscava dados, renderizava o formulário de publicação, listava os
 * posts, controlava a paginação e hospedava o modal de comentários. Hoje compõe.
 */
export default function Feed() {
  const dispatch = useAppDispatch();
  const feed = useAppSelector((s) => s.posts.feed);
  const [postComentado, setPostComentado] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFollowingPosts());
  }, [dispatch]);

  const carregarMais = () => {
    if (feed.loading || !feed.next) return;
    dispatch(fetchFollowingPosts({ cursor: feed.next }));
  };

  return (
    <div>
      <PostComposer />

      <PostList
        list={feed}
        onLoadMore={carregarMais}
        onCommentClick={setPostComentado}
        emptyText="Não há nenhum post"
      />

      {postComentado !== null && (
        <CommentModal postId={postComentado} onClose={() => setPostComentado(null)} />
      )}
    </div>
  );
}
