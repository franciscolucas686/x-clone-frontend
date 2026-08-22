import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeUser, setMockUsers } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import LoginModal from "@/components/modal/LoginModal";

// Os campos são consultados por **rótulo**, não por placeholder. Placeholder some
// quando a pessoa digita e não é anunciado como nome do campo por leitor de tela; era o
// que os formulários usavam no lugar de <label>.
describe("LoginModal", () => {
  it("mostra a mensagem de senha errada em português", async () => {
    // Este é o bug que o contrato de erro resolve, visto pelo usuário.
    //
    // Antes o backend respondia 401 com a frase em inglês do simplejwt, e o
    // interceptor tratava todo 401 como sessão vencida: limpava o storage e fazia
    // `window.location.href = "/"`. A mensagem era gravada no store e descartada pelo
    // reload antes de chegar à tela — errar a senha só fazia a página piscar.
    setMockUsers([makeUser({ id: 1, username: "ana" })]);

    renderWithProviders(<LoginModal onClose={() => {}} />);

    await userEvent.type(screen.getByLabelText("Nome de usuário"), "ana");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-errada");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Usuário ou senha incorretos.")).toBeInTheDocument();
  });

  it("valida no cliente antes de chamar a API", async () => {
    // Não havia validação nenhuma: os formulários eram useState com `required` do HTML,
    // e o mínimo de senha só era descoberto batendo no servidor.
    renderWithProviders(<LoginModal onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Informe o nome de usuário.")).toBeInTheDocument();
  });

  it("fecha o modal quando o login dá certo", async () => {
    setMockUsers([makeUser({ id: 1, username: "ana" })]);
    const onClose = vi.fn();

    renderWithProviders(<LoginModal onClose={onClose} />);

    await userEvent.type(screen.getByLabelText("Nome de usuário"), "ana");
    await userEvent.type(screen.getByLabelText("Senha"), "SenhaCerta123!");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
