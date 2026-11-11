import { notFound } from "next/navigation";

export const instant = false;

import {
  listarEmpresas,
  obterColaborador,
} from "@/features/colaboradores/queries";
import { formatBrDate } from "@/lib/dates";
import { maskCpf, maskPhone } from "@/lib/masks";
import { EditarColaboradorClient } from "./EditarColaboradorClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarColaboradorPage({ params }: PageProps) {
  const { id } = await params;
  const [colaborador, empresas] = await Promise.all([
    obterColaborador(id),
    listarEmpresas(),
  ]);

  if (!colaborador) return notFound();

  const defaultValues = {
    nome: colaborador.nome,
    cpf: maskCpf(colaborador.cpf),
    email: colaborador.email,
    telefone: colaborador.telefone ? maskPhone(colaborador.telefone) : "",
    dataNascimento: formatBrDate(colaborador.dataNascimento),
    dataAdmissao: formatBrDate(colaborador.dataAdmissao),
    cargo: colaborador.cargo,
    departamento: colaborador.departamento,
    empresaId: colaborador.empresaId,
    status: colaborador.status,
    consentimentoLgpd: true as const,
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Editar colaborador</h1>
      <EditarColaboradorClient
        id={colaborador.id}
        empresas={empresas}
        defaultValues={defaultValues}
      />
    </div>
  );
}
