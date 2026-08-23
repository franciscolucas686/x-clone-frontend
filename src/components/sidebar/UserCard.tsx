import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import useClickOutside from "@/hooks/useClickOutside";
import UserMenu from "@/components/sidebar/UserMenu";
import { Avatar } from "@/ui/Avatar";

export default function UserCard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, () => setMenuOpen(false), menuOpen);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        className="flex w-full items-center justify-between p-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors duration-200 ease-in-out"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <Avatar
            src={user?.avatar_url ?? ""}
            name={user?.name || user?.username}
            size="sm"
            decorative
          />
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate">{user?.name}</p>
            <p className="text-gray-500 text-sm leading-tight truncate">@{user?.username}</p>
          </div>
        </div>

        {/* Decorativo: era um <button> aninhado dentro deste, e botão dentro de botão é
         * HTML inválido — o clique nunca chegava a ele mesmo, só ao pai. */}
        <span className="hidden md:block p-2">
          <MoreHorizontal size={20} aria-hidden="true" />
        </span>
      </button>

      {menuOpen && (
        <div className="absolute bottom-16 left-0 w-60 bg-white shadow-custom rounded-lg z-50">
          <UserMenu />
        </div>
      )}
    </div>
  );
}
