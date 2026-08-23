import { Link } from "react-router-dom";
import FollowButton from "@/components/button/FollowButton";
import { Avatar } from "@/ui/Avatar";
import type { User } from "@/shared/api/types";

/**
 * Linha de usuário com avatar, nome e botão de seguir.
 *
 * O mesmo bloco estava duplicado entre ExplorerPage e FollowListPage, incluindo a mesma
 * string de classes de 90 caracteres.
 */
export function UserRow({ user }: { user: User }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50">
      <Link to={`/user/${user.username}`} className="flex min-w-0 items-center gap-3">
        <Avatar src={user.avatar_url} name={user.name || user.username} size="md" decorative />
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.name || user.username}</p>
          <p className="truncate text-sm text-gray-500">@{user.username}</p>
        </div>
      </Link>
      <FollowButton userId={user.id} isFollowing={user.is_following} />
    </li>
  );
}
