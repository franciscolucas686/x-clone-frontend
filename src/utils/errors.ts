type DjangoError = string | string[] | Record<string, string[]>;

export function extractMessages(err: DjangoError): string[] {
  if (typeof err === "string") return [err];
  if (Array.isArray(err)) return err;
  return Object.values(err).flat();
}

export function translateError(msg: string): string {
  const map: Record<string, string> = {
    "No active account found": "Usuário ou senha incorretos!",
    "not found": "Usuário ou senha incorretos!",
    "too short": "A senha é muito curta. Deve ter no mínimo 8 caracteres.",
    "too common": "A senha é muito comum. Escolha outra.",
    "entirely numeric": "A senha não pode ser apenas números.",
    "already exists": "Esse nome de usuário já existe.",
    "This field must be unique.": "Esse nome de usuário já existe.",
  };

  for (const key in map) {
    if (msg.includes(key)) return map[key];
  }

  return msg;
}

export function handleThunkError(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { data?: unknown } }).response?.data
  ) {
    const raw = (error as { response: { data: unknown } }).response.data;

    const messages = extractMessages(
      typeof raw === "string"
        ? raw
        : (raw as unknown as string | string[] | Record<string, string[]>)
    );

    return translateError(messages[0] ?? fallback);
  }

  if (error instanceof Error) {
    return translateError(error.message);
  }

  return fallback;
}
