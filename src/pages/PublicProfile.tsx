import { useState } from "react";
import { useParams } from "react-router-dom";
import FollowButton from "@/components/button/FollowButton";
import CommentModal from "@/components/modal/CommentModal";
import { PostList } from "@/features/posts/components/PostList";
import { ProfileHeader } from "@/features/users/components/ProfileHeader";
import { useProfile } from "@/features/users/hooks/useProfile";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

/** Perfil público de outro usuário. */
export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, loading, error, tentarDeNovo, posts, carregarMaisPosts } = useProfile(username);
  const actionError = useAppSelector((s) => s.posts.error);

  const [postComentado, setPostComentado] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  // `!user` sozinho era tratado como "ainda carregando" e ficava preso no spinner
  // acima para sempre quando a busca falhava — nada nunca tirava `loading` de `true`
  // de volta para `false` sem também preencher `user`. Agora uma falha tem seu próprio
  // estado, com uma saída.
  if (error || !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p role="alert" className="text-gray-500">
          {error ?? "Não foi possível carregar este perfil."}
        </p>
        <Button variant="secondary" onClick={tentarDeNovo}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ProfileHeader
        user={user}
        action={<FollowButton userId={user.id} isFollowing={user.is_following} />}
      />

      <div className="mt-4 border-t border-gray-200">
        <PostList
          list={posts}
          onLoadMore={carregarMaisPosts}
          onCommentClick={setPostComentado}
          emptyText="Este usuário ainda não publicou nada"
          actionError={actionError}
        />
      </div>

      {postComentado !== null && (
        <CommentModal postId={postComentado} onClose={() => setPostComentado(null)} />
      )}
    </div>
  );
}
