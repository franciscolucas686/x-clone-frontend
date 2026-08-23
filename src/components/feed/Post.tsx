import { Heart, MessageCircle } from "lucide-react";
import { toggleLike } from "@/features/posts/postThunks";
import { Avatar } from "@/ui/Avatar";
import type { Post as PostType } from "@/features/posts/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { formatRelativeDate } from "@/utils/date";
import { Link } from "react-router-dom";

type Props = {
  post: PostType;
  onCommentClick?: () => void;
};

export default function Post({ post, onCommentClick }: Props) {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLike({ postId: post.id }));
  };

  const profileLink =
    user?.username === post.user.username ? "/profile" : `/user/${post.user.username}`;

  return (
    // `<article>`, não `<div>`: cada post é um item de conteúdo autocontido — e sem um
    // `<h1>`/`<h2>` de página no Feed, um `<h3>` por post (como havia antes) formava um
    // contorno de headings sem hierarquia nenhuma, só uma lista plana de "@fulano".
    <article className="p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-start space-x-3">
        <Avatar src={post.user.avatar_url} name={post.user.name || post.user.username} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <Link to={profileLink}>
              <span className="font-bold cursor-pointer hover:underline">
                @{post.user.username}
              </span>
            </Link>
            <time
              dateTime={post.created_at}
              title={new Date(post.created_at).toLocaleString()}
              className="text-xs text-gray-500"
            >
              {formatRelativeDate(post.created_at)}
            </time>
          </div>

          {/* `break-words`: sem ele, uma URL colada sem espaços não quebra e empurra a
           * coluna inteira para o lado — o `overflow-x-hidden` do AppLayout escondia o
           * estouro em vez de evitá-lo. */}
          <p className="mt-1 whitespace-normal break-words">{post.text}</p>

          <div className="flex text-gray-500 text-sm gap-6 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick?.();
              }}
              aria-label={`Comentar (${post.comments_count})`}
              className="flex items-center gap-2 hover:text-blue-500 cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>{post.comments_count}</span>
            </button>

            <button
              onClick={handleLike}
              aria-label={post.is_liked ? "Descurtir" : "Curtir"}
              aria-pressed={post.is_liked}
              className={`flex items-center gap-2 ${
                post.is_liked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <div className="p-2 rounded-full hover:bg-red-100 cursor-pointer">
                <Heart
                  size={18}
                  className={`${post.is_liked ? "text-red-500" : ""}`}
                  fill={post.is_liked ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              </div>
              <span>{post.likes_count}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
