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

/**
 * Forma que os thunks de autenticação rejeitam com — mensagem pronta para o banner e
 * `details` cru para o formulário destacar o campo certo.
 *
 * Antes `rejectWithValue(getErrorMessage(error))` reduzia o erro a uma `string`: o
 * `code` e o `details` que o backend manda de propósito — `USERNAME_ALREADY_EXISTS` e os
 * validadores de senha preenchem `details` explicitamente — eram descartados na fronteira
 * do thunk. `VALIDATION_ERROR` virava sempre a mensagem genérica "Confira os campos
 * destacados", com nenhum campo de fato destacado.
 */
export interface AuthRejection {
  message: string;
  details: Record<string, string[]>;
}

export function toRejectValue(err: unknown): AuthRejection {
  return { message: getErrorMessage(err), details: getFieldErrors(err) };
}
