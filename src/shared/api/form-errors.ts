import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

/** `confirm_password` -> `confirmPassword`. Os nomes de campo do backend são snake_case
 * (Django/DRF); os do formulário, camelCase (convenção do próprio react-hook-form). */
function paraCamelCase(campo: string): string {
  return campo.replace(/_([a-z])/g, (_, letra: string) => letra.toUpperCase());
}

/**
 * Aplica `details` do servidor como erros de campo do react-hook-form.
 *
 * `getFieldErrors` (api-error.ts) já existia, tinha teste, e não era chamada por
 * ninguém: o `details` chegava ao componente e não ia a lugar nenhum, porque nenhum
 * formulário usava `setError` do RHF para os erros vindos do servidor — só para os da
 * validação local do zod. Um campo marcado `USERNAME_ALREADY_EXISTS`, por exemplo,
 * nunca acendia o campo `username`, só o banner genérico do rodapé.
 *
 * Devolve `true` se aplicou algum erro, para o chamador decidir se ainda precisa do
 * banner (um erro sem campo — 500, por exemplo — não tem onde acender).
 */
export function applyServerFieldErrors<TFieldValues extends FieldValues>(
  details: Record<string, string[]> | undefined,
  setError: UseFormSetError<TFieldValues>,
): boolean {
  if (!details) return false;

  let aplicouAlgum = false;
  for (const [campo, mensagens] of Object.entries(details)) {
    const mensagem = mensagens[0];
    if (!mensagem) continue;
    // O campo pode não existir neste formulário específico (ex.: um `details` genérico
    // de outra rota) — nesse caso o RHF cria uma entrada de erro que nenhum <Field> lê,
    // o que é inofensivo, e o banner continua cobrindo o que sobrar.
    setError(paraCamelCase(campo) as FieldPath<TFieldValues>, {
      type: "server",
      message: mensagem,
    });
    aplicouAlgum = true;
  }
  return aplicouAlgum;
}
