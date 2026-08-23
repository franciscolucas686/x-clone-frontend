import { useEffect, useState } from "react";
import { cn } from "@/ui/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Cada valor é o par `h-*`/`w-*` que já existia, espalhado, num site diferente:
 * `xs` era CommentModal (comentário) e a nova MobileTopBar; `sm`, UserCard; `md`,
 * UserRow; `lg`, Post/PostComposer/CommentModal (autor do post)/AccountSheet; `xl`,
 * ProfileHeader. Nomeados, em vez de cada chamador escrever o próprio par de novo. */
const TAMANHOS: Record<AvatarSize, number> = { xs: 32, sm: 40, md: 44, lg: 48, xl: 96 };

interface AvatarProps {
  src: string;
  /** Nome de quem é o avatar. Vira `alt` quando `decorative` é falso; sempre usado para
   * a inicial de fallback. */
  name?: string;
  /** Um dos tamanhos nomeados, ou um número de pixels para o único caso que não se
   * encaixa em nenhum (a prévia editável do EditProfileModal, 80px). */
  size?: AvatarSize | number;
  className?: string;
  /** `true` quando o nome já aparece como texto ao lado (a maioria dos casos): o avatar
   * não carrega informação própria, e um `alt` duplicando o texto vizinho é ruído para
   * quem usa leitor de tela. `false` (default) gera um `alt` descritivo. */
  decorative?: boolean;
}

/**
 * Avatar com fallback — o `onError` que não existia em nenhum dos oito `<img>` que este
 * componente substitui. Um avatar com URL quebrada (offline, Cloudinary fora do ar, um
 * usuário criado antes do avatar padrão existir) virava o ícone de imagem quebrada do
 * navegador; agora cai nas iniciais, sobre um círculo neutro do tamanho certo.
 *
 * `width`/`height` explícitos no `<img>` — nenhum site anterior os tinha — são o que
 * evita o salto de layout enquanto a imagem carrega.
 */
export function Avatar({ src, name, size = "md", className, decorative = false }: AvatarProps) {
  const [falhou, setFalhou] = useState(false);
  const px = typeof size === "number" ? size : TAMANHOS[size];

  // Se a URL mudar (troca de foto, por exemplo), tenta carregar a nova antes de desistir
  // de novo — sem isto, uma falha anterior prendia o avatar nas iniciais para sempre.
  useEffect(() => setFalhou(false), [src]);

  const inicial = name?.trim().charAt(0).toUpperCase();

  if (!src || falhou) {
    return (
      <div
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative || undefined}
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-600",
          className,
        )}
        style={{ width: px, height: px, fontSize: px * 0.4 }}
      >
        {inicial || "?"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? "" : (name ?? "")}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFalhou(true)}
      className={cn("flex-shrink-0 rounded-full object-cover", className)}
      style={{ width: px, height: px }}
    />
  );
}
