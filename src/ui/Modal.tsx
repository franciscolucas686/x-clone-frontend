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
}

/**
 * Diálogo em portal.
 *
 * O portal e o clique-fora já estavam certos no ModalLayout original. O que faltava era
 * a semântica: sem `role="dialog"` e `aria-modal`, um leitor de tela não anuncia que
 * abriu um diálogo nem confina a navegação a ele; e sem o Escape, a única saída era
 * achar o botão de fechar.
 */
export function Modal({ onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, onClose, true);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-50 max-h-[90%] w-[90%] max-w-[600px] overflow-auto rounded-2xl bg-white p-6",
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
