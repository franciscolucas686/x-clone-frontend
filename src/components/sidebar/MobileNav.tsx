import { Bell, Home, Mail, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const mobileItems = [
  { icon: Home, path: "/feed" },
  { icon: Search, path: "/explorer" },
  { icon: Bell, path: "/notifications" },
  { icon: Mail, path: "/messages" },
  { icon: User, path: "/profile" },
];

export default function MobileNav() {
  return (
    <nav className="flex justify-around items-center h-16 bg-white">
      {mobileItems.map(({ icon: Icon, path }) => (
        <Link
          key={path}
          to={path}
          className="flex flex-col items-center justify-center p-2"
        >
          <Icon size={26} />
        </Link>
      ))}
    </nav>
  );
}
