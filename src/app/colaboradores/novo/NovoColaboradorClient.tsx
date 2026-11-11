"use client";

import { useRouter } from "next/navigation";
import {
  ColaboradorForm,
  type ColaboradorFormValues,
} from "@/features/colaboradores/components/ColaboradorForm";
import { criarColaborador } from "@/features/colaboradores/actions";

type Empresa = { id: string; razaoSocial: string };

export function NovoColaboradorClient({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();

  async function handleSubmit(values: ColaboradorFormValues) {
    const result = await criarColaborador(values);
    if (result.ok) {
      router.push("/colaboradores");
      router.refresh();
    }
    return result;
  }

  return <ColaboradorForm empresas={empresas} onSubmit={handleSubmit} />;
}
