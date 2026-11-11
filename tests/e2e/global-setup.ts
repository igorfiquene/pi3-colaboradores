import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

/**
 * Carrega .env.local pra o processo Playwright antes de criar o prisma client.
 */
function loadEnv() {
  try {
    const content = fs.readFileSync(".env.local", "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^"|"$/g, "");
      }
    }
  } catch {
    // sem .env.local, segue
  }
}

export default async function globalSetup() {
  loadEnv();
  const prisma = new PrismaClient();
  await prisma.colaborador.deleteMany();
  const existentes = await prisma.empresa.count();
  if (existentes === 0) {
    await prisma.empresa.createMany({
      data: [
        { razaoSocial: "ACME Tecnologia Ltda", cnpj: "11222333000181" },
        { razaoSocial: "Globex Comércio S.A.", cnpj: "45283163000167" },
      ],
    });
  }
  // Semeia 1 colaborador pra testar CPF duplicado
  const acme = await prisma.empresa.findFirst({
    where: { cnpj: "11222333000181" },
  });
  if (acme) {
    await prisma.colaborador.create({
      data: {
        nome: "Fulano Existente",
        cpf: "52998224725",
        email: "fulano.existente@example.com",
        dataNascimento: new Date(1990, 0, 1),
        dataAdmissao: new Date(2020, 0, 1),
        cargo: "Analista Existente",
        departamento: "TI",
        empresaId: acme.id,
        consentimentoEm: new Date(),
      },
    });
  }
  await prisma.$disconnect();
}
