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
  // VITE_DEFAULT_AVATAR_URL existiu aqui: espelhava DEFAULT_AVATAR_URL do backend, a
  // mesma URL escrita à mão nos dois repositórios. O avatar padrão agora chega já
  // resolvido em `avatar_url` (AvatarUrlField, accounts/serializers.py) — o cliente não
  // precisa mais conhecer essa URL para exibi-la nem para decidir se deve mostrar o botão
  // de remover (ver `has_custom_avatar`, consumido em EditProfileModal.tsx).
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
