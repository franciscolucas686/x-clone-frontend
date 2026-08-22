import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createStore } from "@/app/store";

interface Options {
  /** URL inicial, com query string se o componente a ler. */
  route?: string;
  /**
   * Padrão de rota. Passe sempre que o componente sob teste chamar `useParams()`:
   * sem um `<Route>` casando, o react-router nunca preenche os params e o componente
   * recebe `undefined` — falha que se manifesta longe da causa.
   */
  path?: string;
}

/**
 * Renderiza espelhando a árvore de providers do app (`App.tsx` + `AppRoutes.tsx`), com
 * duas diferenças deliberadas: um store novo a cada chamada, para que testes não
 * compartilhem estado, e `MemoryRouter` no lugar do `BrowserRouter`, porque o jsdom não
 * tem histórico de navegação de verdade.
 */
export function renderWithProviders(ui: ReactElement, { route = "/", path = route }: Options = {}) {
  const store = createStore();

  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { ...utils, store };
}
