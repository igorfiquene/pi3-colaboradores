import { listarEmpresas } from "@/features/colaboradores/queries";
import { NovoColaboradorClient } from "./NovoColaboradorClient";

export const instant = false;


export default async function NovoColaboradorPage() {
  const empresas = await listarEmpresas();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Novo colaborador</h1>
      <NovoColaboradorClient empresas={empresas} />
    </div>
  );
}
