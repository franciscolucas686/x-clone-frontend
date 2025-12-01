import { Outlet } from "react-router-dom";
import Rightbar from "../components/rightbar/Rightbar";
import MobileNav from "../components/sidebar/MobileNav";
import Sidebar from "../components/sidebar/Sidebar";

export default function UserPage() {
  return (
    <div className="h-screen w-screen flex justify-center overflow-x-hidden">
      <div className="flex w-full max-w-7xl">
        <aside className="hidden md:flex flex-[0.25] min-w-[250px]">
          <Sidebar />
        </aside>

        <main className="mb-16 sm:mb-0 flex-1 lg:flex-[0.4] min-w-0 overflow-y-auto border-x border-gray-200">
          <Outlet />
        </main>

        <aside className="hidden lg:flex flex-[0.35] min-w-[350px] p-4">
          <Rightbar />
        </aside>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md z-50">
        <MobileNav />
      </div>
    </div>
  );
}
