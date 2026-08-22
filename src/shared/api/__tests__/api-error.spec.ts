import { describe, expect, it } from "vitest";
import { getErrorMessage, getFieldErrors } from "@/shared/api/api-error";

describe("getErrorMessage", () => {
  it("traduz pelo code, não pela mensagem do servidor", () => {
    const texto = getErrorMessage({
      code: "INVALID_CREDENTIALS",
      message: "No active account found with the given credentials",
      details: null,
      status_code: 401,
      path: "/api/token/",
    });

    // O ponto do contrato: a frase em inglês do servidor nunca chega ao usuário.
    expect(texto).toBe("Usuário ou senha incorretos.");
  });

  it("usa a mensagem do servidor quando o code ainda não tem tradução", () => {
    // Mantém a tela útil se o backend ganhar um código novo antes de o frontend subir.
    const texto = getErrorMessage({
      code: "CODIGO_QUE_AINDA_NAO_EXISTE",
      message: "Mensagem vinda do servidor",
      details: null,
      status_code: 400,
      path: "",
    });

    expect(texto).toBe("Mensagem vinda do servidor");
  });

  it("cai num texto genérico para o que não é erro da API", () => {
    expect(getErrorMessage(null)).toBe("Algo deu errado. Tente novamente.");
  });
});

describe("getFieldErrors", () => {
  it("preserva todos os campos, não só o primeiro", () => {
    // O handler anterior descartava tudo menos messages[0]: um erro em três campos
    // aparecia como um só.
    const campos = getFieldErrors({
      code: "VALIDATION_ERROR",
      message: "Confira os campos",
      details: { username: ["obrigatório"], password: ["curta demais"] },
      status_code: 400,
      path: "",
    });

    expect(Object.keys(campos)).toEqual(["username", "password"]);
  });
});
