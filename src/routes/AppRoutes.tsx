import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Feed from "@/components/feed/Feed";
import { restoreUser } from "@/features/auth/authThunks";
import { useAppDispatch } from "@/hooks/useAppSelector";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Spinner } from "@/ui/Spinner";
import PrivateRoute from "@/routes/PrivateRoute";
import PublicRoute from "@/routes/PublicRoute";

// Carregadas sob demanda. Todas as páginas, todos os modais e o lucide-react inteiro
// iam num pacote só; estas quatro não são vistas na primeira visita.
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const FollowListPage = lazy(() => import("@/pages/FollowListPage"));
const ExplorerPage = lazy(() => import("@/pages/ExplorerPage"));
const MessagePage = lazy(() => import("@/pages/MessagePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));

function Carregando() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size={40} color="border-t-blue-500" />
    </div>
  );
}

export function AppRoutes() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Único ponto de bootstrap da sessão. O resultado alimenta `auth.status`, de onde
    // PrivateRoute e PublicRoute decidem — sem temporizador nenhum.
    dispatch(restoreUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/follow/:username/followers" element={<FollowListPage />} />
              <Route path="/follow/:username/following" element={<FollowListPage />} />
              <Route path="/messages" element={<MessagePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/explorer" element={<ExplorerPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
