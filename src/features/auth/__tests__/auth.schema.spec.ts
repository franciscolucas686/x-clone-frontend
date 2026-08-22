import { describe, expect, it } from "vitest";
import { editProfileSchema, loginSchema, registerSchema } from "@/features/auth/auth.schema";

/** Schemas testados direto, sem renderizar nada. */
describe("registerSchema", () => {
  const valido = {
    username: "ana_silva",
    name: "Ana",
    password: "SenhaForte123",
    confirmPassword: "SenhaForte123",
  };

  it("aceita um cadastro completo", () => {
    expect(registerSchema.safeParse(valido).success).toBe(true);
  });

  it("recusa senha com menos de 8 caracteres", () => {
    // Espelha o MinimumLengthValidator do Django. Antes o mínimo só era descoberto
    // batendo no servidor e lendo a mensagem em inglês.
    const r = registerSchema.safeParse({
      ...valido,
      password: "Curta1",
      confirmPassword: "Curta1",
    });
    expect(r.success).toBe(false);
  });

  it("recusa senha só de números", () => {
    const r = registerSchema.safeParse({
      ...valido,
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(r.success).toBe(false);
  });

  it("recusa senhas diferentes, apontando o campo de confirmação", () => {
    const r = registerSchema.safeParse({ ...valido, confirmPassword: "OutraCoisa123" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("recusa username com caractere fora do conjunto do Django", () => {
    expect(registerSchema.safeParse({ ...valido, username: "ana silva!" }).success).toBe(false);
  });

  it("aceita cadastro sem nome — o campo é opcional no modelo", () => {
    expect(registerSchema.safeParse({ ...valido, name: "" }).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("não valida força da senha", () => {
    // Quem já tem conta pode ter senha criada sob outras regras; recusá-la aqui
    // esconderia o motivo real do erro.
    expect(loginSchema.safeParse({ username: "ana", password: "123" }).success).toBe(true);
  });

  it("exige os dois campos", () => {
    expect(loginSchema.safeParse({ username: "", password: "" }).success).toBe(false);
  });
});

describe("editProfileSchema", () => {
  const base = { username: "ana", name: "Ana", password: "", confirmPassword: "" };

  it("aceita senha vazia — significa 'não trocar'", () => {
    expect(editProfileSchema.safeParse(base).success).toBe(true);
  });

  it("valida a força quando a senha é preenchida", () => {
    const r = editProfileSchema.safeParse({ ...base, password: "123", confirmPassword: "123" });
    expect(r.success).toBe(false);
  });
});
