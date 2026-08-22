import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Precisa concordar com "paths" em tsconfig.app.json e com o alias de
    // vitest.config.ts. Os três juntos são o que faz `@/` resolver no editor, no build
    // e nos testes.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Sem proxy de dev, de propósito.
  //
  // Um proxy manteria tudo na mesma origem localmente e dispensaria CORS — mas em
  // produção o app é servido pela Vercel e a API pelo Render, sem proxy nenhum: o
  // navegador fala direto com a API e o CORS vale. Um proxy só em dev criaria dois
  // caminhos diferentes para a mesma requisição, e o único ambiente onde o CORS é
  // exercitado passaria a ser produção.
  //
  // Chamando direto nos dois, uma origem esquecida em CORS_ALLOWED_ORIGINS aparece na
  // primeira vez que alguém roda o projeto, e não no deploy.
});
