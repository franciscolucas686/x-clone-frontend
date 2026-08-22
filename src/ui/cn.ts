/**
 * Junta classes condicionalmente, ignorando falsos.
 *
 * Um wrapper de uma linha, e é esse o ponto: as classes condicionais eram montadas com
 * template literal em seis componentes, cada um com sua forma. Um lugar só significa um
 * lugar para mudar se um dia entrar `tailwind-merge`.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
