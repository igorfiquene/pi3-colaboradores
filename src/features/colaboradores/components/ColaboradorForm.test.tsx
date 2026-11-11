import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColaboradorForm } from "./ColaboradorForm";

const empresas = [
  { id: "emp-1", razaoSocial: "ACME Tecnologia Ltda" },
  { id: "emp-2", razaoSocial: "Globex Comércio S.A." },
];

async function preencherValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nome completo/i), "Igor Fiquene");
  await user.type(screen.getByLabelText(/^cpf/i), "11144477735");
  await user.type(screen.getByLabelText(/e-mail/i), "igor@example.com");
  await user.type(screen.getByLabelText(/telefone/i), "98912345678");
  await user.type(screen.getByLabelText(/data de nascimento/i), "10/11/2000");
  await user.type(screen.getByLabelText(/data de admissão/i), "10/11/2024");
  await user.type(screen.getByLabelText(/cargo/i), "Analista");
  await user.selectOptions(screen.getByLabelText(/departamento/i), "TI");
  await user.selectOptions(screen.getByLabelText(/^empresa$/i), "emp-1");
  await user.click(screen.getByLabelText(/declaro que o colaborador/i));
}

describe("ColaboradorForm", () => {
  beforeAll(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 10));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("aplica máscara de CPF enquanto o usuário digita", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ColaboradorForm empresas={empresas} onSubmit={vi.fn()} />);
    const cpf = screen.getByLabelText(/^cpf/i) as HTMLInputElement;
    await user.type(cpf, "11144477735");
    expect(cpf.value).toBe("111.444.777-35");
  });

  it("submit vazio mostra erros e NÃO chama onSubmit", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn();
    render(<ColaboradorForm empresas={empresas} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  it("submit válido chama onSubmit com CPF e telefone sem máscara", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: { id: "x" } });
    render(<ColaboradorForm empresas={empresas} onSubmit={onSubmit} />);
    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const chamada = onSubmit.mock.calls[0][0];
    // RHF entrega os valores exatamente como estão no estado:
    expect(chamada.cpf).toBe("111.444.777-35");
    expect(chamada.telefone).toBe("(98) 91234-5678");
    expect(chamada.nome).toBe("Igor Fiquene");
    expect(chamada.consentimentoLgpd).toBe(true);
  });

  it("erro do servidor em campo específico aparece no campo", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn().mockResolvedValue({
      ok: false,
      fieldErrors: { cpf: "CPF já cadastrado" },
    });
    render(<ColaboradorForm empresas={empresas} onSubmit={onSubmit} />);
    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    expect(await screen.findByText(/cpf já cadastrado/i)).toBeInTheDocument();
  });

  it("não marcar LGPD impede submissão", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn();
    render(<ColaboradorForm empresas={empresas} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nome completo/i), "Igor Fiquene");
    await user.type(screen.getByLabelText(/^cpf/i), "11144477735");
    await user.type(screen.getByLabelText(/e-mail/i), "igor@example.com");
    await user.type(screen.getByLabelText(/data de nascimento/i), "10/11/2000");
    await user.type(screen.getByLabelText(/data de admissão/i), "10/11/2024");
    await user.type(screen.getByLabelText(/cargo/i), "Analista");
    await user.selectOptions(screen.getByLabelText(/departamento/i), "TI");
    await user.selectOptions(screen.getByLabelText(/^empresa$/i), "emp-1");
    // NÃO marca o LGPD
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/obrigatório confirmar o consentimento lgpd/i),
    ).toBeInTheDocument();
  });

  it("input vinculado ao erro via aria-describedby", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ColaboradorForm empresas={empresas} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    const nome = await screen.findByLabelText(/nome completo/i);
    expect(nome).toHaveAttribute("aria-invalid", "true");
    expect(nome).toHaveAttribute("aria-describedby", "nome-error");
  });
});
