/**
 * Valida CPF brasileiro pelos dígitos verificadores.
 * Aceita com ou sem máscara. Faz trim antes de validar (whitespace externo não invalida).
 */
export function isValidCpf(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const digits = input.trim().replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDv = (slice: string, start: number): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (start - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const dv1 = calcDv(digits.slice(0, 9), 10);
  if (dv1 !== parseInt(digits[9], 10)) return false;
  const dv2 = calcDv(digits.slice(0, 10), 11);
  if (dv2 !== parseInt(digits[10], 10)) return false;
  return true;
}
