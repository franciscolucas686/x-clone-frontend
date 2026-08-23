import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import UserMenu from "@/components/sidebar/UserMenu";
import { Avatar } from "@/ui/Avatar";
import { Modal } from "@/ui/Modal";

/**
 * Logout no mobile.
 *
 * A Sidebar — e com ela UserCard/UserMenu, o único "Sair" que existia — some abaixo de
 * `md` (AppLayout.tsx). Sem isto, não havia como encerrar a sessão pelo celular; a única
 * saída era `sessionExpired` ou limpar o armazenamento na mão.
 *
 * Reaproveita o `UserMenu` que a Sidebar já usa, em vez de duplicar a chamada a
 * `logoutUser` — um só lugar decide o que "sair" significa.
 */
export default function AccountSheet({ onClose }: { onClose: () => void }) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Modal onClose={onClose} title="Conta" position="bottom" className="max-w-none">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar_url ?? ""}
            name={user?.name || user?.username}
            size="lg"
            decorative
          />
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate">{user?.name}</p>
            <p className="text-gray-500 text-sm leading-tight truncate">@{user?.username}</p>
          </div>
        </div>

        <Link
          to="/profile"
          onClick={onClose}
          className="rounded-lg px-4 py-2 font-semibold hover:bg-gray-100"
        >
          Ver perfil
        </Link>

        <UserMenu />
      </div>
    </Modal>
  );
}
