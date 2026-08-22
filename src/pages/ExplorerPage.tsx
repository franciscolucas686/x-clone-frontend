import { useEffect, useState } from "react";
import { UserList } from "@/features/users/components/UserList";
import { fetchUsers } from "@/features/users/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Input } from "@/ui/Field";

/** Busca de usuários. */
export default function ExplorerPage() {
  const dispatch = useAppDispatch();
  const list = useAppSelector((s) => s.users.list);
  const [termo, setTermo] = useState("");

  useEffect(() => {
    // Debounce: sem ele, cada tecla dispara uma requisição — e o backend agora tem
    // limite por IP, então digitar rápido gastaria a cota à toa.
    const id = setTimeout(() => {
      dispatch(fetchUsers({ search: termo }));
    }, 300);
    return () => clearTimeout(id);
  }, [termo, dispatch]);

  const carregarMais = () => {
    if (!list.loading && list.next) dispatch(fetchUsers({ search: termo, cursor: list.next }));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Explorar</h1>

      <Input
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar por nome ou @usuário"
        aria-label="Buscar por nome ou usuário"
      />

      {/*
        A busca acontece no servidor (?search=). Antes o filtro era `users.filter(...)`
        no cliente, sobre a página já carregada — e como a página tem 10 itens, buscar
        significava procurar entre os 10 primeiros usuários do sistema.
      */}
      <UserList
        list={list}
        onLoadMore={carregarMais}
        emptyText={termo ? `Nenhum usuário encontrado para "${termo}"` : "Nenhum usuário por aqui"}
      />
    </div>
  );
}
