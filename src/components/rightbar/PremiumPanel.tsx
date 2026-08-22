import { X } from "lucide-react";
/**
 * Painel de planos.
 *
 * Vivia dentro de Rightbar.tsx — um segundo componente completo, de 69 das 136 linhas do
 * arquivo, com tela cheia e três planos. Um arquivo que exporta duas telas diferentes não
 * tem um motivo só para mudar, e quebra o Fast Refresh.
 *
 * Continua sendo maquete: os botões "Escolher plano" não têm ação. Está declarado como
 * tal no README, para que não pareça uma funcionalidade quebrada.
 */
export function PremiumPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-50 to-white overflow-y-auto flex flex-col items-center">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition cursor-pointer"
      >
        <X size={24} />
      </button>

      <div className="pt-20 pb-10 text-center px-4">
        <h1 className="text-4xl font-extrabold mb-4 cursor-default">Upgrade para Premium</h1>
        <p className="text-gray-600 text-lg cursor-default">
          Escolha o plano ideal para desbloquear todos os recursos.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl px-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-blue-500 transition w-full sm:w-[48%] lg:w-[30%] min-w-[320px] max-w-[450px] flex flex-col  cursor-pointer">
          <h2 className="text-xl font-semibold mb-2 cursor-pointer">Básico</h2>
          <p className="text-3xl font-bold mb-2 cursor-pointer">R$ 9,00</p>
          <p className="text-sm text-gray-500 mb-4 cursor-pointer">por mês</p>
          <ul className="text-gray-600 text-sm space-y-1 mb-6">
            <li>✔ Priorização básica</li>
            <li>✔ Itens salvos</li>
            <li>✔ Aba de Destaques</li>
          </ul>
          <button className=" mt-auto w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer">
            Escolher plano
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-blue-500 transition w-full sm:w-[48%] lg:w-[30%] min-w-[320px] max-w-[450px]  cursor-pointer">
          <h2 className="text-xl font-semibold mb-2 cursor-pointer">Premium</h2>
          <p className="text-3xl font-bold mb-2 cursor-pointer">R$ 23,00</p>
          <p className="text-sm text-gray-500 mb-4 cursor-pointer">por mês</p>
          <ul className="text-gray-600 text-sm space-y-1 mb-6">
            <li>✔ Tudo do Básico</li>
            <li>✔ Menos anúncios</li>
            <li>✔ Selo azul</li>
            <li>✔ Receba por post</li>
          </ul>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer">
            Escolher plano
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-blue-500 transition w-full sm:w-[48%] lg:w-[30%] min-w-[320px] max-w-[450px] cursor-pointer">
          <h2 className="text-xl font-semibold mb-2 cursor-pointer">Premium+</h2>
          <p className="text-3xl font-bold mb-2 cursor-pointer">R$ 140,00</p>
          <p className="text-sm text-gray-500 mb-4 cursor-pointer">por mês</p>
          <ul className="text-gray-600 text-sm space-y-1 mb-6">
            <li>✔ Sem anúncios</li>
            <li>✔ Priorização máxima</li>
            <li>✔ Escreva artigos</li>
            <li>✔ Radar e SuperGrok</li>
          </ul>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer">
            Escolher plano
          </button>
        </div>
      </div>
    </div>
  );
}
