import { prisma } from "@/lib/db";

/**
 * Apaga colaboradores e garante empresas-seed presentes.
 * Usado em beforeEach dos testes de integração.
 */
export async function resetDb() {
  await prisma.colaborador.deleteMany();
  // mantém empresas, só garante que existem
  const existentes = await prisma.empresa.count();
  if (existentes === 0) {
    await prisma.empresa.createMany({
      data: [
        { razaoSocial: "ACME Tecnologia Ltda", cnpj: "11222333000181" },
        { razaoSocial: "Globex Comércio S.A.", cnpj: "45283163000167" },
      ],
    });
  }
}

export async function pegarEmpresaId() {
  const e = await prisma.empresa.findFirst();
  if (!e) throw new Error("Nenhuma empresa no banco");
  return e.id;
}
