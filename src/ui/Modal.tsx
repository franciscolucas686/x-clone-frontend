import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useClickOutside from "@/hooks/useClickOutside";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { cn } from "@/ui/cn";

interface ModalProps {
  onClose: () => void;
  /** Nome acessível do diálogo. Obrigatório: um diálogo sem nome é anunciado como "diálogo". */
  title: string;
  children: React.ReactNode;
  className?: string;
  /** `"bottom"` ancora o diálogo na base da tela, como uma folha que sobe — usado pelo
   * AccountSheet no mobile. `"center"` (padrão) é o diálogo comum. */
  position?: "center" | "bottom";
}

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo em portal.
 *
 * O portal e o clique-fora já estavam certos no ModalLayout original. O que faltava era
 * a semântica: sem `role="dialog"` e `aria-modal`, um leitor de tela não anuncia que
 * abriu um diálogo nem confina a navegação a ele; e sem o Escape, a única saída era
 * achar o botão de fechar.
 *
 * Faltava ainda o comportamento de foco que os dois anteriores não cobrem: sem foco
 * inicial, o teclado continuava no botão que abriu o diálogo, atrás do overlay; sem
 * devolução de foco, fechar o diálogo deixava o foco em lugar nenhum; e sem um laço de
 * Tab, ele escapava para a página por trás — `aria-modal="true"` é só o anúncio, não a
 * garantia.
 */
export function Modal({ onClose, title, children, className, position = "center" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const focoAnterior = useRef<Element | null>(null);

  useClickOutside(ref, onClose, true);

  useEffect(() => {
    focoAnterior.current = document.activeElement;
    // O próprio diálogo recebe o foco inicial, não o primeiro campo dele: um formulário
    // não deve ganhar texto digitado antes de a pessoa escolher onde clicar.
    ref.current?.focus();

    return () => {
      if (focoAnterior.current instanceof HTMLElement) focoAnterior.current.focus();
    };
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;

      const focaveis = Array.from(ref.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL));
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    // Trava a rolagem do fundo: sem isso a página atrás rola junto com o diálogo.
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-black/80",
        position === "bottom" ? "items-end justify-center" : "items-center justify-center",
      )}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative z-50 max-h-[90%] w-[90%] max-w-[600px] overflow-auto bg-white p-6 focus:outline-none",
          position === "bottom" ? "rounded-t-2xl pb-[env(safe-area-inset-bottom)]" : "rounded-2xl",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute left-2 top-2"
        >
          <CloseIcon />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}
