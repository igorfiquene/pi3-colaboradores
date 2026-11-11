/**
 * Faz parse de data no formato dd/mm/aaaa.
 * Retorna null se inválida (dia fora do mês, 29/02 de não-bissexto, etc).
 * Horário zerado (meia-noite local).
 */
export function parseBrDate(input: string): Date | null {
  if (typeof input !== "string") return null;
  const m = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  // Catch overflow (31/02 -> 03/03 por ex.)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

/**
 * Formata Date como dd/mm/aaaa.
 */
export function formatBrDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/**
 * Calcula a idade em anos completos de nascimento até referencia.
 * Na véspera do aniversário é idade-1; no dia do aniversário é idade.
 */
export function idadeEm(nascimento: Date, referencia: Date): number {
  let anos = referencia.getFullYear() - nascimento.getFullYear();
  const antesAniv =
    referencia.getMonth() < nascimento.getMonth() ||
    (referencia.getMonth() === nascimento.getMonth() &&
      referencia.getDate() < nascimento.getDate());
  if (antesAniv) anos -= 1;
  return anos;
}
