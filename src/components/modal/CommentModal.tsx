import { useEffect, useState } from "react";
import { createComment, fetchComments } from "@/features/posts/postThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Field";
import { Modal } from "@/ui/Modal";
import { Spinner } from "@/ui/Spinner";

interface Props {
  postId: number;
  onClose: () => void;
}

/**
 * Comentários de um post.
 *
 * Os comentários vinham aninhados dentro do próprio post, no feed — completos e sem
 * limite, em todos os posts, para uma tela que só mostra o contador. Agora são buscados
 * sob demanda em GET /posts/<id>/comments/, que é paginado.
 */
export default function CommentModal({ postId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const post = useAppSelector(
    (s) =>
      s.posts.feed.items.find((p) => p.id === postId) ??
      s.posts.userPosts.items.find((p) => p.id === postId),
  );
  const comentarios = useAppSelector((s) => s.posts.comments[postId]);

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchComments({ postId }));
  }, [postId, dispatch]);

  if (!post) return null;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) {
      setErro("Escreva algo antes de comentar.");
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      await dispatch(createComment({ postId, text: conteudo })).unwrap();
      setTexto("");
    } catch (falha) {
      setErro(typeof falha === "string" ? falha : "Não foi possível comentar.");
    } finally {
      setEnviando(false);
    }
  };

  const carregarMais = () => {
    if (comentarios?.next) dispatch(fetchComments({ postId, cursor: comentarios.next }));
  };

  return (
    <Modal onClose={onClose} title={`Comentários do post de @${post.user.username}`}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-3">
          <img src={post.user.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h3 className="font-bold">@{post.user.username}</h3>
            <p className="text-gray-700">{post.text}</p>
          </div>
        </div>

        {comentarios?.loading && comentarios.items.length === 0 && (
          <div className="flex justify-center py-4">
            <Spinner size={24} color="border-t-blue-500" />
          </div>
        )}

        {comentarios && !comentarios.loading && comentarios.items.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            Ainda não há comentários. Seja o primeiro.
          </p>
        )}

        {comentarios && comentarios.items.length > 0 && (
          <ul className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto border-t border-gray-200 pt-3">
            {comentarios.items.map((comentario) => (
              <li key={comentario.id} className="flex items-start gap-3">
                <img
                  src={comentario.user.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="w-full rounded bg-gray-100 p-2">
                  <div className="text-sm font-semibold">@{comentario.user.username}</div>
                  <div className="whitespace-pre-wrap text-sm">{comentario.text}</div>
                </div>
              </li>
            ))}
            {comentarios.next && (
              <li>
                <Button variant="ghost" size="sm" onClick={carregarMais} className="w-full">
                  Ver mais comentários
                </Button>
              </li>
            )}
          </ul>
        )}

        <form onSubmit={enviar} className="mt-3 flex flex-col gap-3">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Escreva seu comentário..."
            aria-label="Escreva seu comentário"
            disabled={enviando}
          />
          <div className="flex flex-col items-end">
            <Button type="submit" isLoading={enviando} loadingText="Enviando...">
              Comentar
            </Button>
            {erro && (
              <span role="alert" className="mt-1 text-xs text-red-500">
                {erro}
              </span>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
