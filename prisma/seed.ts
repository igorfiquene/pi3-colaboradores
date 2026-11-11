import { PrismaClient, Departamento, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Empresas fixas com CNPJs válidos
  const acme = await prisma.empresa.upsert({
    where: { cnpj: "11222333000181" },
    update: {},
    create: {
      razaoSocial: "ACME Tecnologia Ltda",
      cnpj: "11222333000181",
    },
  });
  const globex = await prisma.empresa.upsert({
    where: { cnpj: "45283163000167" },
    update: {},
    create: {
      razaoSocial: "Globex Comércio S.A.",
      cnpj: "45283163000167",
    },
  });

  // Colaboradores sample com CPFs válidos
  const dados = [
    {
      nome: "Ana Souza",
      cpf: "52998224725",
      email: "ana.souza@example.com",
      telefone: "98991110001",
      dataNascimento: new Date("1992-04-15"),
      dataAdmissao: new Date("2022-03-01"),
      cargo: "Analista de Sistemas",
      departamento: Departamento.TI,
      status: Status.ATIVO,
      empresaId: acme.id,
    },
    {
      nome: "Bruno Lima",
      cpf: "11144477735",
      email: "bruno.lima@example.com",
      telefone: "98991110002",
      dataNascimento: new Date("1988-09-22"),
      dataAdmissao: new Date("2020-07-10"),
      cargo: "Gerente Comercial",
      departamento: Departamento.COMERCIAL,
      status: Status.ATIVO,
      empresaId: globex.id,
    },
    {
      nome: "Carla Dias",
      cpf: "93541134780",
      email: "carla.dias@example.com",
      telefone: null,
      dataNascimento: new Date("1995-12-03"),
      dataAdmissao: new Date("2023-01-15"),
      cargo: "Analista RH",
      departamento: Departamento.RH,
      status: Status.ATIVO,
      empresaId: acme.id,
    },
  ];

  for (const d of dados) {
    await prisma.colaborador.upsert({
      where: { cpf: d.cpf },
      update: {},
      create: { ...d, consentimentoEm: new Date() },
    });
  }

  console.log("Seed concluído: 2 empresas, 3 colaboradores.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
