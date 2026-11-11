# Registro de Bugs

Defeitos reais no sistema encontrados pelos testes durante o desenvolvimento. Não inclui erros de digitação nos próprios testes.

| # | Data | Tipo de teste que encontrou | Descrição do defeito | Causa | Correção (commit) |
|---|------|-----------------------------|----------------------|-------|-------------------|
| 1 | 2026-11-10 | Unitário (`cnpj.test.ts`) | CNPJ `45283163000134` usado no seed da empresa Globex era inválido pelos dígitos verificadores. Teste unitário de `isValidCnpj` rejeitou o caso quando usado como "válido conhecido", expondo a inconsistência com os dados do seed. | Valor digitado manualmente sem calcular DV. | Trocado por `45283163000167` (valor com DV calculado e validado pelo próprio `isValidCnpj`) no `prisma/seed.ts`, no mesmo commit da Task 2. |
| 2 | 2026-11-10 | E2E (`fluxo-feliz.spec.ts`, `cpf-duplicado.spec.ts`, `validacao.spec.ts`) | Em qualquer fluxo que envolvesse preencher o form, o campo **Nome** aparecia vazio no momento do submit — o teste via a mensagem "Nome é obrigatório" apesar de ter chamado `.fill("...")` explicitamente. Outros campos filled corretamente. Reprodução consistente em 3 cenários independentes. | O componente auxiliar `Campo` estava declarado **dentro** de `ColaboradorForm`, criando uma nova referência de função a cada render. React tratava como componente diferente e desmontava/remontava os `<input>` filhos a cada atualização de estado do RHF, zerando valores. | Mover `Campo` e a constante `inputCls` para o escopo do módulo, acima da função `ColaboradorForm`. Commit da Task 4. |
