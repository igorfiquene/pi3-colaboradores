"use client";

import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { maskCpf, maskPhone, hideCpf } from "@/lib/masks";
import { formatBrDate } from "@/lib/dates";
import type { ActionResult } from "../actions";

type Empresa = { id: string; razaoSocial: string };

export type ColaboradorFormValues = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  dataAdmissao: string;
  cargo: string;
  departamento: string;
  empresaId: string;
  status: "ATIVO" | "INATIVO";
  consentimentoLgpd: boolean;
};

type Props = {
  empresas: Empresa[];
  defaultValues?: Partial<ColaboradorFormValues>;
  onSubmit: (values: ColaboradorFormValues) => Promise<ActionResult<unknown>>;
  modoEdicao?: boolean;
};

const DEPARTAMENTOS = [
  { value: "ADMINISTRATIVO", label: "Administrativo" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "RH", label: "RH" },
  { value: "TI", label: "TI" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "OPERACOES", label: "Operações" },
];

function Campo({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

const inputCls =
  "border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function ColaboradorForm({ empresas, defaultValues, onSubmit, modoEdicao }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ColaboradorFormValues>({
    defaultValues: {
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      dataAdmissao: "",
      cargo: "",
      departamento: "",
      empresaId: "",
      status: "ATIVO",
      consentimentoLgpd: false,
      ...defaultValues,
    },
  });
  const [mensagemGeral, setMensagemGeral] = useState<string | null>(null);

  async function envioInterno(values: ColaboradorFormValues) {
    setMensagemGeral(null);
    const result = await onSubmit(values);
    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [campo, msg] of Object.entries(result.fieldErrors)) {
          setError(campo as keyof ColaboradorFormValues, { message: msg });
        }
      }
      if (result.message) setMensagemGeral(result.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(envioInterno)}
      noValidate
      className="flex flex-col gap-4 max-w-2xl"
      aria-label="Formulário de colaborador"
    >
      <Campo label="Nome completo" name="nome" error={errors.nome?.message}>
        <input
          id="nome"
          type="text"
          className={inputCls}
          aria-invalid={!!errors.nome}
          aria-describedby={errors.nome ? "nome-error" : undefined}
          {...register("nome", { required: "Nome é obrigatório" })}
        />
      </Campo>

      <Campo label="CPF" name="cpf" error={errors.cpf?.message}>
        <Controller
          control={control}
          name="cpf"
          rules={{ required: "CPF é obrigatório" }}
          render={({ field }) => (
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={field.value}
              onChange={(e) => field.onChange(maskCpf(e.target.value))}
              aria-invalid={!!errors.cpf}
              aria-describedby={errors.cpf ? "cpf-error" : undefined}
            />
          )}
        />
      </Campo>

      <Campo label="E-mail" name="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          className={inputCls}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email", { required: "E-mail é obrigatório" })}
        />
      </Campo>

      <Campo label="Telefone (opcional)" name="telefone" error={errors.telefone?.message}>
        <Controller
          control={control}
          name="telefone"
          render={({ field }) => (
            <input
              id="telefone"
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={field.value}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
              aria-invalid={!!errors.telefone}
              aria-describedby={errors.telefone ? "telefone-error" : undefined}
            />
          )}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo
          label="Data de nascimento (dd/mm/aaaa)"
          name="dataNascimento"
          error={errors.dataNascimento?.message}
        >
          <input
            id="dataNascimento"
            type="text"
            placeholder="dd/mm/aaaa"
            className={inputCls}
            aria-invalid={!!errors.dataNascimento}
            aria-describedby={
              errors.dataNascimento ? "dataNascimento-error" : undefined
            }
            {...register("dataNascimento", {
              required: "Data de nascimento é obrigatória",
            })}
          />
        </Campo>
        <Campo
          label="Data de admissão (dd/mm/aaaa)"
          name="dataAdmissao"
          error={errors.dataAdmissao?.message}
        >
          <input
            id="dataAdmissao"
            type="text"
            placeholder="dd/mm/aaaa"
            className={inputCls}
            aria-invalid={!!errors.dataAdmissao}
            aria-describedby={
              errors.dataAdmissao ? "dataAdmissao-error" : undefined
            }
            {...register("dataAdmissao", {
              required: "Data de admissão é obrigatória",
            })}
          />
        </Campo>
      </div>

      <Campo label="Cargo" name="cargo" error={errors.cargo?.message}>
        <input
          id="cargo"
          type="text"
          className={inputCls}
          aria-invalid={!!errors.cargo}
          aria-describedby={errors.cargo ? "cargo-error" : undefined}
          {...register("cargo", { required: "Cargo é obrigatório" })}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Departamento" name="departamento" error={errors.departamento?.message}>
          <select
            id="departamento"
            className={inputCls}
            aria-invalid={!!errors.departamento}
            aria-describedby={errors.departamento ? "departamento-error" : undefined}
            {...register("departamento", { required: "Departamento é obrigatório" })}
          >
            <option value="">— Selecione —</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Empresa" name="empresaId" error={errors.empresaId?.message}>
          <select
            id="empresaId"
            className={inputCls}
            aria-invalid={!!errors.empresaId}
            aria-describedby={errors.empresaId ? "empresaId-error" : undefined}
            {...register("empresaId", { required: "Empresa é obrigatória" })}
          >
            <option value="">— Selecione —</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razaoSocial}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo label="Status" name="status" error={errors.status?.message}>
        <select id="status" className={inputCls} {...register("status")}>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </Campo>

      <div className="flex items-start gap-2 pt-2">
        <input
          id="consentimentoLgpd"
          type="checkbox"
          className="mt-1"
          aria-invalid={!!errors.consentimentoLgpd}
          aria-describedby={
            errors.consentimentoLgpd ? "consentimentoLgpd-error" : undefined
          }
          {...register("consentimentoLgpd", {
            required: "É obrigatório confirmar o consentimento LGPD",
          })}
        />
        <div className="flex flex-col">
          <label htmlFor="consentimentoLgpd" className="text-sm text-gray-700">
            Declaro que o colaborador foi informado sobre o tratamento dos seus
            dados (LGPD).
          </label>
          {errors.consentimentoLgpd && (
            <span
              id="consentimentoLgpd-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {errors.consentimentoLgpd.message}
            </span>
          )}
        </div>
      </div>

      {mensagemGeral && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
          {mensagemGeral}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
        >
          {isSubmitting ? "Salvando..." : modoEdicao ? "Atualizar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}

// re-export helpers que a tabela usa
export { hideCpf, formatBrDate };
