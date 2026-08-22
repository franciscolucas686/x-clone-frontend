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
  const { user, loading, posts, carregarMaisPosts } = useProfile(usuarioLogado?.username);

  const [editando, setEditando] = useState(false);
  const [postComentado, setPostComentado] = useState<number | null>(null);

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={40} color="border-t-blue-500" />
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
        />
      </div>

      {editando && <EditProfileModal onClose={() => setEditando(false)} />}
      {postComentado !== null && (
        <CommentModal postId={postComentado} onClose={() => setPostComentado(null)} />
      )}
    </div>
  );
}
