/* @vitest-environment node */
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb, pegarEmpresaId } from "../../../tests/helpers/db";
import { listarColaboradores, obterColaborador, listarEmpresas } from "./queries";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

async function semear(n: number, empresaId: string) {
  const dados = [];
  for (let i = 0; i < n; i++) {
    dados.push({
      nome: `Pessoa ${String(i).padStart(2, "0")}`,
      cpf: gerarCpf(i),
      email: `pessoa${i}@example.com`,
      dataNascimento: new Date(1995, 0, 1),
      dataAdmissao: new Date(2020, 0, 1),
      cargo: "Analista",
      departamento: i % 2 === 0 ? ("TI" as const) : ("RH" as const),
      status: i % 3 === 0 ? ("INATIVO" as const) : ("ATIVO" as const),
      consentimentoEm: new Date(),
      empresaId,
    });
  }
  await prisma.colaborador.createMany({ data: dados });
}

function gerarCpf(i: number): string {
  // CPFs válidos conhecidos + variações; aqui só precisa ser único (schema não valida no createMany)
  const base = String(10000000000 + i).padStart(11, "0");
  return base;
}

describe("listarColaboradores", () => {
  let empresaId: string;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(async () => {
    vi.useRealTimers();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await resetDb();
    empresaId = await pegarEmpresaId();
  });

  it("pagina 15 colaboradores em 10 por página", async () => {
    await semear(15, empresaId);
    const p1 = await listarColaboradores({});
    expect(p1.total).toBe(15);
    expect(p1.itens.length).toBe(10);
    expect(p1.totalPaginas).toBe(2);

    const p2 = await listarColaboradores({ pagina: 2 });
    expect(p2.itens.length).toBe(5);
  });

  it("não retorna soft-deleted", async () => {
    await semear(3, empresaId);
    await prisma.colaborador.updateMany({ data: { deletedAt: new Date() } });
    const res = await listarColaboradores({});
    expect(res.total).toBe(0);
  });

  it("busca por nome parcial", async () => {
    await semear(5, empresaId);
    const res = await listarColaboradores({ q: "Pessoa 02" });
    expect(res.total).toBe(1);
    expect(res.itens[0].nome).toBe("Pessoa 02");
  });

  it("busca por CPF com pontuação normaliza termo pra dígitos", async () => {
    await semear(3, empresaId);
    // CPFs semeados: 10000000000, 10000000001, 10000000002
    const res = await listarColaboradores({ q: "100.000.000-02" });
    expect(res.total).toBe(1);
    expect(res.itens[0].cpf).toBe("10000000002");
  });

  it("filtra por departamento", async () => {
    await semear(10, empresaId);
    const res = await listarColaboradores({ departamento: "TI" });
    // pares são TI: 0,2,4,6,8 = 5
    expect(res.total).toBe(5);
  });

  it("filtra por status", async () => {
    await semear(9, empresaId);
    const res = await listarColaboradores({ status: "INATIVO" });
    // múltiplos de 3: 0,3,6 = 3
    expect(res.total).toBe(3);
  });
});

describe("obterColaborador", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(() => vi.useRealTimers());

  it("retorna null para id inexistente", async () => {
    await resetDb();
    const c = await obterColaborador("nao-existe");
    expect(c).toBeNull();
  });

  it("não retorna soft-deleted", async () => {
    await resetDb();
    const empresaId = await pegarEmpresaId();
    const c = await prisma.colaborador.create({
      data: {
        nome: "X Y",
        cpf: "11144477735",
        email: "x@example.com",
        dataNascimento: new Date(1995, 0, 1),
        dataAdmissao: new Date(2020, 0, 1),
        cargo: "A",
        departamento: "TI",
        empresaId,
        consentimentoEm: new Date(),
        deletedAt: new Date(),
      },
    });
    const r = await obterColaborador(c.id);
    expect(r).toBeNull();
  });
});

describe("listarEmpresas", () => {
  it("retorna empresas-seed em ordem alfabética", async () => {
    await resetDb();
    const e = await listarEmpresas();
    expect(e.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < e.length; i++) {
      expect(e[i].razaoSocial.localeCompare(e[i - 1].razaoSocial)).toBeGreaterThanOrEqual(0);
    }
  });
});
