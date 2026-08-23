import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { restoreUser } from "@/features/auth/authThunks";
import { makeUser } from "@/mocks/handlers";
import { renderWithProviders } from "@/test/render";
import EditProfileModal from "@/components/modal/EditProfileModal";

/**
 * O único controle sobre o arquivo era o atributo `accept`, que é uma dica do sistema de
 * arquivos e não uma validação: arrastar e soltar, ou escolher "todos os arquivos",
 * ignora-o. Sem checagem própria, um arquivo grande demais só era rejeitado depois do
 * upload inteiro, pelo servidor.
 */
describe("EditProfileModal — validação do arquivo de avatar", () => {
  function abrirComUsuario() {
    const { store } = renderWithProviders(<EditProfileModal onClose={() => {}} />);
    act(() => {
      store.dispatch(
        restoreUser.fulfilled(makeUser({ has_custom_avatar: false }), "req", undefined),
      );
    });
    return store;
  }

  it("recusa um tipo de arquivo não suportado antes de enviar", async () => {
    abrirComUsuario();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // `applyAccept: false`: o atributo `accept` é dica do seletor de arquivos do
    // sistema, não validação — arrastar e soltar, ou "todos os arquivos", o ignora. É
    // exatamente esse caminho que a validação própria existe para cobrir.
    const user = userEvent.setup({ applyAccept: false });
    const arquivo = new File(["conteudo"], "documento.pdf", { type: "application/pdf" });
    await user.upload(input, arquivo);

    expect(
      await screen.findByText("Formato não suportado. Envie uma imagem JPG, PNG ou WEBP."),
    ).toBeInTheDocument();
  });

  it("recusa um arquivo maior que 5MB antes de enviar", async () => {
    abrirComUsuario();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const grande = new File(["x".repeat(6 * 1024 * 1024)], "foto.png", { type: "image/png" });
    await userEvent.upload(input, grande);

    expect(await screen.findByText("A imagem é grande demais.")).toBeInTheDocument();
  });
});
