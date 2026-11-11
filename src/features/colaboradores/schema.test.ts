import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { colaboradorSchema } from "./schema";

const base = {
  nome: "Igor Fiquene",
  cpf: "111.444.777-35",
  email: "igor@example.com",
  telefone: "(98) 91234-5678",
  dataNascimento: "10/11/2010",
  dataAdmissao: "10/11/2026",
  cargo: "Analista",
  departamento: "TI" as const,
  empresaId: "emp-1",
  status: "ATIVO" as const,
  consentimentoLgpd: true as const,
};

describe("colaboradorSchema", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10)); // 10/11/2026
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("aceita entrada válida e normaliza", () => {
    const res = colaboradorSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.cpf).toBe("11144477735");
      expect(res.data.telefone).toBe("98912345678");
      expect(res.data.email).toBe("igor@example.com");
      expect(res.data.nome).toBe("Igor Fiquene");
    }
  });

  it("nome com múltiplos espaços colapsa (Review Focus #2)", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      nome: "José  da  Silva",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.nome).toBe("José da Silva");
  });

  it("nome com acentos passa", () => {
    const res = colaboradorSchema.safeParse({ ...base, nome: "Ângela Peçanha" });
    expect(res.success).toBe(true);
  });

  it("nome de uma palavra só é rejeitado", () => {
    const res = colaboradorSchema.safeParse({ ...base, nome: "Igor" });
    expect(res.success).toBe(false);
  });

  it("CPF com whitespace externo aceita (Review Focus #1)", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      cpf: " 111.444.777-35 ",
    });
    expect(res.success).toBe(true);
  });

  it("CPF inválido é rejeitado", () => {
    const res = colaboradorSchema.safeParse({ ...base, cpf: "11111111111" });
    expect(res.success).toBe(false);
  });

  it("e-mail inválido é rejeitado", () => {
    const res = colaboradorSchema.safeParse({ ...base, email: "não-email" });
    expect(res.success).toBe(false);
  });

  it("telefone opcional ausente é aceito", () => {
    const res = colaboradorSchema.safeParse({ ...base, telefone: undefined });
    expect(res.success).toBe(true);
  });

  it("idade exatamente 16 no dia é aceita (Review Focus #3)", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      dataNascimento: "10/11/2010", // faz 16 anos exatamente hoje
    });
    expect(res.success).toBe(true);
  });

  it("idade 15 anos e 364 dias é rejeitada", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      dataNascimento: "11/11/2010",
    });
    expect(res.success).toBe(false);
  });

  it("data de nascimento futura é rejeitada", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      dataNascimento: "11/11/2026",
    });
    expect(res.success).toBe(false);
  });

  it("admissão posterior a hoje+30 dias é rejeitada", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      dataAdmissao: "15/12/2026", // > 10/12/2026
    });
    expect(res.success).toBe(false);
  });

  it("admissão até hoje+30 dias é aceita", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      dataAdmissao: "10/12/2026",
    });
    expect(res.success).toBe(true);
  });

  it("consentimento LGPD obrigatório", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      consentimentoLgpd: false,
    });
    expect(res.success).toBe(false);
  });

  it("departamento fora do enum é rejeitado", () => {
    const res = colaboradorSchema.safeParse({
      ...base,
      departamento: "MARKETING" as unknown as typeof base.departamento,
    });
    expect(res.success).toBe(false);
  });

  it("cargo muito curto é rejeitado", () => {
    const res = colaboradorSchema.safeParse({ ...base, cargo: "A" });
    expect(res.success).toBe(false);
  });

  it("empresaId vazio é rejeitado", () => {
    const res = colaboradorSchema.safeParse({ ...base, empresaId: "" });
    expect(res.success).toBe(false);
  });
});
