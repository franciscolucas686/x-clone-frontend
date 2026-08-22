/**
 * Constantes vindas do ambiente, num lugar só.
 *
 * `import.meta.env` era lido em um único ponto e sem tipagem: `vite-env.d.ts` não
 * declarava `ImportMetaEnv`, então um erro de digitação no nome da variável compilava
 * e virava `undefined` em runtime.
 */

/**
 * Avatar de quem não enviou foto.
 *
 * Espelha `DEFAULT_AVATAR_URL` do backend. A mesma URL estava escrita à mão nos dois
 * repositórios — em `accounts/serializers.py` e em `EditProfileModal.tsx` — de modo que
 * trocar o avatar padrão exigia lembrar dos dois lugares.
 */
export const DEFAULT_AVATAR_URL =
  import.meta.env.VITE_DEFAULT_AVATAR_URL ||
  "https://res.cloudinary.com/dh5rxxtqe/image/upload/v1763632324/xclone/avatars/default.png";
