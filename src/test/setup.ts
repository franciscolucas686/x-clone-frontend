import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { resetMockData } from "@/mocks/handlers";
import { server } from "@/mocks/server";

// `onUnhandledRequest: "error"` transforma uma requisição não mockada em falha de teste.
// É o que mantém `handlers.ts` sendo um inventário completo da superfície de rede do app:
// uma chamada nova que ninguém declarou não passa despercebida.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  localStorage.clear();
});

afterAll(() => server.close());

// O jsdom não implementa matchMedia, e componentes que consultam breakpoint quebram sem
// ele. O stub responde "não casa" para tudo: é a resposta honesta num ambiente sem
// viewport real, em vez de fingir um tamanho de tela que ninguém escolheu.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
