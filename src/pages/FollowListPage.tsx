import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FollowButton from "../components/button/FollowButton";
import { Spinner } from "../components/spinner/Spinner";
import type { User } from "../features/users/types";
import { clearFollowLists } from "../features/users/userSlice";
import {
  fetchFollowers,
  fetchFollowing,
  fetchUserByUsername,
} from "../features/users/userThunks";
import { useAppDispatch, useAppSelector } from "../hooks/useAppSelector";
import uniqueById from "../utils/uniqueById";

export default function FollowListPage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    selectedUser,
    loading,
    followers,
    following,
    followersNext,
    followingNext,
    hasMoreFollowers,
    hasMoreFollowing,
    loadingFollowers,
    loadingFollowing,
  } = useAppSelector((state) => state.users);

  const authUserId = useAppSelector((state) => state.auth.user?.id);

  const activeTab: "followers" | "following" = location.pathname.includes(
    "/following"
  )
    ? "following"
    : "followers";

  const safeFollowers = useMemo(() => uniqueById(followers), [followers]);
  const safeFollowing = useMemo(() => uniqueById(following), [following]);

  useEffect(() => {
    if (!username) return;
    dispatch(fetchUserByUsername(username));
  }, [username, dispatch]);

  useEffect(() => {
    if (!selectedUser?.id) return;

    dispatch(clearFollowLists());
    dispatch(fetchFollowers({ userId: selectedUser.id }));
    dispatch(fetchFollowing({ userId: selectedUser.id }));
  }, [selectedUser?.id, dispatch]);

  const handleLoadMore = () => {
    if (!selectedUser) return;

    const isFollowers = activeTab === "followers";
    const nextUrl = isFollowers ? followersNext : followingNext;
    const isLoading = isFollowers ? loadingFollowers : loadingFollowing;

    if (!nextUrl || isLoading) return;

    const fn = isFollowers ? fetchFollowers : fetchFollowing;

    dispatch(fn({ userId: selectedUser.id, url: nextUrl }));
  };

  const renderUserItem = (user: User) => {
    const isAuthUser = user.id === authUserId;
    const linkTo = isAuthUser ? "/profile" : `/user/${user.username}`;

    return (
      <div
        key={user.id}
        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <Link to={linkTo} className="font-semibold text-gray-800">
              {user.name}
            </Link>
            <Link to={linkTo} className="text-gray-500 text-sm">
              @{user.username}
            </Link>
          </div>
        </div>

        {!isAuthUser && (
          <FollowButton
            userId={user.id}
            isFollowing={Boolean(user.is_following)}
          />
        )}
      </div>
    );
  };

  if (!selectedUser || loading) {
    return (
      <div className="flex justify-center items-center py-6 min-h-[40vh]">
        <Spinner size={30} color="border-t-blue-500" />
        <span className="ml-2 text-gray-500">Carregando usuários...</span>
      </div>
    );
  }

  const list = activeTab === "followers" ? safeFollowers : safeFollowing;
  const hasMore =
    activeTab === "followers" ? hasMoreFollowers : hasMoreFollowing;
  const isLoadingMore =
    activeTab === "followers" ? loadingFollowers : loadingFollowing;

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <button onClick={() => navigate(-1)}>
          <div className="m-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft size={40} className="p-2 cursor-pointer" />
          </div>
        </button>
        <div className="ml-4">
          <h2 className="text-xl font-bold">{selectedUser.name}</h2>
        </div>
      </div>

      <div role="tablist" className="flex border-b border-gray-200 mt-2">
        <Link
          role="tab"
          aria-selected={activeTab === "followers"}
          to={`/follow/${selectedUser.username}/followers`}
          className={`p-3 flex-1 text-center ${
            activeTab === "followers"
              ? "border-b-4 border-blue-500 font-semibold"
              : ""
          }`}
        >
          Seguidores
        </Link>

        <Link
          role="tab"
          aria-selected={activeTab === "following"}
          to={`/follow/${selectedUser.username}/following`}
          className={`p-3 flex-1 text-center ${
            activeTab === "following"
              ? "border-b-4 border-blue-500 font-semibold"
              : ""
          }`}
        >
          Seguindo
        </Link>
      </div>

      <div className="flex flex-col gap-2 mt-2 px-4">
        {list.map(renderUserItem)}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Spinner size={30} color="border-t-blue-500" />
          <span className="ml-2">Carregando usuários...</span>
        </div>
      )}

      {hasMore && (
        <button
          disabled={isLoadingMore}
          onClick={handleLoadMore}
          className="p-2 text-blue-500 text-center mt-2 disabled:opacity-50"
        >
          {isLoadingMore ? "Carregando..." : "Ver mais"}
        </button>
      )}
    </div>
  );
}
