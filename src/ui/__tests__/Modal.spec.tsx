import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Modal } from "@/ui/Modal";

/**
 * `aria-modal="true"` é só o anúncio — não confinava o Tab, não movia o foco para
 * dentro do diálogo ao abrir, e não devolvia o foco a quem abriu ao fechar. Este teste
 * fixa as três coisas que faltavam.
 */
describe("Modal — foco", () => {
  function Cenario({ onClose }: { onClose: () => void }) {
    return (
      <div>
        <button>Abrir</button>
        <Modal onClose={onClose} title="Teste">
          <button>Primeiro</button>
          <button>Último</button>
        </Modal>
      </div>
    );
  }

  it("recebe o foco ao abrir e devolve a quem abriu ao fechar", async () => {
    const gatilho = document.createElement("button");
    gatilho.textContent = "Abrir de fora";
    document.body.appendChild(gatilho);
    gatilho.focus();
    expect(document.activeElement).toBe(gatilho);

    const { unmount } = render(
      <Modal onClose={() => {}} title="Teste">
        Conteúdo
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toHaveFocus();

    unmount();

    expect(document.activeElement).toBe(gatilho);
    gatilho.remove();
  });

  it("Tab no último elemento focável volta para o primeiro", async () => {
    const user = userEvent.setup();
    render(<Cenario onClose={() => {}} />);

    const primeiro = screen.getByRole("button", { name: "Primeiro" });
    const ultimo = screen.getByRole("button", { name: "Último" });
    const fechar = screen.getByRole("button", { name: "Fechar" });

    fechar.focus();
    await user.tab(); // fechar -> primeiro
    expect(primeiro).toHaveFocus();
    await user.tab(); // primeiro -> ultimo
    expect(ultimo).toHaveFocus();
    await user.tab(); // ultimo -> volta ao inicio do laco
    expect(fechar).toHaveFocus();
  });
});
