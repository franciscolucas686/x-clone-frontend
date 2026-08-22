import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import api, { setUnauthorizedHandler } from "@/shared/api/api-client";
import { isApiError } from "@/shared/api/api-error";
import type { ApiErrorResponse } from "@/shared/api/types";

const API = "http://localhost:8000/api/v1";

describe("api-client", () => {
  it("rejeita com o envelope da API, não com o erro cru do axios", async () => {
    server.use(
      http.get(`${API}/profile/`, () =>
        HttpResponse.json(
          {
            code: "TOKEN_NOT_VALID",
            message: "Token inválido",
            details: null,
            status_code: 401,
            path: "/api/profile/",
          },
          { status: 401 },
        ),
      ),
    );

    const erro = await api.get("/profile/").catch((e) => e);

    expect(isApiError(erro)).toBe(true);
    expect((erro as ApiErrorResponse).code).toBe("TOKEN_NOT_VALID");
  });

  it("sintetiza um envelope quando o servidor não responde", async () => {
    server.use(http.get(`${API}/profile/`, () => HttpResponse.error()));

    const erro = await api.get("/profile/").catch((e) => e);

    // Sem isto, uma queda de rede chegaria aos componentes como um AxiosError cru e
    // cada tela teria que saber distinguir os dois formatos.
    expect((erro as ApiErrorResponse).code).toBe("NETWORK_ERROR");
  });

  it("avisa que a sessão caiu num 401 de rota comum", async () => {
    const aviso = vi.fn();
    setUnauthorizedHandler(aviso);
    server.use(
      http.get(`${API}/posts/following/`, () =>
        HttpResponse.json(
          { code: "TOKEN_NOT_VALID", message: "", details: null, status_code: 401, path: "" },
          { status: 401 },
        ),
      ),
    );

    await api.get("/posts/following/").catch(() => {});

    expect(aviso).toHaveBeenCalledOnce();
  });

  it("NÃO avisa que a sessão caiu num 401 de login", async () => {
    // O defeito que este teste fixa: o interceptor tratava todo 401 como sessão vencida,
    // então errar a senha limpava o storage e disparava `window.location.href = "/"` —
    // um reload que destruía o store antes de a mensagem de erro chegar à tela.
    const aviso = vi.fn();
    setUnauthorizedHandler(aviso);

    await api.post("/token/", { username: "a", password: "senha-errada" }).catch(() => {});

    expect(aviso).not.toHaveBeenCalled();
  });

  it("nunca navega — a decisão de rota é de quem lê o estado", async () => {
    setUnauthorizedHandler(() => {});
    const antes = window.location.href;

    await api.post("/token/", { username: "a", password: "senha-errada" }).catch(() => {});
    await api.get("/profile/").catch(() => {});

    expect(window.location.href).toBe(antes);
  });
});
