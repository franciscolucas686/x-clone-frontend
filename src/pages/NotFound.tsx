import { Link } from "react-router-dom";

/**
 * Rota inexistente.
 *
 * Não havia `*` no roteador: uma URL desconhecida renderizava um `<Routes>` vazio, ou
 * seja, uma tela em branco sem nada indicando o que aconteceu.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Esta página não existe</h1>
      <p className="text-gray-500">O endereço que você abriu não corresponde a nada por aqui.</p>
      <Link to="/" className="font-semibold text-blue-500 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
