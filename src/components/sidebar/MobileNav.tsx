import { Bell, Home, Mail, Search, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const mobileItems = [
  { icon: Home, path: "/feed", label: "Página inicial" },
  { icon: Search, path: "/explorer", label: "Explorar" },
  { icon: Bell, path: "/notifications", label: "Notificações" },
  { icon: Mail, path: "/messages", label: "Mensagens" },
  { icon: User, path: "/profile", label: "Perfil" },
];

export default function MobileNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex justify-around items-center h-16 bg-white"
    >
      {mobileItems.map(({ icon: Icon, path, label }) => (
        <NavLink
          key={path}
          to={path}
          aria-label={label}
          // `aria-current="page"` sai do NavLink sozinho; a cor destaca o item ativo, que
          // antes não tinha indicação nenhuma, nem visual nem programática.
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive ? "text-black" : "text-gray-500 hover:text-black"
            }`
          }
        >
          <Icon size={26} />
        </NavLink>
      ))}
    </nav>
  );
}
