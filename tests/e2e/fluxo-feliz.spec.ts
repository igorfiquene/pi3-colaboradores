import { test, expect } from "@playwright/test";

test("fluxo feliz: cadastra → edita → exclui", async ({ page }) => {
  // Lista inicial
  await page.goto("/colaboradores");
  await expect(page.getByRole("heading", { name: "Colaboradores" })).toBeVisible();

  // Vai pra novo
  await page.getByRole("link", { name: /novo colaborador/i }).click();
  await expect(
    page.getByRole("heading", { name: /novo colaborador/i }),
  ).toBeVisible();

  // Preenche
  await page.getByLabel(/nome completo/i).fill("Maria Silva");
  await page.getByLabel(/^cpf/i).fill("11144477735");
  await page.getByLabel(/e-mail/i).fill(`maria.silva.${Date.now()}@example.com`);
  await page.getByLabel(/telefone/i).fill("98912340000");
  await page.getByLabel(/data de nascimento/i).fill("10/11/2000");
  await page.getByLabel(/data de admissão/i).fill("01/03/2024");
  await page.getByLabel("Cargo").fill("Analista");
  await page.getByLabel("Departamento", { exact: true }).selectOption("TI");
  await page.getByLabel("Empresa", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel(/declaro que o colaborador/i).check();
  await page.getByRole("button", { name: /cadastrar/i }).click();

  // Voltou pra lista, vê o nome
  await expect(page).toHaveURL(/\/colaboradores\/?$/);
  await expect(page.getByText("Maria Silva")).toBeVisible();

  // CPF mascarado na listagem
  await expect(page.getByText("***.444.777-**").first()).toBeVisible();

  // Edita
  await page
    .getByRole("row", { name: /maria silva/i })
    .getByRole("link", { name: /editar/i })
    .click();
  await expect(page.getByRole("heading", { name: /editar colaborador/i })).toBeVisible();
  const cargoEdit = page.getByLabel("Cargo");
  await cargoEdit.fill("");
  await cargoEdit.fill("Gerente");
  await page.getByRole("button", { name: /atualizar/i }).click();

  await expect(page).toHaveURL(/\/colaboradores\/?$/);
  await expect(
    page.getByRole("row", { name: /maria silva/i }).getByText("Gerente"),
  ).toBeVisible();

  // Exclui
  await page
    .getByRole("row", { name: /maria silva/i })
    .getByRole("button", { name: /excluir/i })
    .click();
  const dialog = page.getByRole("dialog", { name: /excluir colaborador/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Excluir" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("cell", { name: "Maria Silva" })).toBeHidden();
});
