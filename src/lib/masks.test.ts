import { describe, it, expect } from "vitest";
import { maskCpf, maskPhone, unmask, hideCpf } from "./masks";

describe("maskCpf", () => {
  it("aplica progressivamente", () => {
    expect(maskCpf("")).toBe("");
    expect(maskCpf("12")).toBe("12");
    expect(maskCpf("123")).toBe("123");
    expect(maskCpf("1234")).toBe("123.4");
    expect(maskCpf("1234567")).toBe("123.456.7");
    expect(maskCpf("11144477735")).toBe("111.444.777-35");
  });
  it("ignora letras", () => {
    expect(maskCpf("abc111")).toBe("111");
  });
  it("aceita valor já formatado (colagem)", () => {
    expect(maskCpf("111.444.777-35")).toBe("111.444.777-35");
  });
  it("corta além de 11 dígitos", () => {
    expect(maskCpf("111444777350000")).toBe("111.444.777-35");
  });
});

describe("maskPhone", () => {
  it("aplica progressivamente", () => {
    expect(maskPhone("")).toBe("");
    expect(maskPhone("9")).toBe("(9");
    expect(maskPhone("98")).toBe("(98");
    expect(maskPhone("98912")).toBe("(98) 912");
    expect(maskPhone("98912345678")).toBe("(98) 91234-5678");
  });
});

describe("unmask", () => {
  it("retorna só dígitos", () => {
    expect(unmask("111.444.777-35")).toBe("11144477735");
    expect(unmask("(98) 91234-5678")).toBe("98912345678");
    expect(unmask("abc")).toBe("");
  });
});

describe("hideCpf", () => {
  it("mascara início e fim", () => {
    expect(hideCpf("11144477735")).toBe("***.444.777-**");
    expect(hideCpf("111.444.777-35")).toBe("***.444.777-**");
  });
  it("devolve placeholder genérico para entrada inválida", () => {
    expect(hideCpf("123")).toBe("***.***.***-**");
    expect(hideCpf("")).toBe("***.***.***-**");
  });
});
