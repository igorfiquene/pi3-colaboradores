import Link from "next/link";
import { listarColaboradores } from "@/features/colaboradores/queries";

export const instant = false;

import { ColaboradorTable } from "@/features/colaboradores/components/ColaboradorTable";
import type { Departamento, Status } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    departamento?: string;
    status?: string;
    pagina?: string;
  }>;
};

const DEPARTAMENTOS = ["ADMINISTRATIVO", "FINANCEIRO", "RH", "TI", "COMERCIAL", "OPERACOES"];

export default async function ColaboradoresPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const departamento = DEPARTAMENTOS.includes(sp.departamento ?? "")
    ? (sp.departamento as Departamento)
    : undefined;
  const status = sp.status === "ATIVO" || sp.status === "INATIVO"
    ? (sp.status as Status)
    : undefined;
  const pagina = Math.max(1, parseInt(sp.pagina ?? "1", 10) || 1);

  const resultado = await listarColaboradores({ q, departamento, status, pagina });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Link
          href="/colaboradores/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Novo colaborador
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 border rounded p-3 bg-gray-50" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou CPF"
          className="border rounded px-3 py-1.5 text-sm flex-1 min-w-48"
          aria-label="Buscar"
        />
        <select
          name="departamento"
          defaultValue={departamento ?? ""}
          className="border rounded px-3 py-1.5 text-sm"
          aria-label="Filtrar por departamento"
        >
          <option value="">Todos os departamentos</option>
          <option value="ADMINISTRATIVO">Administrativo</option>
          <option value="FINANCEIRO">Financeiro</option>
          <option value="RH">RH</option>
          <option value="TI">TI</option>
          <option value="COMERCIAL">Comercial</option>
          <option value="OPERACOES">Operações</option>
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="border rounded px-3 py-1.5 text-sm"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <button type="submit" className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm">
          Filtrar
        </button>
      </form>

      <p className="text-sm text-gray-600">
        {resultado.total} {resultado.total === 1 ? "colaborador" : "colaboradores"} encontrado{resultado.total === 1 ? "" : "s"}
      </p>

      <ColaboradorTable
        itens={resultado.itens}
        totalPaginas={resultado.totalPaginas}
        paginaAtual={resultado.paginaAtual}
        queryBase={{ q, departamento, status }}
      />
    </div>
  );
}
