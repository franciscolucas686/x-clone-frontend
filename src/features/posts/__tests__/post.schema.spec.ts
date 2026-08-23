import { describe, expect, it } from "vitest";
import { POST_MAX_LENGTH, validatePostText } from "@/features/posts/post.schema";

describe("validatePostText", () => {
  it("recusa vazio e espaço em branco", () => {
    expect(validatePostText("", "vazio")).toBe("vazio");
    expect(validatePostText("   ", "vazio")).toBe("vazio");
  });

  it("recusa acima do limite", () => {
    const grande = "a".repeat(POST_MAX_LENGTH + 1);
    expect(validatePostText(grande, "vazio")).toBe(`Máximo de ${POST_MAX_LENGTH} caracteres.`);
  });

  it("aceita no limite exato", () => {
    const limite = "a".repeat(POST_MAX_LENGTH);
    expect(validatePostText(limite, "vazio")).toBeNull();
  });

  it("aceita conteúdo comum", () => {
    expect(validatePostText("olá mundo", "vazio")).toBeNull();
  });
});
