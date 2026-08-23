import { describe, expect, it, vi } from "vitest";
import { formatJoinedDate, formatRelativeDate } from "@/utils/date";

describe("formatJoinedDate", () => {
  it("converte DD/MM/AAAA para 'mês de ano'", () => {
    expect(formatJoinedDate("22/08/2026")).toBe("agosto de 2026");
  });

  it("string vazia devolve string vazia", () => {
    expect(formatJoinedDate("")).toBe("");
  });
});

describe("formatRelativeDate", () => {
  const agora = new Date("2026-08-22T12:00:00Z");

  it("segundos atrás vira 'agora'", () => {
    vi.setSystemTime(agora);
    expect(formatRelativeDate(new Date(agora.getTime() - 10_000).toISOString())).toBe("agora");
    vi.useRealTimers();
  });

  it("minutos e horas atrás usam o formato relativo", () => {
    vi.setSystemTime(agora);
    expect(formatRelativeDate(new Date(agora.getTime() - 5 * 60_000).toISOString())).toContain(
      "min",
    );
    expect(formatRelativeDate(new Date(agora.getTime() - 3 * 3_600_000).toISOString())).toContain(
      "h",
    );
    vi.useRealTimers();
  });

  it("mais de uma semana cai para a data absoluta", () => {
    vi.setSystemTime(agora);
    const dezDiasAtras = new Date(agora.getTime() - 10 * 86_400_000).toISOString();
    const resultado = formatRelativeDate(dezDiasAtras);
    expect(resultado).not.toContain("há");
    expect(resultado).toMatch(/\d/);
    vi.useRealTimers();
  });
});
