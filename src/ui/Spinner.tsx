interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: string;
  className?: string;
}

/**
 * `color` default é `border-t-blue-500` — o azul da marca, e o que os nove call sites do
 * app já passavam à mão, um por um, porque o default antigo (`border-t-black`) nunca era
 * o que se queria de verdade.
 *
 * `role="status"` + o texto oculto são o que faltava para leitor de tela: sem eles, todo
 * carregamento do app era mudo — a pessoa via a tela parada, sem indicação de que algo
 * estava em andamento.
 */
export function Spinner({
  size = 24,
  color = "border-t-blue-500",
  thickness = "border-4",
  className = "",
}: SpinnerProps) {
  return (
    <div role="status" className={className}>
      <div
        className={`rounded-full border-gray-300 ${color} ${thickness} animate-spin`}
        style={{ width: size, height: size }}
      />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
