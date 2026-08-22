import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Impede que um erro de renderização apague a tela inteira.
 *
 * Não havia nenhum: qualquer `throw` durante o render deixava a página em branco, sem
 * mensagem e sem caminho de volta.
 *
 * Mostra a mensagem real de propósito, contra o instinto de exibir um "algo deu errado"
 * genérico: quem vê uma tela de erro é quem precisa consertá-la, e o lugar onde a falha é
 * reproduzível costuma ser um aparelho sem ferramentas de desenvolvedor abertas.
 *
 * Cobre erros de render, de ciclo de vida e de construtor. Promessas rejeitadas e erros
 * em handlers de evento não passam por aqui — esses chegam pelo tratamento de erro dos
 * thunks.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na árvore de componentes:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"
      >
        <h1 className="text-2xl font-bold">Algo quebrou nesta tela</h1>
        <pre className="max-w-2xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm">
          {this.state.error.message}
          {"\n\n"}
          {this.state.error.stack}
        </pre>
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="cursor-pointer rounded-full bg-black px-4 py-2 font-bold text-white"
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}
