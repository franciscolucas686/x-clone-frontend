/**
 * Erro geral de um formulário — quando a falha não tem campo para acender.
 *
 * A mesma string `<p role="alert" className="text-center text-sm text-red-500">{error}</p>`
 * estava escrita byte a byte em três modais (Login, Register, EditProfile).
 * `Field.tsx` já registra que essa duplicação existiu e foi resolvida para o erro *de
 * campo*; isto termina o mesmo serviço para o erro *de formulário*.
 */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-center text-sm text-red-500">
      {children}
    </p>
  );
}
