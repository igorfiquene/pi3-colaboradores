import { describe, it, expect } from "vitest";
import { isValidCnpj } from "./cnpj";

describe("isValidCnpj", () => {
  it.each([
    ["11222333000181", "sem máscara, válido"],
    ["11.222.333/0001-81", "com máscara, válido"],
    [" 11222333000181 ", "whitespace externo"],
  ])("aceita %s (%s)", (input) => {
    expect(isValidCnpj(input)).toBe(true);
  });

  it.each([
    ["11111111111111", "todos iguais"],
    ["12345678000100", "DV errado"],
    ["123", "curto"],
    ["112223330001811", "longo"],
    ["", "vazio"],
    ["abcdefghijklmn", "letras"],
  ])("rejeita %s (%s)", (input) => {
    expect(isValidCnpj(input)).toBe(false);
  });

  it("rejeita não-string", () => {
    expect(isValidCnpj(null)).toBe(false);
    expect(isValidCnpj(11222333000181)).toBe(false);
  });
});
