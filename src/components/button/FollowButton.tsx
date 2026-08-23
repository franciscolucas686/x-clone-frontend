import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { toggleFollow } from "@/features/users/userThunks";
import { Spinner } from "@/ui/Spinner";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const dispatch = useAppDispatch();
  const loadingFollowIds = useAppSelector((state) => state.users.loadingFollowIds);

  const isLoading = loadingFollowIds.includes(userId);

  const handleClick = () => {
    if (!isLoading) {
      dispatch(toggleFollow(userId));
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        isLoading ? "cursor-wait" : "cursor-pointer"
      } ${
        isFollowing
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {/* Antes o estado de carregamento era a string literal "...", o único lugar do app
       * que não usava o Spinner para isso — e `disabled` não tinha estilo próprio, então
       * um botão desabilitado continuava com `cursor-pointer` e parecia clicável. */}
      {isLoading ? (
        <Spinner size={14} color={isFollowing ? "border-t-gray-700" : "border-t-white"} />
      ) : isFollowing ? (
        "Seguindo"
      ) : (
        "Seguir"
      )}
    </button>
  );
}
