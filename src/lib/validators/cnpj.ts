/**
 * Valida CNPJ brasileiro pelos dígitos verificadores.
 * Aceita com ou sem máscara. Faz trim antes.
 */
export function isValidCnpj(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const digits = input.trim().replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDv = (slice: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const dv1 = calcDv(digits.slice(0, 12), w1);
  if (dv1 !== parseInt(digits[12], 10)) return false;
  const dv2 = calcDv(digits.slice(0, 13), w2);
  if (dv2 !== parseInt(digits[13], 10)) return false;
  return true;
}
