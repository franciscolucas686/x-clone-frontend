const meses = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** `"22/08/2026"` (o formato de `joined_display`, vindo de `date_joined.strftime("%d/%m/%Y")`
 * no backend) -> `"agosto de 2026"`, como o "Entrou em" do X de verdade. Escrita sem
 * importador nenhum até agora — `ProfileHeader` mostrava o `joined_display` cru. */
export function formatJoinedDate(dateStr: string): string {
  if (!dateStr) return "";
  const [, month, year] = dateStr.split("/").map(Number);
  return `${meses[month - 1]} de ${year}`;
}

const RELATIVO = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/**
 * `"22/08/2026, 14:03:11"` (o que `new Date(iso).toLocaleString()` produzia em
 * `Post.tsx`) para `"2 h"`, `"3 d"` — como o X de verdade mostra o horário de um post.
 * Cai para a data absoluta depois de uma semana, onde "relativo" deixa de ser útil.
 */
export function formatRelativeDate(iso: string): string {
  const data = new Date(iso);
  const diffMs = data.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);

  if (Math.abs(diffMin) < 1) return "agora";
  if (Math.abs(diffMin) < 60) return RELATIVO.format(diffMin, "minute");

  const diffHoras = Math.round(diffMin / 60);
  if (Math.abs(diffHoras) < 24) return RELATIVO.format(diffHoras, "hour");

  const diffDias = Math.round(diffHoras / 24);
  if (Math.abs(diffDias) < 7) return RELATIVO.format(diffDias, "day");

  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}
