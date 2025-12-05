import { useState } from "react";
import { Xlogo } from "../components/icons/Xlogo";
import LoginModal from "../components/modal/LoginModal";
import RegisterModal from "../components/modal/RegisterModal";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex flex-col items-center min-w-screen md:flex-row md:items-center">
      <div className="col-left">
        <Xlogo className="w-20 h-20 md:w-110 md:h-64" />
      </div>

      <div className="col-right">
        <h1 className="right-title">Acontecendo agora</h1>

        <div className="auth-block">
          <h2 className="auth-title">Inscreva-se hoje</h2>

          <div className="flex flex-col">
            <button className="btn" onClick={() => setShowRegister(true)}>
              Criar conta
            </button>

            <div className="divider">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-2 text-gray-500">ou</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <button className="btn" onClick={() => setShowLogin(true)}>
              Entrar
            </button>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full text-center text-gray-400 text-xs">
        Todos direitos reservados © Francisco Lucas 2025
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
