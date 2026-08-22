import { PostComposer } from "@/features/posts/components/PostComposer";
import { Modal } from "@/ui/Modal";

interface Props {
  onClose: () => void;
}

/**
 * Publicação a partir do botão da barra lateral.
 *
 * Reimplementava a caixa de publicação do Feed, com validação e tratamento de erro
 * próprios. Hoje os dois usam o mesmo `PostComposer`.
 */
export default function ButtonPostModal({ onClose }: Props) {
  return (
    <Modal onClose={onClose} title="Criar publicação" className="max-w-[600px]">
      <PostComposer onPublished={onClose} />
    </Modal>
  );
}
