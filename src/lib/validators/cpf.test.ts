import { describe, it, expect } from "vitest";
import { isValidCpf } from "./cpf";

describe("isValidCpf", () => {
  it.each([
    ["11144477735", "sem máscara, válido"],
    ["111.444.777-35", "com máscara, válido"],
    ["52998224725", "outro válido conhecido"],
    [" 111.444.777-35 ", "com whitespace externo aceito via trim"],
  ])("aceita %s (%s)", (input) => {
    expect(isValidCpf(input)).toBe(true);
  });

  it.each([
    ["11111111111", "todos dígitos iguais"],
    ["00000000000", "zeros"],
    ["12345678900", "DV inválido"],
    ["123", "muito curto"],
    ["111444777355", "muito longo"],
    ["", "string vazia"],
    ["abcdefghijk", "letras"],
    ["111.444.777-34", "último DV errado"],
  ])("rejeita %s (%s)", (input) => {
    expect(isValidCpf(input)).toBe(false);
  });

  it("rejeita entradas não-string", () => {
    expect(isValidCpf(null)).toBe(false);
    expect(isValidCpf(undefined)).toBe(false);
    expect(isValidCpf(11144477735)).toBe(false);
  });
});
