import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/ui/Avatar";

/**
 * Substitui oito `<img>` que não tinham `onError`: uma URL de avatar quebrada (offline,
 * Cloudinary fora do ar, um usuário sem foto criado antes do padrão existir) virava o
 * ícone de imagem quebrada do navegador em qualquer uma delas.
 */
describe("Avatar", () => {
  it("cai nas iniciais quando `src` está vazio", () => {
    render(<Avatar src="" name="Ana Lima" />);

    const fallback = screen.getByRole("img", { name: "Ana Lima" });
    expect(fallback).toHaveTextContent("A");
    expect(fallback.tagName).not.toBe("IMG");
  });

  it("cai nas iniciais quando a imagem falha ao carregar", () => {
    render(<Avatar src="https://exemplo.test/quebrada.png" name="Beto" />);

    const img = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    fireEvent.error(img);

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("é decorativo (sem nome anunciado) quando `decorative` é true", () => {
    render(<Avatar src="" name="Ana" decorative />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
