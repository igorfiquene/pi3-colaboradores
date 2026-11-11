# Registro de Bugs

Defeitos reais no sistema encontrados pelos testes durante o desenvolvimento. Não inclui erros de digitação nos próprios testes.

| # | Data | Tipo de teste que encontrou | Descrição do defeito | Causa | Correção (commit) |
|---|------|-----------------------------|----------------------|-------|-------------------|
| 1 | 2026-11-10 | Unitário (`cnpj.test.ts`) | CNPJ `45283163000134` usado no seed da empresa Globex era inválido pelos dígitos verificadores. Teste unitário de `isValidCnpj` rejeitou o caso quando usado como "válido conhecido", expondo a inconsistência com os dados do seed. | Valor digitado manualmente sem calcular DV. | Trocado por `45283163000167` (valor com DV calculado e validado pelo próprio `isValidCnpj`) no `prisma/seed.ts`, no mesmo commit da Task 2. |
