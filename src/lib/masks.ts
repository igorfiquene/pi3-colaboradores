/**
 * Máscara progressiva de CPF: 000.000.000-00
 * Aceita entrada parcial durante digitação.
 */
export function maskCpf(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Máscara progressiva de telefone: (00) 00000-0000
 */
export function maskPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Remove tudo que não é dígito.
 */
export function unmask(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Oculta início e fim de um CPF: 11144477735 -> ***.444.777-**
 * Para listagens públicas (LGPD).
 */
export function hideCpf(cpfDigits: string): string {
  const d = unmask(cpfDigits);
  if (d.length !== 11) return "***.***.***-**";
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}
