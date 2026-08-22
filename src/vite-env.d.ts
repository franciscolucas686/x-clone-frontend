/// <reference types="vite/client" />

/**
 * Tipagem das variáveis do app.
 *
 * Sem esta declaração, `import.meta.env.VITE_QUALQUER_COISA` é aceito pelo índice
 * genérico do Vite: um nome digitado errado compila e chega como `undefined` na
 * execução.
 */
interface ImportMetaEnv {
  /** Base de todas as chamadas à API, incluindo o prefixo de versão. */
  readonly VITE_API_URL: string;
  /** Opcional: sobrescreve o avatar padrão. Ver shared/config.ts. */
  readonly VITE_DEFAULT_AVATAR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
