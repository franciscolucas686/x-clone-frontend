import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { makeUser } from "@/mocks/handlers";
import { server } from "@/mocks/server";
import { renderWithProviders } from "@/test/render";
import ExplorerPage from "@/pages/ExplorerPage";

const API = "http://localhost:8000/api/v1";

function paginaDe(users: ReturnType<typeof makeUser>[]) {
  return { count: users.length, next: null, previous: null, results: users };
}

/**
 * `fetchUsers` sempre reseta a lista inteira (`reset: true`). Sem cancelar a busca
 * anterior, uma resposta lenta para "ab" podia chegar **depois** da resposta rápida de
 * "abc" e sobrescrever o resultado certo com um já obsoleto.
 */
describe("ExplorerPage — corrida entre buscas", () => {
  it("a resposta lenta de uma busca anterior não sobrescreve a busca mais recente", async () => {
    server.use(
      http.get(`${API}/users/`, async ({ request }) => {
        const termo = new URL(request.url).searchParams.get("search");
        if (termo === "ab") {
          // Deliberadamente mais lenta que o ciclo inteiro da busca "abc" abaixo.
          await new Promise((r) => setTimeout(r, 500));
          return HttpResponse.json(paginaDe([makeUser({ id: 1, username: "resultado_de_ab" })]));
        }
        if (termo === "abc") {
          return HttpResponse.json(paginaDe([makeUser({ id: 2, username: "resultado_de_abc" })]));
        }
        return HttpResponse.json(paginaDe([]));
      }),
    );

    renderWithProviders(<ExplorerPage />);
    const campo = screen.getByLabelText("Buscar por nome ou usuário");

    await userEvent.type(campo, "ab");
    // Espera o debounce (300ms) disparar a busca de "ab" e ela ficar em voo.
    await act(() => new Promise((r) => setTimeout(r, 350)));

    await userEvent.type(campo, "c");

    await screen.findByText("@resultado_de_abc", {}, { timeout: 1500 });

    // A resposta lenta de "ab" foi dispatchada por volta dos 350ms e demora 500ms para
    // resolver — ou seja, chega por volta dos 850ms contados do início do teste, bem
    // depois de "abc" já ter respondido. Sem o abort, ela chegaria agora e sobrescreveria
    // a lista certa. Esperar esse intervalo inteiro é o que torna este teste capaz de
    // pegar a regressão — sem a espera, ele passaria mesmo sem o cancelamento, porque a
    // asserção rodaria cedo demais para ver a resposta atrasada sobrescrever algo.
    await act(() => new Promise((r) => setTimeout(r, 700)));
    expect(screen.queryByText("@resultado_de_ab")).not.toBeInTheDocument();
    expect(screen.getByText("@resultado_de_abc")).toBeInTheDocument();
  });
});
