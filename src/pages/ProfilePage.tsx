import { useState } from "react";
import EditProfileModal from "@/components/modal/EditProfileModal";
import CommentModal from "@/components/modal/CommentModal";
import { PostList } from "@/features/posts/components/PostList";
import { ProfileHeader } from "@/features/users/components/ProfileHeader";
import { useProfile } from "@/features/users/hooks/useProfile";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

/** Perfil do usuário autenticado. */
export default function ProfilePage() {
  const usuarioLogado = useAppSelector((s) => s.auth.user);
  const actionError = useAppSelector((s) => s.posts.error);
  const { user, loading, error, tentarDeNovo, posts, carregarMaisPosts } = useProfile(
    usuarioLogado?.username,
  );

  const [editando, setEditando] = useState(false);
  const [postComentado, setPostComentado] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  // Mesmo defeito do PublicProfile: `!user` sozinho era lido como "ainda carregando" e
  // uma falha na busca prendia a tela no spinner acima para sempre.
  if (error || !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p role="alert" className="text-gray-500">
          {error ?? "Não foi possível carregar seu perfil."}
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
        action={
          <Button variant="secondary" onClick={() => setEditando(true)}>
            Editar perfil
          </Button>
        }
      />

      <div className="mt-4 border-t border-gray-200">
        <PostList
          list={posts}
          onLoadMore={carregarMaisPosts}
          onCommentClick={setPostComentado}
          emptyText="Você ainda não publicou nada"
          actionError={actionError}
        />
      </div>

      {editando && <EditProfileModal onClose={() => setEditando(false)} />}
      {postComentado !== null && (
        <CommentModal postId={postComentado} onClose={() => setPostComentado(null)} />
      )}
    </div>
  );
}
