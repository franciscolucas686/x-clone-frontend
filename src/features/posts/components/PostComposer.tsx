import { useState } from "react";
import { createPost } from "@/features/posts/postThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
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
    const conteudo = texto.trim();
    if (!conteudo) {
      setErro("Escreva algo antes de publicar.");
      return;
    }

    setErro(null);
    try {
      await dispatch(createPost({ text: conteudo })).unwrap();
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
          <img
            src={usuario.avatar_url}
            alt=""
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
        )}
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que está acontecendo?"
          rows={3}
          maxLength={500}
          disabled={criando}
          aria-label="O que está acontecendo?"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{texto.length}/500</span>
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
