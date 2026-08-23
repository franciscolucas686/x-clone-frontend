import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { restoreUser } from "@/features/auth/authThunks";
import { makeUser } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import AccountSheet from "@/components/sidebar/AccountSheet";

/**
 * No mobile, a Sidebar inteira — e com ela o único "Sair" que existia — some abaixo de
 * `md` (ver AppLayout.tsx). Este é o painel que a MobileTopBar abre para repor a saída
 * de conta que tinha ficado inalcançável no celular.
 */
describe("AccountSheet", () => {
  it("mostra o usuário e permite sair da conta", async () => {
    const { store } = renderWithProviders(<AccountSheet onClose={() => {}} />);
    act(() => {
      store.dispatch(
        restoreUser.fulfilled(makeUser({ name: "Ana Lima", username: "ana" }), "req", undefined),
      );
    });

    expect(await screen.findByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("@ana")).toBeInTheDocument();

    const sair = screen.getByRole("button", { name: "Sair de Ana Lima" });
    await userEvent.click(sair);

    // logoutUser não faz chamada de rede; o efeito observável é a sessão voltando a
    // "anonymous" (ver authSlice.ts — o mesmo status que corrige o travamento pós-logout).
    expect(store.getState().auth.status).toBe("anonymous");
  });
});
