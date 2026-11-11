import { Prisma, Departamento, Status } from "@prisma/client";
import { prisma } from "@/lib/db";
import { unmask } from "@/lib/masks";

export type ListarParams = {
  q?: string;
  departamento?: Departamento;
  status?: Status;
  pagina?: number;
};

export type ColaboradorListItem = {
  id: string;
  nome: string;
  cpf: string; // dígitos; a UI aplica hideCpf
  email: string;
  cargo: string;
  departamento: Departamento;
  status: Status;
  empresa: { razaoSocial: string };
};

const POR_PAGINA = 10;

export async function listarColaboradores(params: ListarParams) {
  const { q, departamento, status, pagina = 1 } = params;

  const where: Prisma.ColaboradorWhereInput = { deletedAt: null };

  if (q && q.trim()) {
    const termo = q.trim();
    const termoDigitos = unmask(termo);
    const or: Prisma.ColaboradorWhereInput[] = [
      { nome: { contains: termo, mode: "insensitive" } },
    ];
    if (termoDigitos.length > 0) {
      or.push({ cpf: { contains: termoDigitos } });
    }
    where.OR = or;
  }

  if (departamento) where.departamento = departamento;
  if (status) where.status = status;

  const [total, itens] = await Promise.all([
    prisma.colaborador.count({ where }),
    prisma.colaborador.findMany({
      where,
      orderBy: { nome: "asc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        cargo: true,
        departamento: true,
        status: true,
        empresa: { select: { razaoSocial: true } },
      },
    }),
  ]);

  return {
    itens: itens as ColaboradorListItem[],
    total,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    paginaAtual: pagina,
    porPagina: POR_PAGINA,
  };
}

export async function obterColaborador(id: string) {
  return prisma.colaborador.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function listarEmpresas() {
  return prisma.empresa.findMany({
    select: { id: true, razaoSocial: true },
    orderBy: { razaoSocial: "asc" },
  });
}
