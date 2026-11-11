/* @vitest-environment node */
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb, pegarEmpresaId } from "../../../tests/helpers/db";
import {
  criarColaborador,
  atualizarColaborador,
  excluirColaborador,
} from "./actions";

// mock do next/cache.revalidatePath (não funciona fora do contexto do Next)
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const inputBase = (empresaId: string) => ({
  nome: "Igor Fiquene",
  cpf: "111.444.777-35",
  email: "igor@example.com",
  telefone: "(98) 91234-5678",
  dataNascimento: "10/11/2000",
  dataAdmissao: "10/11/2024",
  cargo: "Analista",
  departamento: "TI" as const,
  empresaId,
  status: "ATIVO" as const,
  consentimentoLgpd: true as const,
});

describe("criarColaborador (integração)", () => {
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

  it("cria colaborador com input válido", async () => {
    const res = await criarColaborador(inputBase(empresaId));
    expect(res.ok).toBe(true);
    if (res.ok) {
      const c = await prisma.colaborador.findUnique({ where: { id: res.data.id } });
      expect(c?.nome).toBe("Igor Fiquene");
      expect(c?.cpf).toBe("11144477735"); // sem máscara no banco
      expect(c?.telefone).toBe("98912345678");
      expect(c?.consentimentoEm).toBeInstanceOf(Date);
    }
  });

  it("retorna fieldErrors para input inválido (não lança)", async () => {
    const res = await criarColaborador({
      ...inputBase(empresaId),
      cpf: "11111111111",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.cpf).toBe("CPF inválido");
  });

  it("CPF duplicado vira fieldErrors.cpf", async () => {
    await criarColaborador(inputBase(empresaId));
    const res = await criarColaborador({
      ...inputBase(empresaId),
      email: "outro@example.com",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.cpf).toBe("CPF já cadastrado");
  });

  it("e-mail duplicado vira fieldErrors.email", async () => {
    await criarColaborador(inputBase(empresaId));
    const res = await criarColaborador({
      ...inputBase(empresaId),
      cpf: "529.982.247-25",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.email).toBe("E-mail já cadastrado");
  });
});

describe("atualizarColaborador (integração)", () => {
  let empresaId: string;
  let idA: string;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await resetDb();
    empresaId = await pegarEmpresaId();
    const res = await criarColaborador(inputBase(empresaId));
    if (res.ok) idA = res.data.id;
  });

  it("atualiza cargo", async () => {
    const res = await atualizarColaborador(idA, {
      ...inputBase(empresaId),
      cargo: "Gerente",
    });
    expect(res.ok).toBe(true);
    const c = await prisma.colaborador.findUnique({ where: { id: idA } });
    expect(c?.cargo).toBe("Gerente");
  });

  it("CPF conflitando com outro registro vira fieldErrors.cpf (Review Focus #4)", async () => {
    // cria segundo colaborador com outro CPF
    await criarColaborador({
      ...inputBase(empresaId),
      cpf: "529.982.247-25",
      email: "b@example.com",
    });
    // tenta atualizar A pro CPF de B
    const res = await atualizarColaborador(idA, {
      ...inputBase(empresaId),
      cpf: "529.982.247-25",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.cpf).toBe("CPF já cadastrado");
  });

  it("atualizar inexistente retorna ok:false", async () => {
    const res = await atualizarColaborador("id-que-nao-existe", inputBase(empresaId));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toBe("Colaborador não encontrado");
  });
});

describe("excluirColaborador (integração)", () => {
  let empresaId: string;
  let id: string;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await resetDb();
    empresaId = await pegarEmpresaId();
    const res = await criarColaborador(inputBase(empresaId));
    if (res.ok) id = res.data.id;
  });

  it("soft delete seta deletedAt", async () => {
    const res = await excluirColaborador(id);
    expect(res.ok).toBe(true);
    const c = await prisma.colaborador.findUnique({ where: { id } });
    expect(c?.deletedAt).toBeInstanceOf(Date);
  });
});
