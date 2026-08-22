import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/ui/cn";

/**
 * Rótulo, controle e mensagem de erro amarrados entre si.
 *
 * Os formulários usavam `placeholder` como rótulo — que some assim que a pessoa digita, e
 * que leitor de tela nenhum anuncia como nome do campo. E a string de erro
 * `text-red-500 text-sm text-center` estava repetida em três modais.
 *
 * O `aria-describedby` é o que faz o erro ser lido junto do campo, em vez de ficar como
 * um texto solto ao lado dele.
 */
interface FieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean;
  }) => ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const idDoErro = error ? `${id}-erro` : undefined;
  const idDaDica = hint ? `${id}-dica` : undefined;
  const describedBy = [idDoErro, idDaDica].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {hint && !error && (
        <span id={idDaDica} className="text-xs text-gray-500">
          {hint}
        </span>
      )}
      {error && (
        <span id={idDoErro} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

const CONTROLE =
  "w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none " +
  "aria-[invalid=true]:border-red-500";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  // `text-base` não é negociável: abaixo de 16px o iOS dá zoom automático ao focar o
  // campo, e a página fica deslocada.
  return <input {...props} className={cn(CONTROLE, "text-base", className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROLE, "text-base resize-none", className)} />;
}
