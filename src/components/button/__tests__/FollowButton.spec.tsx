import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeUser, setMockUsers } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import FollowButton from "@/components/button/FollowButton";

describe("FollowButton", () => {
  it("mostra Seguir ou Seguindo conforme a prop", () => {
    const { unmount } = renderWithProviders(<FollowButton userId={1} isFollowing={false} />);
    expect(screen.getByRole("button", { name: "Seguir" })).toBeInTheDocument();
    unmount();

    renderWithProviders(<FollowButton userId={1} isFollowing={true} />);
    expect(screen.getByRole("button", { name: "Seguindo" })).toBeInTheDocument();
  });

  it("desabilita o botão durante a requisição e o libera ao fim", async () => {
    setMockUsers([makeUser({ id: 1, username: "ana", is_following: false })]);

    const { store } = renderWithProviders(<FollowButton userId={1} isFollowing={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Seguir" }));

    // `loadingFollowIds` é o único efeito observável no store quando o botão é
    // renderizado isolado: o rótulo vem da prop, e `users.list` está vazia, então o
    // reducer não tem entrada para corrigir. Esperar o id sair da lista é o que prova
    // que o ciclo pending -> fulfilled fechou.
    await expect.poll(() => store.getState().users.loadingFollowIds).toEqual([]);
  });
});
