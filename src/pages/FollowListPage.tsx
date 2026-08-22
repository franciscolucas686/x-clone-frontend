import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { UserList } from "@/features/users/components/UserList";
import { fetchFollowers, fetchFollowing, fetchUserByUsername } from "@/features/users/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Button } from "@/ui/Button";
import { cn } from "@/ui/cn";

/** Seguidores e seguindo de um usuário, em duas abas. */
export default function FollowListPage() {
  const { username } = useParams<{ username: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const abaAtiva = pathname.endsWith("/following") ? "following" : "followers";
  const { selectedUser, followers, following } = useAppSelector((s) => s.users);
  const lista = abaAtiva === "following" ? following : followers;

  useEffect(() => {
    if (username) dispatch(fetchUserByUsername(username));
  }, [username, dispatch]);

  useEffect(() => {
    if (!selectedUser) return;
    // Só a aba visível é buscada. Antes as duas eram disparadas na montagem, mesmo com
    // uma só na tela — e como cada aba é uma <Route> separada apontando para o mesmo
    // componente, trocar de aba remontava tudo e refazia três requisições.
    const buscar = abaAtiva === "following" ? fetchFollowing : fetchFollowers;
    dispatch(buscar({ userId: selectedUser.id }));
  }, [selectedUser, abaAtiva, dispatch]);

  const carregarMais = () => {
    if (!selectedUser || lista.loading || !lista.next) return;
    const buscar = abaAtiva === "following" ? fetchFollowing : fetchFollowers;
    dispatch(buscar({ userId: selectedUser.id, cursor: lista.next }));
  };

  return (
    <div>
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
        <h1 className="text-xl font-bold">@{username}</h1>
      </div>

      <div role="tablist" className="flex border-b border-gray-200">
        {(
          [
            ["followers", "Seguidores"],
            ["following", "Seguindo"],
          ] as const
        ).map(([chave, rotulo]) => (
          <Link
            key={chave}
            to={`/follow/${username}/${chave}`}
            role="tab"
            aria-selected={abaAtiva === chave}
            className={cn(
              "flex-1 py-3 text-center font-semibold transition hover:bg-gray-100",
              abaAtiva === chave ? "border-b-2 border-black" : "text-gray-500",
            )}
          >
            {rotulo}
          </Link>
        ))}
      </div>

      <div className="p-4">
        <UserList
          list={lista}
          onLoadMore={carregarMais}
          emptyText={
            abaAtiva === "following" ? "Ainda não segue ninguém" : "Ainda não tem seguidores"
          }
        />
      </div>
    </div>
  );
}
