import { Outlet } from "react-router-dom";
import Rightbar from "@/components/rightbar/Rightbar";
import MobileNav from "@/components/sidebar/MobileNav";
import MobileTopBar from "@/components/sidebar/MobileTopBar";
import Sidebar from "@/components/sidebar/Sidebar";

export default function UserPage() {
  return (
    <div className="h-screen w-screen flex justify-center overflow-x-hidden">
      <div className="flex w-full max-w-7xl">
        <aside className="hidden md:flex flex-[0.25] min-w-[250px]">
          <Sidebar />
        </aside>
        {/*
         * `pb-16` no lugar de `mb-16 sm:mb-0`: a barra inferior é `md:hidden`
         * (abaixo), mas o espaçador desligava em `sm` — entre 640 e 767px a barra
         * ficava visível sobre o último post, porque nada mais abria espaço para ela.
         * Padding, e não margin, também é o que mantém o `border-x` correndo até o
         * fim da coluna, em vez de parar 64px antes dele.
         */}
        <main className="pb-16 md:pb-0 flex-1 lg:flex-[0.4] min-w-0 overflow-y-auto border-x border-gray-200">
          <MobileTopBar />
          <Outlet />
        </main>
        <aside className="hidden lg:flex flex-[0.35] min-w-[350px] p-4">
          <Rightbar />
        </aside>
      </div>
      {/* `pb-[env(...)]` é o que falta no iPhone: sem ela a barra fica sob a faixa de
       * gestos, porque nada no projeto lia a safe-area (zero ocorrências antes desta). */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md z-50 pb-[env(safe-area-inset-bottom)]">
        <MobileNav />
      </div>
    </div>
  );
}
