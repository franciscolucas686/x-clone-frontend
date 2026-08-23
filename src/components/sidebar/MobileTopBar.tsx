import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Xlogo } from "@/components/icons/Xlogo";
import AccountSheet from "@/components/sidebar/AccountSheet";
import { Avatar } from "@/ui/Avatar";

/**
 * Barra do topo, só no mobile (`md:hidden` — ver AppLayout.tsx).
 *
 * É a forma do produto real: avatar à esquerda abrindo a conta, logo ao centro. Os cinco
 * itens da MobileNav não mudam — esta barra existe só para dar ao mobile uma entrada de
 * conta, que a Sidebar escondida deixou de oferecer.
 */
export default function MobileTopBar() {
  const { user } = useAppSelector((state) => state.auth);
  const [contaAberta, setContaAberta] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-center border-b border-gray-200 bg-white/90 p-2 backdrop-blur">
      <button
        type="button"
        onClick={() => setContaAberta(true)}
        aria-label="Conta"
        className="absolute left-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Avatar
          src={user?.avatar_url ?? ""}
          name={user?.name || user?.username}
          size="xs"
          decorative
        />
      </button>

      <Link to="/feed" aria-label="Ir para a página inicial">
        <Xlogo className="h-7 w-7" />
      </Link>

      {contaAberta && <AccountSheet onClose={() => setContaAberta(false)} />}
    </header>
  );
}
