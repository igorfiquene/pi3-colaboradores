"use client";

import { useRouter } from "next/navigation";
import {
  ColaboradorForm,
  type ColaboradorFormValues,
} from "@/features/colaboradores/components/ColaboradorForm";
import { atualizarColaborador } from "@/features/colaboradores/actions";

type Empresa = { id: string; razaoSocial: string };

type Props = {
  id: string;
  empresas: Empresa[];
  defaultValues: Partial<ColaboradorFormValues>;
};

export function EditarColaboradorClient({ id, empresas, defaultValues }: Props) {
  const router = useRouter();

  async function handleSubmit(values: ColaboradorFormValues) {
    const result = await atualizarColaborador(id, values);
    if (result.ok) {
      router.push("/colaboradores");
      router.refresh();
    }
    return result;
  }

  return (
    <ColaboradorForm
      empresas={empresas}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      modoEdicao
    />
  );
}
