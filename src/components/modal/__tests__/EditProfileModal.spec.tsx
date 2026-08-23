import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { restoreUser } from "@/features/auth/authThunks";
import { makeUser } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import EditProfileModal from "@/components/modal/EditProfileModal";

/**
 * O botão "remover foto" decidia se aparecia comparando a URL da prévia com uma cópia
 * local do avatar padrão (`DEFAULT_AVATAR_URL`, escrita à mão nos dois repositórios).
 * Agora ele lê `has_custom_avatar`, o fato que o servidor manda — sem o cliente
 * precisar conhecer a URL do padrão para nada.
 */
describe("EditProfileModal — botão de remover foto", () => {
  it("não aparece para quem nunca escolheu foto", () => {
    const { store } = renderWithProviders(<EditProfileModal onClose={() => {}} />);
    act(() => {
      store.dispatch(
        restoreUser.fulfilled(makeUser({ has_custom_avatar: false }), "req", undefined),
      );
    });

    expect(screen.queryByRole("button", { name: "Remover foto" })).not.toBeInTheDocument();
  });

  it("aparece para quem tem foto própria, e some ao clicar", async () => {
    const { store } = renderWithProviders(<EditProfileModal onClose={() => {}} />);
    act(() => {
      store.dispatch(
        restoreUser.fulfilled(makeUser({ has_custom_avatar: true }), "req", undefined),
      );
    });

    const botao = await screen.findByRole("button", { name: "Remover foto" });
    await userEvent.click(botao);

    expect(screen.queryByRole("button", { name: "Remover foto" })).not.toBeInTheDocument();
    expect(screen.getByText("Ao salvar, você volta ao avatar padrão.")).toBeInTheDocument();
  });
});
