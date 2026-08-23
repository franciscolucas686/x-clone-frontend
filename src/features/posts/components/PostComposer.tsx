import { useState } from "react";
import { POST_MAX_LENGTH, validatePostText } from "@/features/posts/post.schema";
import { createPost } from "@/features/posts/postThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Field";

/**
 * Caixa de publicação.
 *
 * Existia duas vezes: inline no Feed e dentro do ButtonPostModal, com regras de validação
 * e tratamento de erro diferentes — o Feed engolia a falha em `console.error` e não
 * mostrava nada, o modal exibia a mensagem.
 */
export function PostComposer({ onPublished }: { onPublished?: () => void }) {
  const dispatch = useAppDispatch();
  const usuario = useAppSelector((s) => s.auth.user);
  const criando = useAppSelector((s) => s.posts.creating);

  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    const mensagem = validatePostText(texto, "Escreva algo antes de publicar.");
    if (mensagem) {
      setErro(mensagem);
      return;
    }

    setErro(null);
    try {
      await dispatch(createPost({ text: texto.trim() })).unwrap();
      setTexto("");
      onPublished?.();
    } catch (falha) {
      // A mensagem já vem traduzida pelo `getErrorMessage` dentro do thunk.
      setErro(typeof falha === "string" ? falha : "Não foi possível publicar.");
    }
  };

  return (
    <form onSubmit={publicar} className="border-b border-gray-200 p-4">
      <div className="flex items-start gap-3 pb-4">
        {usuario && (
          <Avatar
            src={usuario.avatar_url}
            name={usuario.name || usuario.username}
            size="lg"
            decorative
          />
        )}
        <Textarea
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            // Sem isto, "Escreva algo antes de publicar." ficava na tela enquanto a
            // pessoa já estava digitando a correção, só sumindo no próximo submit.
            if (erro) setErro(null);
          }}
          placeholder="O que está acontecendo?"
          rows={3}
          disabled={criando}
          aria-label="O que está acontecendo?"
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Sem `maxLength` no textarea: ele truncava um texto colado em silêncio, sem
         * avisar que algo foi cortado. O limite agora é anunciado aqui e recusado no
         * submit por `validatePostText`, nunca imposto por trás das costas. */}
        <span
          className={`text-xs ${texto.trim().length > POST_MAX_LENGTH ? "font-semibold text-red-500" : "text-gray-500"}`}
        >
          {texto.trim().length}/{POST_MAX_LENGTH}
        </span>
        <Button type="submit" isLoading={criando} loadingText="Publicando...">
          Publicar
        </Button>
      </div>

      {erro && (
        <p role="alert" className="pt-2 text-right text-sm text-red-500">
          {erro}
        </p>
      )}
    </form>
  );
}
