import { useState } from "react";
import { useParams } from "react-router-dom";
import FollowButton from "@/components/button/FollowButton";
import CommentModal from "@/components/modal/CommentModal";
import { PostList } from "@/features/posts/components/PostList";
import { ProfileHeader } from "@/features/users/components/ProfileHeader";
import { useProfile } from "@/features/users/hooks/useProfile";
import { Spinner } from "@/ui/Spinner";

/** Perfil público de outro usuário. */
export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, loading, posts, carregarMaisPosts } = useProfile(username);

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
        action={<FollowButton userId={user.id} isFollowing={user.is_following} />}
      />

      <div className="mt-4 border-t border-gray-200">
        <PostList
          list={posts}
          onLoadMore={carregarMaisPosts}
          onCommentClick={setPostComentado}
          emptyText="Este usuário ainda não publicou nada"
        />
      </div>

      {postComentado !== null && (
        <CommentModal postId={postComentado} onClose={() => setPostComentado(null)} />
      )}
    </div>
  );
}
