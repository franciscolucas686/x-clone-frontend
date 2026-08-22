import { ERROR_CODE_MESSAGES } from "@/shared/api/error-code-map";
import type { ApiErrorResponse } from "@/shared/api/types";

const MENSAGEM_PADRAO = "Algo deu errado. Tente novamente.";

export function isApiError(err: unknown): err is ApiErrorResponse {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as ApiErrorResponse).code === "string"
  );
}

/**
 * Texto a mostrar para o usuário, a partir de qualquer erro.
 *
 * Ordem de resolução: `code` conhecido -> mensagem do servidor -> texto genérico. O
 * passthrough do meio é o que mantém a tela útil se o backend ganhar um código novo
 * antes de o frontend subir com a tradução.
 */
export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    return ERROR_CODE_MESSAGES[err.code] ?? err.message ?? MENSAGEM_PADRAO;
  }
  if (err instanceof Error) return err.message || MENSAGEM_PADRAO;
  return MENSAGEM_PADRAO;
}

/**
 * Erros por campo, para o formulário destacar o campo certo.
 *
 * O handler anterior descartava tudo menos `messages[0]`, então um erro em três campos
 * aparecia como um só.
 */
export function getFieldErrors(err: unknown): Record<string, string[]> {
  return isApiError(err) && err.details ? err.details : {};
}
