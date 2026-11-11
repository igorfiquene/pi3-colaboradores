import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { parseBrDate, formatBrDate, idadeEm } from "./dates";

describe("parseBrDate", () => {
  it("aceita data válida", () => {
    const d = parseBrDate("10/11/2026");
    expect(d).toBeInstanceOf(Date);
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(10); // novembro
    expect(d?.getDate()).toBe(10);
  });
  it("rejeita formatos errados", () => {
    expect(parseBrDate("2026-11-10")).toBeNull();
    expect(parseBrDate("10-11-2026")).toBeNull();
    expect(parseBrDate("1/1/2026")).toBeNull();
    expect(parseBrDate("")).toBeNull();
    expect(parseBrDate("abc")).toBeNull();
  });
  it("rejeita dia inválido para o mês", () => {
    expect(parseBrDate("31/02/2024")).toBeNull();
    expect(parseBrDate("31/04/2024")).toBeNull();
    expect(parseBrDate("32/01/2024")).toBeNull();
    expect(parseBrDate("00/01/2024")).toBeNull();
  });
  it("respeita ano bissexto", () => {
    expect(parseBrDate("29/02/2024")).not.toBeNull(); // bissexto
    expect(parseBrDate("29/02/2023")).toBeNull(); // não bissexto
  });
});

describe("formatBrDate", () => {
  it("formata com padding", () => {
    expect(formatBrDate(new Date(2026, 0, 5))).toBe("05/01/2026");
    expect(formatBrDate(new Date(2026, 10, 10))).toBe("10/11/2026");
  });
});

describe("idadeEm", () => {
  it("no dia do aniversário é a idade completa", () => {
    const nasc = new Date(2010, 10, 10); // 10/11/2010
    const ref = new Date(2026, 10, 10); // 10/11/2026
    expect(idadeEm(nasc, ref)).toBe(16);
  });
  it("na véspera é idade-1", () => {
    const nasc = new Date(2010, 10, 11); // 11/11/2010
    const ref = new Date(2026, 10, 10); // 10/11/2026
    expect(idadeEm(nasc, ref)).toBe(15);
  });
  it("mês anterior ainda não completou", () => {
    const nasc = new Date(2010, 11, 1); // 01/12/2010
    const ref = new Date(2026, 10, 30); // 30/11/2026
    expect(idadeEm(nasc, ref)).toBe(15);
  });
});

describe("determinismo com fake timers", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(() => {
    vi.useRealTimers();
  });
  it("Date.now congelado", () => {
    expect(new Date().getFullYear()).toBe(2026);
  });
});
