import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * A API pública é `variant`/`size` — nunca um `className` carregando cor.
 *
 * A classe `.btn` do index.css era o que havia, e três chamadas a sobrescreviam inline
 * com utilitários conflitantes: `className="btn ... rounded"` brigando com o
 * `rounded-full` que a própria `.btn` aplica. O resultado dependia da ordem em que o
 * Tailwind emitiu as regras.
 */
const VARIANTES: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-neutral-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const TAMANHOS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-2.5 text-lg",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Substitui o conteúdo por um texto de progresso e desabilita o botão. */
  loadingText?: string;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  className,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      // `aria-busy` para que leitores de tela anunciem o progresso; a troca de texto
      // sozinha não comunica que a ação está em andamento.
      aria-busy={isLoading || undefined}
      className={cn(
        "rounded-full font-bold transition duration-200 ease-in-out cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTES[variant],
        TAMANHOS[size],
        className,
      )}
    >
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
