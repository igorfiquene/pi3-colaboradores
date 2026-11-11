"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { colaboradorSchema } from "./schema";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

function flattenZodErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map((p) => String(p)).join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function tratarP2002(
  err: Prisma.PrismaClientKnownRequestError,
): ActionResult<never> {
  const target = (err.meta?.target as string[] | undefined) ?? [];
  const campo = target[0];
  if (campo === "cpf") {
    return { ok: false, fieldErrors: { cpf: "CPF já cadastrado" } };
  }
  if (campo === "email") {
    return { ok: false, fieldErrors: { email: "E-mail já cadastrado" } };
  }
  return { ok: false, message: "Registro duplicado" };
}

export async function criarColaborador(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = colaboradorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flattenZodErrors(parsed.error.issues),
    };
  }
  const data = parsed.data;
  try {
    const criado = await prisma.colaborador.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone ?? null,
        dataNascimento: data.dataNascimento,
        dataAdmissao: data.dataAdmissao,
        cargo: data.cargo,
        departamento: data.departamento,
        status: data.status,
        empresaId: data.empresaId,
        consentimentoEm: new Date(),
      },
    });
    revalidatePath("/colaboradores");
    return { ok: true, data: { id: criado.id } };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return tratarP2002(err);
    }
    return { ok: false, message: "Erro inesperado ao criar colaborador" };
  }
}

export async function atualizarColaborador(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = colaboradorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flattenZodErrors(parsed.error.issues),
    };
  }
  const data = parsed.data;
  try {
    await prisma.colaborador.update({
      where: { id },
      data: {
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone ?? null,
        dataNascimento: data.dataNascimento,
        dataAdmissao: data.dataAdmissao,
        cargo: data.cargo,
        departamento: data.departamento,
        status: data.status,
        empresaId: data.empresaId,
      },
    });
    revalidatePath("/colaboradores");
    return { ok: true, data: { id } };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return tratarP2002(err);
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { ok: false, message: "Colaborador não encontrado" };
    }
    return { ok: false, message: "Erro inesperado ao atualizar colaborador" };
  }
}

export async function excluirColaborador(
  id: string,
): Promise<ActionResult<null>> {
  try {
    await prisma.colaborador.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/colaboradores");
    return { ok: true, data: null };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { ok: false, message: "Colaborador não encontrado" };
    }
    return { ok: false, message: "Erro inesperado ao excluir colaborador" };
  }
}
