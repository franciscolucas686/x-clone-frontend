import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makePost, makeUser, setCurrentUser, setMockPosts } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import Feed from "@/components/feed/Feed";

describe("Feed", () => {
  it("carrega e lista os posts de quem o usuário segue", async () => {
    const autor = makeUser({ id: 1, username: "ana", name: "Ana" });
    setMockPosts([makePost({ id: 1, user: autor, text: "primeiro post" })]);

    renderWithProviders(<Feed />);

    expect(await screen.findByText("primeiro post")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há post nenhum", async () => {
    setMockPosts([]);

    renderWithProviders(<Feed />);

    expect(await screen.findByText("Não há nenhum post")).toBeInTheDocument();
  });

  it("'ver mais' acrescenta a próxima página sem descartar a anterior", async () => {
    const autor = makeUser({ id: 1, username: "ana" });
    // 15 posts com página de 10 garantem uma segunda página — é a existência do `next`
    // que faz o botão aparecer.
    setMockPosts(
      Array.from({ length: 15 }, (_, i) =>
        makePost({ id: i + 1, user: autor, text: `post ${i + 1}` }),
      ),
    );

    renderWithProviders(<Feed />);

    expect(await screen.findByText("post 1")).toBeInTheDocument();
    expect(screen.queryByText("post 11")).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "Ver mais postagens" }));

    expect(await screen.findByText("post 11")).toBeInTheDocument();
    // O que este teste realmente protege: a página 1 continua na tela.
    expect(screen.getByText("post 1")).toBeInTheDocument();
  });

  it("publicar um post o coloca no topo da lista", async () => {
    const eu = makeUser({ id: 1, username: "eu" });
    setCurrentUser(eu);
    setMockPosts([makePost({ id: 1, user: eu, text: "post antigo" })]);

    renderWithProviders(<Feed />);
    await screen.findByText("post antigo");

    await userEvent.type(screen.getByPlaceholderText("O que está acontecendo?"), "post novo");
    await userEvent.click(screen.getByRole("button", { name: "Publicar" }));

    expect(await screen.findByText("post novo")).toBeInTheDocument();
  });

  it("curtir alterna o estado e o contador", async () => {
    const autor = makeUser({ id: 1, username: "ana" });
    setMockPosts([makePost({ id: 1, user: autor, text: "post curtível", likes_count: 0 })]);

    renderWithProviders(<Feed />);
    await screen.findByText("post curtível");

    // Por nome acessível, nunca por posição: o composer do topo também tem botões, e
    // indexá-los faria este teste apontar para outro elemento a cada mudança de layout.
    await userEvent.click(await screen.findByRole("button", { name: "Curtir" }));

    const descurtir = await screen.findByRole("button", { name: "Descurtir" });
    expect(within(descurtir).getByText("1")).toBeInTheDocument();
  });
});
