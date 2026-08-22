import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Separado de vite.config.ts de propósito: os testes não precisam do proxy /api do
// dev-server — as chamadas de rede são interceptadas pelo MSW — e manter este arquivo
// independente de `mode` evita acoplar o runner de testes a VITE_* / .env.*.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // O cliente axios lê `import.meta.env.VITE_API_URL` como baseURL. Definido
    // aqui, os handlers do MSW casam por URL absoluta — o mesmo formato que as
    // requisições têm em produção — em vez de dependerem da origem do jsdom.
    env: { VITE_API_URL: "http://localhost:8000/api/v1" },
    css: true,
  },
});
