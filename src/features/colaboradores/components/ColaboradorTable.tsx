"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { hideCpf } from "@/lib/masks";
import type { ColaboradorListItem } from "../queries";
import { excluirColaborador } from "../actions";
import { ConfirmarExclusao } from "./ConfirmarExclusao";

type Props = {
  itens: ColaboradorListItem[];
  totalPaginas: number;
  paginaAtual: number;
  queryBase: Record<string, string | undefined>;
};

const DEPT_LABEL: Record<string, string> = {
  ADMINISTRATIVO: "Administrativo",
  FINANCEIRO: "Financeiro",
  RH: "RH",
  TI: "TI",
  COMERCIAL: "Comercial",
  OPERACOES: "Operações",
};

export function ColaboradorTable({ itens, totalPaginas, paginaAtual, queryBase }: Props) {
  const [paraExcluir, setParaExcluir] = useState<ColaboradorListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmarExclusao() {
    if (!paraExcluir) return;
    const id = paraExcluir.id;
    startTransition(async () => {
      await excluirColaborador(id);
      setParaExcluir(null);
    });
  }

  if (itens.length === 0) {
    return (
      <div className="border border-dashed rounded p-8 text-center text-gray-500">
        Nenhum colaborador encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">CPF</th>
              <th className="px-3 py-2">Cargo</th>
              <th className="px-3 py-2">Departamento</th>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.nome}</td>
                <td className="px-3 py-2 font-mono">{hideCpf(c.cpf)}</td>
                <td className="px-3 py-2">{c.cargo}</td>
                <td className="px-3 py-2">{DEPT_LABEL[c.departamento] ?? c.departamento}</td>
                <td className="px-3 py-2">{c.empresa.razaoSocial}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      c.status === "ATIVO"
                        ? "text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs"
                        : "text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs"
                    }
                  >
                    {c.status === "ATIVO" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/colaboradores/${c.id}/editar`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setParaExcluir(c)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <nav className="flex gap-2 justify-center mt-4" aria-label="Paginação">
          {Array.from({ length: totalPaginas }).map((_, i) => {
            const p = i + 1;
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(queryBase)) {
              if (v) params.set(k, v);
            }
            params.set("pagina", String(p));
            const ativa = p === paginaAtual;
            return (
              <Link
                key={p}
                href={`/colaboradores?${params.toString()}`}
                aria-current={ativa ? "page" : undefined}
                className={
                  ativa
                    ? "px-3 py-1 bg-blue-600 text-white rounded"
                    : "px-3 py-1 border rounded hover:bg-gray-50"
                }
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}

      <ConfirmarExclusao
        aberto={!!paraExcluir}
        nome={paraExcluir?.nome ?? ""}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
        emProgresso={isPending}
      />
    </>
  );
}
