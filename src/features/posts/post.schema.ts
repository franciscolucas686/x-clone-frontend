/**
 * Regra de tamanho de post e comentário — um lugar só.
 *
 * `posts/models.py:9` (`Post.text`) e `:52` (`Comment.text`) usam o mesmo
 * `max_length=500`. O limite estava como o número `500` escrito à mão em três lugares
 * de `PostComposer.tsx`/`CommentModal.tsx` (o `maxLength` do textarea e o contador), e
 * a checagem de "não pode estar vazio" era um `if` idêntico copiado entre os dois
 * componentes, cada um com sua própria mensagem.
 *
 * Não vira um schema zod: são dois campos de um componente com `useState`, e migrar
 * para react-hook-form por causa de uma regra não compra nada — a duplicação real era
 * o número e o `if`, não a ausência de um framework de formulário.
 */
export const POST_MAX_LENGTH = 500;

/** `null` quando válido; senão a mensagem para mostrar. `mensagemVazio` é do chamador
 * porque "publicar" e "comentar" descrevem ações diferentes. */
export function validatePostText(texto: string, mensagemVazio: string): string | null {
  const conteudo = texto.trim();
  if (!conteudo) return mensagemVazio;
  if (conteudo.length > POST_MAX_LENGTH) {
    return `Máximo de ${POST_MAX_LENGTH} caracteres.`;
  }
  return null;
}
