import type { User } from "@/shared/api/types";
import type { PaginatedList } from "@/shared/paginated-list";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";
import { UserRow } from "@/features/users/components/UserRow";

interface Props {
  list: PaginatedList<User>;
  onLoadMore: () => void;
  emptyText: string;
}

/** Lista de usuários com carregamento, estado vazio e paginação. */
export function UserList({ list, onLoadMore, emptyText }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {list.loading && list.items.length === 0 && (
        <div className="flex justify-center py-6">
          <Spinner size={28} />
        </div>
      )}

      {list.error && (
        <p role="alert" className="py-4 text-center text-red-500">
          {list.error}
        </p>
      )}

      {!list.loading && !list.error && list.items.length === 0 && (
        // O ExplorerPage e o FollowListPage não tinham estado vazio: uma busca sem
        // resultado renderizava um contêiner em branco, indistinguível de erro.
        //
        // `!list.error` é o que faltava para as duas mensagens (erro e vazio) pararem
        // de aparecer juntas quando a busca falhava.
        <p className="py-6 text-center text-gray-500">{emptyText}</p>
      )}

      <ul className="flex flex-col gap-3">
        {list.items.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </ul>

      {list.next && !list.loading && (
        <Button variant="secondary" onClick={onLoadMore} className="self-center">
          Ver mais
        </Button>
      )}

      {/* PostList já tinha este segundo spinner para "carregando a próxima página"; esta
       * lista só tinha o primeiro, e "Ver mais" simplesmente sumia sem indicar nada
       * enquanto a próxima página vinha. */}
      {list.loading && list.items.length > 0 && (
        <div className="flex justify-center py-4">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
