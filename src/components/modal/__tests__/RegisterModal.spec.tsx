import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeUser, setMockUsers } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import RegisterModal from "@/components/modal/RegisterModal";

/**
 * `getFieldErrors` existia, tinha teste próprio, e não era chamada por ninguém: o
 * `details` do backend chegava ao thunk e morria ali, achatado numa `string` só. Um
 * `USERNAME_ALREADY_EXISTS` — que o backend preenche com `details: {username: [...]}`
 * de propósito — nunca acendia o campo, só o banner genérico no rodapé.
 */
describe("RegisterModal", () => {
  it("USERNAME_ALREADY_EXISTS acende o campo de usuário, não só o banner", async () => {
    setMockUsers([makeUser({ username: "ana" })]);

    renderWithProviders(<RegisterModal onClose={() => {}} />);

    await userEvent.type(screen.getByLabelText("Nome de usuário"), "ana");
    await userEvent.type(screen.getByLabelText("Senha"), "SenhaForte123!");
    await userEvent.type(screen.getByLabelText("Confirmar senha"), "SenhaForte123!");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    const erroDoCampo = await screen.findByText("Esse nome de usuário já está em uso.");
    const campoUsername = screen.getByLabelText("Nome de usuário");

    expect(campoUsername).toHaveAttribute("aria-invalid", "true");
    expect(campoUsername).toHaveAttribute("aria-describedby", erroDoCampo.id);
  });
});
