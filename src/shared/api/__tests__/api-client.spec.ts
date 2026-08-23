import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import api, { setUnauthorizedHandler } from "@/shared/api/api-client";
import { isApiError } from "@/shared/api/api-error";
import { clearTokens, getToken, setTokens } from "@/shared/api/auth-storage";
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

describe("api-client — renovação de sessão", () => {
  afterEach(() => {
    clearTokens();
  });

  it("um 401 fora das rotas de credencial, com refresh disponível, renova e refaz a requisição", async () => {
    setTokens({ access: "token-vencido", refresh: "refresh-valido-de-teste" });
    const aviso = vi.fn();
    setUnauthorizedHandler(aviso);

    let primeiraChamada = true;
    server.use(
      http.get(`${API}/posts/following/`, () => {
        if (primeiraChamada) {
          primeiraChamada = false;
          return HttpResponse.json(
            { code: "TOKEN_NOT_VALID", message: "", details: null, status_code: 401, path: "" },
            { status: 401 },
          );
        }
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      }),
    );

    const resposta = await api.get("/posts/following/");

    expect(resposta.status).toBe(200);
    // A sessão se renovou sozinha: quem lê o estado nunca fica sabendo.
    expect(aviso).not.toHaveBeenCalled();
    expect(getToken()).toBe("token-renovado-de-teste");
  });

  it("se o refresh falhar, limpa os tokens e avisa que a sessão caiu", async () => {
    setTokens({ access: "token-vencido", refresh: "refresh-invalido" });
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
    expect(getToken()).toBeNull();
  });

  it("dois 401 concorrentes disparam um único POST /token/refresh/ (voo único)", async () => {
    setTokens({ access: "token-vencido", refresh: "refresh-valido-de-teste" });
    setUnauthorizedHandler(() => {});

    let chamadasDeRefresh = 0;
    server.use(
      http.post(`${API}/token/refresh/`, async ({ request }) => {
        chamadasDeRefresh += 1;
        const body = (await request.json()) as { refresh: string };
        if (body.refresh !== "refresh-valido-de-teste") {
          return HttpResponse.json(
            { code: "TOKEN_NOT_VALID", message: "", details: null, status_code: 401, path: "" },
            { status: 401 },
          );
        }
        return HttpResponse.json({
          access: "token-renovado-de-teste",
          refresh: "refresh-de-teste",
        });
      }),
      http.get(`${API}/posts/following/`, ({ request }) => {
        const auth = request.headers.get("Authorization");
        if (auth === "Bearer token-renovado-de-teste") {
          return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
        }
        return HttpResponse.json(
          { code: "TOKEN_NOT_VALID", message: "", details: null, status_code: 401, path: "" },
          { status: 401 },
        );
      }),
    );

    await Promise.all([api.get("/posts/following/"), api.get("/posts/following/")]);

    // Com ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION no backend, um segundo
    // refresh concorrente usaria um refresh token já rotacionado e derrubaria a sessão.
    expect(chamadasDeRefresh).toBe(1);
  });
});
