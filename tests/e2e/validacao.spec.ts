import { test, expect } from "@playwright/test";

test("validação: submit vazio não envia e mostra erros", async ({ page }) => {
  await page.goto("/colaboradores/novo");
  await page.getByRole("button", { name: /cadastrar/i }).click();

  // URL não mudou
  await expect(page).toHaveURL(/\/colaboradores\/novo\/?$/);

  // Erros aparecem
  await expect(page.getByText(/nome é obrigatório/i)).toBeVisible();
  await expect(page.getByText(/cpf é obrigatório/i)).toBeVisible();
  await expect(page.getByText(/e-mail é obrigatório/i)).toBeVisible();
  await expect(
    page.getByText(/obrigatório confirmar o consentimento lgpd/i),
  ).toBeVisible();
});

test("validação: CPF inválido é rejeitado pelo servidor", async ({ page }) => {
  await page.goto("/colaboradores/novo");

  await page.getByLabel(/nome completo/i).fill("Teste Pessoa");
  await page.getByLabel(/^cpf/i).fill("11111111111"); // válido por formato mas DV inválido
  await page.getByLabel(/e-mail/i).fill(`teste.${Date.now()}@example.com`);
  await page.getByLabel(/data de nascimento/i).fill("10/11/2000");
  await page.getByLabel(/data de admissão/i).fill("01/03/2024");
  await page.getByLabel("Cargo").fill("Analista");
  await page.getByLabel("Departamento", { exact: true }).selectOption("TI");
  await page.getByLabel("Empresa", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel(/declaro que o colaborador/i).check();
  await page.getByRole("button", { name: /cadastrar/i }).click();

  await expect(page.getByText(/cpf inválido/i)).toBeVisible();
});
