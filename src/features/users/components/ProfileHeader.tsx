import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/shared/api/types";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { formatJoinedDate } from "@/utils/date";

interface Props {
  user: User;
  /** Ação à direita do cabeçalho: "Editar perfil" no próprio, seguir no de outra pessoa. */
  action?: React.ReactNode;
}

/** Cabeçalho de perfil, comum às duas telas. */
export function ProfileHeader({ user, action }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-6 border-b border-gray-200 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="rounded-full p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          {/* Repete o nome que já é `<h1>` mais abaixo — é a barra fixa do topo, não um
           * segundo título da página. Era `<h2>`, e por vir primeiro no DOM invertia a
           * ordem dos headings: o `h2` aparecia antes do `h1` que ele deveria seguir. */}
          <p className="text-xl font-bold">{user.name || user.username}</p>
          <p className="text-sm text-gray-500">{user.posts_count} posts</p>
        </div>
      </div>

      <div className="h-32 bg-gray-300" />

      <div className="flex items-start justify-between px-4">
        <Avatar
          src={user.avatar_url}
          name={user.name || user.username}
          size="xl"
          className="-mt-12 border-4 border-white"
        />
        <div className="mt-3">{action}</div>
      </div>

      <div className="px-4 pt-3">
        <h1 className="text-xl font-bold">{user.name || user.username}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <p className="mt-2 text-sm text-gray-500">
          Entrou em {formatJoinedDate(user.joined_display)}
        </p>

        <div className="mt-3 flex gap-4 text-sm">
          <a href={`/follow/${user.username}/following`} className="hover:underline">
            <strong>{user.following_count}</strong> <span className="text-gray-500">Seguindo</span>
          </a>
          <a href={`/follow/${user.username}/followers`} className="hover:underline">
            <strong>{user.followers_count}</strong>{" "}
            <span className="text-gray-500">Seguidores</span>
          </a>
        </div>
      </div>
    </>
  );
}
