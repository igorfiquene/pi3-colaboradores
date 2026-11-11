import { z } from "zod";
import { isValidCpf } from "@/lib/validators/cpf";
import { unmask } from "@/lib/masks";
import { parseBrDate, idadeEm } from "@/lib/dates";

const DEPARTAMENTOS = [
  "ADMINISTRATIVO",
  "FINANCEIRO",
  "RH",
  "TI",
  "COMERCIAL",
  "OPERACOES",
] as const;

const STATUS = ["ATIVO", "INATIVO"] as const;

/**
 * Hoje às 00:00 local, usando a data corrente do sistema.
 * Em testes, controlada por vi.setSystemTime.
 */
function hoje(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Schema do formulário de Colaborador. Fonte única cliente+servidor.
 *
 * Entradas vêm da UI já com máscaras; o schema normaliza para o formato
 * de armazenamento: CPF/telefone como dígitos, datas como Date, nome com
 * espaços colapsados.
 */
export const colaboradorSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(120, "Nome deve ter no máximo 120 caracteres")
      .transform((s) => s.replace(/\s+/g, " "))
      .refine((s) => s.split(" ").filter((p) => p.length > 0).length >= 2, {
        message: "Informe nome e sobrenome",
      }),
    cpf: z
      .string()
      .refine(isValidCpf, { message: "CPF inválido" })
      .transform(unmask),
    email: z.string().trim().toLowerCase().email("E-mail inválido"),
    telefone: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? unmask(v) : undefined))
      .refine((v) => v === undefined || v.length === 10 || v.length === 11, {
        message: "Telefone deve ter 10 ou 11 dígitos",
      }),
    dataNascimento: z
      .string()
      .refine((s) => parseBrDate(s) !== null, {
        message: "Data de nascimento inválida",
      })
      .transform((s) => parseBrDate(s)!)
      .refine((d) => d <= hoje(), {
        message: "Data de nascimento não pode ser futura",
      })
      .refine((d) => idadeEm(d, hoje()) >= 16, {
        message: "Colaborador deve ter pelo menos 16 anos",
      }),
    dataAdmissao: z
      .string()
      .refine((s) => parseBrDate(s) !== null, {
        message: "Data de admissão inválida",
      })
      .transform((s) => parseBrDate(s)!),
    cargo: z
      .string()
      .trim()
      .min(2, "Cargo deve ter pelo menos 2 caracteres")
      .max(80, "Cargo deve ter no máximo 80 caracteres"),
    departamento: z.enum(DEPARTAMENTOS, {
      message: "Departamento inválido",
    }),
    empresaId: z.string().min(1, "Empresa é obrigatória"),
    status: z.enum(STATUS).default("ATIVO"),
    consentimentoLgpd: z.literal(true, {
      message: "É obrigatório confirmar o consentimento LGPD",
    }),
  })
  .superRefine((val, ctx) => {
    const limiteFuturo = new Date(hoje().getTime() + 30 * 24 * 60 * 60 * 1000);
    if (val.dataAdmissao > limiteFuturo) {
      ctx.addIssue({
        code: "custom",
        path: ["dataAdmissao"],
        message: "Data de admissão não pode ser posterior a hoje + 30 dias",
      });
    }
    // Admissão não pode ser antes dos 16 anos de idade
    const minAdmissao = new Date(
      val.dataNascimento.getFullYear() + 16,
      val.dataNascimento.getMonth(),
      val.dataNascimento.getDate(),
    );
    if (val.dataAdmissao < minAdmissao) {
      ctx.addIssue({
        code: "custom",
        path: ["dataAdmissao"],
        message: "Data de admissão não pode ser anterior aos 16 anos",
      });
    }
  });

export type ColaboradorInput = z.input<typeof colaboradorSchema>;
export type ColaboradorParsed = z.output<typeof colaboradorSchema>;
