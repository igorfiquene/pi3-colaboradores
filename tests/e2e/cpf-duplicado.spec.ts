import { test, expect } from "@playwright/test";

test("CPF duplicado: mensagem no campo", async ({ page }) => {
  await page.goto("/colaboradores/novo");

  // 52998224725 foi semeado pelo global-setup como "Fulano Existente"
  await page.getByLabel(/nome completo/i).fill("Ciclano Novo");
  await page.getByLabel(/^cpf/i).fill("52998224725");
  await page.getByLabel(/e-mail/i).fill(`ciclano.${Date.now()}@example.com`);
  await page.getByLabel(/data de nascimento/i).fill("10/11/2000");
  await page.getByLabel(/data de admissão/i).fill("01/03/2024");
  await page.getByLabel("Cargo").fill("Analista");
  await page.getByLabel("Departamento", { exact: true }).selectOption("TI");
  await page.getByLabel("Empresa", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel(/declaro que o colaborador/i).check();
  await page.getByRole("button", { name: /cadastrar/i }).click();

  await expect(page.getByText(/cpf já cadastrado/i)).toBeVisible();
  // Continua na página de novo
  await expect(page).toHaveURL(/\/colaboradores\/novo\/?$/);
});
