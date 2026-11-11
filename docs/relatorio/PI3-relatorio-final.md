<!--
Para converter em DOCX:
  pandoc PI3-relatorio-final.md -o PI3-relatorio-final.docx \
    --reference-doc=template-abnt.docx  # opcional
Para PDF (precisa LaTeX):
  pandoc PI3-relatorio-final.md -o PI3-relatorio-final.pdf
-->

# UNIVERSIDADE CEUMA — UNICEUMA
## PRÓ-REITORIA DE GRADUAÇÃO — PROG
## COORDENADORIA DO CURSO DE SISTEMAS DE INFORMAÇÃO

---

# IMPORTÂNCIA DOS TESTES NO DESENVOLVIMENTO DE UM SISTEMA DE CADASTRO DE COLABORADORES — IMPLEMENTAÇÃO, VALIDAÇÃO E ESTUDO DE CASO

### Relatório técnico de estudo de caso apresentado à disciplina Projeto Interdisciplinar III como continuação do Projeto Interdisciplinar II, destacando a aplicação prática de testes unitários, de integração e de sistema.

**Igor Fiquene Pessoa (RA 007747)**
**Disciplina:** Projeto Interdisciplinar III
**Professor:** Edilson Lima
**Repositório:** https://github.com/igorfiquene/pi3-colaboradores
**Sistema em produção:** https://pi3-colaboradores.vercel.app

**São Luís (MA), 13 de novembro de 2026.**

---

## SUMÁRIO

1. [INTRODUÇÃO](#1-introdução)
2. [PROBLEMA DE PESQUISA](#2-problema-de-pesquisa)
3. [HIPÓTESES](#3-hipóteses)
4. [JUSTIFICATIVA](#4-justificativa)
   4.1 [IDENTIFICAÇÃO E CORREÇÃO DE ERROS PRECOCEMENTE](#41-identificação-e-correção-de-erros-precocemente)
   4.2 [TESTES DE INTEGRAÇÃO](#42-testes-de-integração)
   4.3 [DESIGN DE CÓDIGO MODULAR E COESO](#43-design-de-código-modular-e-coeso)
   4.4 [GARANTIA DA INTEGRAÇÃO CORRETA ENTRE COMPONENTES](#44-garantia-da-integração-correta-entre-componentes)
   4.5 [CONTINUIDADE DAS FUNCIONALIDADES](#45-continuidade-das-funcionalidades)
5. [OBJETIVOS](#5-objetivos)
   5.1 [Objetivo geral](#51-objetivo-geral)
   5.2 [Objetivos específicos](#52-objetivos-específicos)
6. [REVISÃO TEÓRICA](#6-revisão-teórica)
7. [METODOLOGIA](#7-metodologia)
8. [DESENVOLVIMENTO DO SISTEMA](#8-desenvolvimento-do-sistema)
   8.1 [Arquitetura e stack](#81-arquitetura-e-stack)
   8.2 [Modelo de dados](#82-modelo-de-dados)
   8.3 [Funcionalidades implementadas](#83-funcionalidades-implementadas)
   8.4 [Privacidade e LGPD](#84-privacidade-e-lgpd)
9. [SUÍTE DE TESTES](#9-suíte-de-testes)
   9.1 [Testes unitários](#91-testes-unitários)
   9.2 [Testes de componente](#92-testes-de-componente)
   9.3 [Testes de integração](#93-testes-de-integração)
   9.4 [Testes de sistema (E2E)](#94-testes-de-sistema-e2e)
   9.5 [Cobertura](#95-cobertura)
10. [REGISTRO DE BUGS ENCONTRADOS PELOS TESTES](#10-registro-de-bugs-encontrados-pelos-testes)
11. [IMPLANTAÇÃO E TESTE BETA](#11-implantação-e-teste-beta)
12. [ANÁLISE DAS HIPÓTESES](#12-análise-das-hipóteses)
13. [CONCLUSÃO](#13-conclusão)
14. [REFERÊNCIAS](#14-referências)
15. [ANEXOS](#15-anexos)

---

## 1. INTRODUÇÃO

A garantia da qualidade e confiabilidade de sistemas de software é uma preocupação central no desenvolvimento de aplicações que desempenham funções críticas, como é o caso dos sistemas de cadastro de colaboradores. Esses sistemas desempenham papel fundamental na gestão de recursos humanos, armazenando informações sensíveis como CPF, e-mail e vínculos empregatícios. A complexidade da operação e a variedade de regras de negócio tornam essencial a implementação de práticas robustas de teste de software.

O presente relatório é a continuação direta do Projeto Interdisciplinar II (PI II), no qual foi apresentada uma proposta inicial — um formulário de cadastro de empresa (`FormCompany`) com validação de CNPJ e alguns testes isolados em React Testing Library. Naquele trabalho, foram levantadas quatro hipóteses sobre a função dos testes no desenvolvimento, que ficaram no plano teórico.

No PI III, o escopo exigido foi outro: desenvolver o sistema por completo, testá-lo em diferentes níveis, publicá-lo em ambiente real e submetê-lo ao uso de um usuário beta. O produto acadêmico principal deixou de ser a proposta e passou a ser **a suíte de testes e as evidências que ela gera**; o sistema é o objeto de estudo.

Durante o desenvolvimento foram escritos e executados 84 testes automatizados distribuídos em quatro camadas (unitária, de componente de interface, de integração com banco de dados real e de sistema ponta-a-ponta via navegador). O sistema foi implantado publicamente na plataforma Vercel, com banco PostgreSQL gerenciado pela Neon, e disponibilizado para teste beta em domínio público.

O presente relatório descreve todo o processo, apresenta os números finais da execução dos testes, documenta os bugs reais encontrados pela suíte durante o desenvolvimento, e discute se, à luz das evidências acumuladas, as hipóteses levantadas no PI II se confirmam.

---

## 2. PROBLEMA DE PESQUISA

> *Como o desenvolvimento de testes de software (unitários, de integração e de sistema) pode assegurar a qualidade e a confiabilidade de um sistema de cadastro de colaboradores dentro de uma plataforma?*

Esta questão, herdada do PI II, se mantém integralmente no PI III. A diferença é que agora não se trata mais de propor uma resposta teórica, mas de **buscá-la na prática**, por meio de um sistema real, com uma suíte de testes real, executada em ambiente de produção e submetida ao uso de um usuário final.

A relevância do problema persiste porque o cadastro de colaboradores é função crítica em qualquer plataforma corporativa: falhas levam a dados incorretos, duplicidades, perda de informações essenciais e, em contexto brasileiro, riscos de não-conformidade com a LGPD (Lei nº 13.709/2018). Garantir a qualidade desse processo por meio de testes automatizados é, portanto, questão simultaneamente técnica, de negócio e ética.

---

## 3. HIPÓTESES

As mesmas quatro hipóteses do PI II são agora testadas empiricamente:

1. **H1 — Identificação precoce de erros:** a implementação de testes unitários revela falhas em funcionalidades individuais do cadastro (validações, máscaras, armazenamento), permitindo a correção antes que os erros se propaguem para outras partes do sistema.
2. **H2 — Promoção de design modular e coeso:** a necessidade de escrever código testável incentiva uma arquitetura mais bem estruturada, facilitando a manutenção e a extensão do sistema.
3. **H3 — Integração correta entre componentes:** testes de integração confirmam que formulários, validações e banco de dados funcionam de maneira harmoniosa e sem conflitos.
4. **H4 — Continuidade das funcionalidades:** uma suíte de testes robusta permite que mudanças e atualizações sejam implementadas com confiança, sem regressão.

A seção 12 (*Análise das Hipóteses*) retoma cada uma delas, cruzando-a com as evidências concretas produzidas durante o desenvolvimento.

---

## 4. JUSTIFICATIVA

A implementação de testes unitários, de integração e de sistema é essencial para assegurar a qualidade e a confiabilidade de um sistema de cadastro de colaboradores. A seguir, discutimos a importância de cada categoria, atualizando os exemplos apresentados no PI II (que envolviam apenas o formulário `FormCompany`) com exemplos reais do sistema entregue nesta disciplina.

### 4.1 IDENTIFICAÇÃO E CORREÇÃO DE ERROS PRECOCEMENTE

Testes unitários validam a menor parte testável de um software — geralmente uma função pura, de forma isolada do resto do sistema. No PI II, o exemplo apresentado era um teste que verificava a aplicação da máscara de CNPJ no campo de entrada. No PI III, essa categoria foi ampliada para cobrir: validação de dígitos verificadores de CPF e CNPJ, máscaras progressivas (CPF, telefone), ocultamento de CPF para listagem pública (LGPD), parsing de datas no formato brasileiro, cálculo de idade com tratamento de aniversário, e as 17 regras de negócio do schema de cadastro.

Durante o desenvolvimento, **um dos testes unitários (`isValidCnpj`) rejeitou um CNPJ que havia sido inserido manualmente no seed do banco como "válido conhecido"**. A rejeição expôs o fato de que o valor havia sido digitado sem cálculo dos dígitos verificadores. Esse é o **Bug #1** do registro — um caso direto da hipótese 1 do PI II, no qual um teste unitário impediu que dados inconsistentes fossem para produção.

### 4.2 TESTES DE INTEGRAÇÃO

Testes de integração validam se diferentes módulos ou serviços funcionam corretamente juntos. No PI II, o exemplo era um teste que verificava se um CNPJ inválido disparava mensagem de erro no formulário. No PI III, o escopo de integração foi ampliado para cobrir:
- **Camada formulário↔schema:** testes de componente com React Testing Library + user-event verificam que digitar no campo CPF aplica máscara, que submissão vazia dispara erros em todos os campos obrigatórios e **não** chama a Server Action, e que erros devolvidos pelo servidor (como CPF duplicado) aparecem no campo correto.
- **Camada action↔banco:** testes contra um banco PostgreSQL real executam cada Server Action (criar, atualizar, excluir lógico) e verificam o estado resultante — inclusive cenários de concorrência de unicidade (CPF duplicado em `create`, CPF conflitando em `update`).

### 4.3 DESIGN DE CÓDIGO MODULAR E COESO

A necessidade de escrever código testável incentiva, por si só, a adoção de uma arquitetura modular. Como regra arquitetural do projeto, **a lógica pura (validação, máscara, datas) foi isolada na pasta `src/lib/`, sem dependência de React, Next.js ou Prisma**. Isso permite que cada módulo seja testado em isolamento (ver seção 9.1) e, inversamente, que o alto nível de cobertura em `src/lib/` seja evidência direta da hipótese 2.

De forma complementar, o **schema Zod do colaborador foi definido em um único módulo** (`src/features/colaboradores/schema.ts`) e consumido tanto pelo formulário quanto pelas Server Actions. Essa fonte única da verdade é um padrão arquitetural que só é prático porque o schema é testável independentemente.

### 4.4 GARANTIA DA INTEGRAÇÃO CORRETA ENTRE COMPONENTES

Testes de sistema verificam o comportamento do sistema como um todo, simulando o usuário real em um navegador. No PI II, essa categoria foi tratada apenas em exemplos ilustrativos (`fireEvent` em `FormCompany`). No PI III foi efetivamente implementada com Playwright, em três cenários-chave rodando contra o build de produção local.

Esses testes confirmaram que o sistema reage corretamente tanto a entradas válidas quanto inválidas, mas também — e este é o ponto não trivial — **revelaram um bug arquitetural de reatividade do React** que não foi detectado nem pelos testes unitários, nem pelos testes de componente com RTL. Trata-se do Bug #2 (detalhado na seção 10), evidência direta da hipótese 3.

### 4.5 CONTINUIDADE DAS FUNCIONALIDADES

Uma suíte de testes robusta permite modificar o código com confiança. Durante o PI III, o componente auxiliar `Campo` foi movido do interior do `ColaboradorForm` para o escopo do módulo (correção do Bug #2). Essa mudança afeta diretamente o form que já tinha 6 testes de componente passando. Após a correção, os 6 testes continuaram verdes, e os 4 cenários de E2E que originalmente falharam por conta do bug passaram a executar corretamente. A suíte evitou que a correção introduzisse qualquer regressão.

---

## 5. OBJETIVOS

### 5.1 Objetivo geral

Assegurar a qualidade e confiabilidade de um sistema de cadastro de colaboradores por meio da aplicação sistemática de testes de software (unitários, de componente, de integração e de sistema), garantindo o correto funcionamento de todas as funcionalidades, a integridade dos dados dos colaboradores e a conformidade com a Lei Geral de Proteção de Dados.

### 5.2 Objetivos específicos

- Identificar os requisitos funcionais e não funcionais do sistema de cadastro de colaboradores, com especial atenção a privacidade (LGPD) e a regras de negócio do domínio trabalhista brasileiro (idade mínima, data de admissão, formato de CPF).
- Implementar um sistema web completo com CRUD de colaboradores, publicado em domínio público.
- Desenvolver uma suíte de testes unitários para as funções de validação (CPF, CNPJ, datas), máscaras de entrada e o schema de validação do colaborador.
- Implementar testes de componente que simulem o usuário interagindo com o formulário e verifiquem o comportamento esperado (máscaras, mensagens de erro, submissão).
- Implementar testes de integração que validem a comunicação entre as Server Actions e o banco de dados PostgreSQL real.
- Implementar testes de sistema (ponta-a-ponta) com Playwright, cobrindo os fluxos críticos do usuário em navegador real.
- Avaliar a eficácia da suíte através da identificação, correção e documentação dos defeitos reais encontrados.
- Implantar o sistema na nuvem (Vercel) e submetê-lo a um teste beta por usuário real.
- Discutir, à luz das evidências, se as quatro hipóteses levantadas no PI II se confirmam.

---

## 6. REVISÃO TEÓRICA

### 6.1 Testes de software e TDD

Beck (2003) apresenta o *Test-Driven Development* (TDD): os testes são escritos antes do código de produção. A abordagem promove a qualidade do código ao garantir que todas as funcionalidades sejam testadas automaticamente e continuamente, e tem como efeito colateral a adoção de interfaces mais simples e desacopladas.

Fowler (2018) reforça a importância de refatorar o código para mantê-lo limpo e testável, tratando a escrita de testes unitários como parte essencial do processo de refatoração: sem rede de testes, alterações estruturais ficam inviáveis.

### 6.2 Testes unitários

Meszaros (2007), em *xUnit Test Patterns*, destaca a importância dos padrões de testes unitários e fornece diretrizes para escrevê-los de forma eficaz. Para ele, bons testes unitários são **rápidos, repetíveis, independentes** e **autovalidáveis**, propriedades hoje consolidadas sob o acrônimo FIRST (Fast, Independent, Repeatable, Self-validating, Timely) difundido por Martin (2008). Na prática do PI III, estes princípios foram respeitados: os 57 testes unitários rodam em aproximadamente 1,2 segundo, cada um deles independente de ordem.

### 6.3 Testes de integração

Pressman (2014) aborda os testes de integração como etapa crucial no ciclo de desenvolvimento, verificando se componentes desenvolvidos em isolamento se combinam corretamente. No contexto web contemporâneo, isso envolve testar o acoplamento entre camadas (UI, aplicação, persistência) por meio de instâncias reais de dependências, como feito aqui com um banco PostgreSQL de teste gerenciado pela Neon.

### 6.4 Testes de sistema

Myers et al. (2011) explicam que os testes de sistema visam validar o comportamento do sistema em seu ambiente de execução, simulando cenários de uso real para garantir que o sistema atenda às expectativas dos usuários. A prática atual de E2E com ferramentas como Playwright e Cypress materializou essa ideia: o navegador faz o papel do usuário final.

### 6.5 Engenharia de software e qualidade

Dixon (1991), em seu levantamento das melhores práticas de desenvolvimento de produto em empresas competitivas, elenca entre outros itens o "estabelecimento e contínuo refino das medidas de qualidade do produto, do desempenho do projeto e dos processos de manufatura". Embora o contexto original seja manufatura física, o princípio se aplica diretamente a software: no PI III, as medidas de qualidade são a quantidade de testes por camada, o tempo total da suíte, a cobertura de código e o registro de bugs.

### 6.6 Proteção de dados pessoais

A Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD) impõe requisitos sobre o tratamento de dados pessoais, incluindo coleta com consentimento informado, minimização de exposição e segurança da informação (BRASIL, 2018). O sistema desenvolvido incorpora esses princípios de três formas: (i) exibição de banner declarando o caráter demonstrativo do ambiente, (ii) checkbox obrigatório de consentimento no cadastro e (iii) mascaramento de CPF na listagem pública.

---

## 7. METODOLOGIA

A metodologia desta pesquisa combina elementos de **pesquisa bibliográfica**, **desenvolvimento prático** e **estudo de caso**, conforme proposto no PI II.

A **revisão bibliográfica** consultou a literatura clássica sobre testes de software (seção 6) e a documentação técnica das ferramentas selecionadas (Next.js, Prisma, Vitest, Playwright, Zod, React Hook Form).

O **desenvolvimento prático** utilizou a stack Next.js 16 + TypeScript (modo estrito) + Tailwind CSS para a interface, Prisma 6 como ORM, PostgreSQL gerenciado pela Neon como banco de dados, e Vercel como plataforma de implantação. O ciclo de desenvolvimento seguiu princípios do **Test-Driven Development** sempre que praticável: escrever o teste, verificar a falha, implementar o mínimo para passar, refatorar. Isso é visível no histórico de commits do repositório, nos quais testes aparecem lado a lado com a implementação.

O **estudo de caso** consistiu na aplicação da suíte de testes ao sistema desenvolvido. Foram elaborados testes em quatro camadas (unitária, componente, integração, sistema) e os defeitos reais detectados foram registrados em documento dedicado (`docs/registro-de-bugs.md`), posteriormente usado como evidência direta das hipóteses.

A **análise descritiva dos resultados** (seção 12) cruza os números produzidos pela execução da suíte (contagem de testes, cobertura, tempos) com os bugs documentados, discutindo em que medida cada hipótese do PI II se confirma.

O **fluxo de trabalho** adotado foi dividido em quatro fases:

1. **Fundação:** scaffold do projeto, configuração das ferramentas de teste, criação do schema Prisma, primeira migração, e um "smoke test" em cada camada.
2. **Lógica pura (TDD):** implementação e teste das funções puras de `src/lib/` e do schema Zod.
3. **Features de Colaborador:** Server Actions, queries de leitura, formulário, tabela de listagem, modal de confirmação, páginas de rota, com testes de componente e de integração.
4. **Sistema e implantação:** três cenários E2E com Playwright, deploy na Vercel, teste beta e produção das evidências para este relatório.

---

## 8. DESENVOLVIMENTO DO SISTEMA

### 8.1 Arquitetura e stack

O sistema é uma aplicação web construída com o App Router do Next.js 16, usando Server Actions como camada de mutação (criar, atualizar, excluir colaborador) e Server Components para a leitura de dados. O repositório segue a estrutura:

```
src/
  app/                       # rotas (page.tsx, novo/, [id]/editar/)
  components/                # UI reutilizável (Banner)
  features/colaboradores/
    actions.ts               # Server Actions
    queries.ts               # leitura
    schema.ts                # Zod (compartilhado cliente+servidor)
    components/              # ColaboradorForm, ColaboradorTable, ConfirmarExclusao
  lib/
    validators/cpf.ts        # isValidCpf
    validators/cnpj.ts       # isValidCnpj
    masks.ts                 # maskCpf, maskPhone, unmask, hideCpf
    dates.ts                 # parseBrDate, formatBrDate, idadeEm
    db.ts                    # singleton Prisma
prisma/
  schema.prisma              # modelos Empresa, Colaborador, enums
  seed.ts                    # dados iniciais
tests/e2e/                   # Playwright
```

A regra arquitetural central é: **a lógica pura de domínio (validação, máscara, datas) não pode depender de React, Next.js ou Prisma**. Esse isolamento é o que torna os testes unitários rápidos e desacoplados, sendo também evidência direta da hipótese 2 (código testável → modular).

As **Server Actions** sempre revalidam a entrada usando o mesmo schema Zod que o formulário consome no cliente. Elas devolvem um tipo discriminado `ActionResult<T> = {ok: true, data: T} | {ok: false, fieldErrors?: Record<string,string>; message?: string}`, nunca lançando exceções para erros de validação. Violações de unicidade do Prisma (código de erro P2002) são convertidas em `fieldErrors` no campo correto ("CPF já cadastrado", "E-mail já cadastrado"). Essa disciplina é o que permite que erros do servidor apareçam abaixo do campo correto no formulário — um comportamento essencial para a experiência do usuário.

### 8.2 Modelo de dados

Dois modelos, uma relação:

```prisma
model Empresa {
  id            String        @id @default(cuid())
  razaoSocial   String
  cnpj          String        @unique
  colaboradores Colaborador[]
  createdAt     DateTime      @default(now())
}

model Colaborador {
  id              String       @id @default(cuid())
  nome            String
  cpf             String       @unique
  email           String       @unique
  telefone        String?
  dataNascimento  DateTime
  dataAdmissao    DateTime
  cargo           String
  departamento    Departamento
  status          Status       @default(ATIVO)
  consentimentoEm DateTime
  empresaId       String
  empresa         Empresa      @relation(fields: [empresaId], references: [id])
  deletedAt       DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  @@index([nome])
}

enum Departamento { ADMINISTRATIVO FINANCEIRO RH TI COMERCIAL OPERACOES }
enum Status { ATIVO INATIVO }
```

- O `cpf` é armazenado como 11 dígitos sem máscara, para evitar inconsistências.
- O `deletedAt` implementa exclusão lógica (soft delete): registros excluídos não são removidos fisicamente, apenas marcados; a listagem filtra `deletedAt: null`.
- O `consentimentoEm` guarda o timestamp da marcação do checkbox LGPD.

### 8.3 Funcionalidades implementadas

**Cadastro de colaboradores** (criar, listar, editar, excluir logicamente):

- **Nome completo** (3–120 caracteres, obrigatório nome e sobrenome; espaços múltiplos são colapsados).
- **CPF** (validado pelos dígitos verificadores, único no sistema, máscara progressiva `000.000.000-00` durante a digitação).
- **E-mail** (validado, único).
- **Telefone** (opcional, máscara `(00) 00000-0000`).
- **Data de nascimento** (formato `dd/mm/aaaa`; o colaborador deve ter idade mínima de 16 anos exatos na data de hoje).
- **Data de admissão** (formato `dd/mm/aaaa`; não pode ser anterior à idade de 16 anos nem posterior a hoje + 30 dias).
- **Cargo** (texto livre).
- **Departamento** (enumeração: Administrativo, Financeiro, RH, TI, Comercial, Operações).
- **Empresa** (select vinculado às empresas cadastradas no seed).
- **Status** (Ativo / Inativo; padrão Ativo).
- **Consentimento LGPD** (checkbox obrigatório para submissão).

**Listagem**: busca por nome ou CPF (o termo é normalizado — pontuação do CPF é removida antes da consulta), filtro por departamento e status, paginação de 10 em 10 e exibição do CPF mascarado (`***.XXX.XXX-**`) para privacidade na listagem pública.

**Exclusão**: usa modal de confirmação com elemento `<dialog>` nativo (não `window.confirm`), executa exclusão lógica preservando os dados no banco.

**Erros**: mensagens de validação aparecem imediatamente abaixo de cada campo, com atributo `aria-describedby` ligando input e mensagem para acessibilidade.

### 8.4 Privacidade e LGPD

Três mecanismos implementam os princípios da LGPD no sistema:

1. **Banner permanente**: no topo de todas as páginas, com o texto "Ambiente de demonstração acadêmica — não insira dados reais".
2. **Checkbox obrigatório** com o texto "Declaro que o colaborador foi informado sobre o tratamento dos seus dados (LGPD)", cujo instante de marcação é armazenado em `consentimentoEm`.
3. **Mascaramento de CPF na listagem**: a função `hideCpf` transforma `11144477735` em `***.444.777-**`. O CPF completo só aparece na tela de edição de um colaborador individual, quando há propósito legítimo de acesso.

Adicionalmente, o código foi escrito com a regra de **nunca logar CPF ou e-mail** em console ou em mensagens de erro, para evitar vazamento indireto via arquivos de log do sistema.

---

## 9. SUÍTE DE TESTES

A suíte compõe-se de 84 testes distribuídos em quatro camadas, com tempo total de execução de aproximadamente 56 segundos (Vitest ~35 s, Playwright ~25 s em máquina local).

### 9.1 Testes unitários (57)

Cobrem as funções puras de `src/lib/` e o schema Zod do colaborador:

- **`isValidCpf`** (13 testes): CPFs válidos conhecidos (com e sem máscara); inválidos por dígito verificador; dígitos iguais (`111.111.111-11`); tamanho errado; letras; string vazia; valores não-string.
- **`isValidCnpj`** (10 testes): mesma estrutura, adaptada ao algoritmo de 14 dígitos.
- **Máscaras** (8 testes): `maskCpf` com entrada parcial (digitação progressiva), entrada com letras, colagem de valor já formatado; `maskPhone`; `unmask`; `hideCpf` com validação do formato de saída.
- **Datas** (9 testes): `parseBrDate` com casos limites (`31/02/2024` inválido, `29/02/2024` válido por ser bissexto, `29/02/2023` inválido); `idadeEm` nas datas exatas do aniversário e véspera; uso de `vi.setSystemTime` para determinismo.
- **Schema do colaborador** (17 testes): cada regra do design com pelo menos um caso válido e um inválido, incluindo normalizações (colapso de espaços no nome, remoção de máscara do CPF, downcase do e-mail), limite inferior exato de 16 anos de idade, limite superior da data de admissão (hoje + 30 dias) e obrigatoriedade do consentimento LGPD.

### 9.2 Testes de componente (6)

Verificam o `ColaboradorForm` com React Testing Library + user-event, rodando em DOM simulado (jsdom):

1. A máscara de CPF é aplicada caractere a caractere enquanto o usuário digita.
2. Submeter o formulário vazio mostra erros em todos os campos obrigatórios e **não** chama o callback de submissão.
3. CPF inválido mostra erro específico vinculado ao campo via `aria-describedby`.
4. Submissão válida chama o callback com valores normalizados (CPF e telefone em dígitos puros, sem máscara).
5. Quando o servidor devolve `fieldErrors: {cpf: "CPF já cadastrado"}`, a mensagem aparece abaixo do campo CPF.
6. Não marcar o checkbox LGPD impede a submissão.

### 9.3 Testes de integração (17)

Executam as Server Actions e as queries contra um banco PostgreSQL real, limpando dados antes de cada teste (helper `resetDb`):

- **`criarColaborador`** (4 casos): sucesso com retorno `{ok: true, data: {id}}` e registro persistido; input inválido retorna `{ok: false, fieldErrors}` sem lançar; CPF duplicado vira `fieldErrors.cpf`; e-mail duplicado vira `fieldErrors.email`.
- **`atualizarColaborador`** (3 casos): atualização de campo, conflito de unicidade em `update` (Review Focus do plano), e retorno de erro ao tentar atualizar id inexistente.
- **`excluirColaborador`** (1 caso): soft delete populando `deletedAt`.
- **`listarColaboradores`** (6 casos): paginação de 15 registros em 10 por página; não retorna registros com `deletedAt`; busca por nome parcial; busca por CPF com pontuação, exigindo normalização do termo (Review Focus); filtros por departamento e status.
- **`obterColaborador`** (2 casos): retorna `null` para id inexistente; não retorna soft-deleted.
- **`listarEmpresas`** (1 caso): retorno em ordem alfabética.

### 9.4 Testes de sistema (E2E, 4)

Três arquivos Playwright rodando o build de desenvolvimento do Next.js em `localhost:3000` com um banco de teste pré-populado:

1. **`fluxo-feliz.spec.ts`**: cadastrar colaborador novo, verificar presença na listagem, confirmar que o CPF aparece mascarado (`***.444.777-**`), editar o cargo, confirmar mudança, excluir via modal de confirmação, verificar que o colaborador sumiu.
2. **`validacao.spec.ts` (submit vazio)**: submeter formulário em branco, verificar que a URL não mudou e que mensagens de erro são exibidas nos campos obrigatórios (incluindo o checkbox LGPD).
3. **`validacao.spec.ts` (CPF inválido)**: preencher o formulário com CPF `11111111111` (formato correto, dígitos verificadores inválidos), submeter, verificar que o servidor rejeita e a mensagem "CPF inválido" aparece abaixo do campo.
4. **`cpf-duplicado.spec.ts`**: tentar cadastrar colaborador com CPF já existente no banco, verificar que a mensagem "CPF já cadastrado" aparece no campo CPF e que o formulário permanece na mesma URL.

### 9.5 Cobertura

A execução de `npm run test:coverage` com configuração de limiar mínimo de 80% para `src/lib/` e os schemas Zod resulta em:

| Arquivo | % Stmts | % Branch | % Funcs | % Lines |
|---|---:|---:|---:|---:|
| `features/colaboradores/schema.ts` | 100 | 100 | 100 | 100 |
| `lib/dates.ts` | 92 | 90,9 | 100 | 100 |
| `lib/db.ts` | 100 | 75 | 100 | 100 |
| `lib/masks.ts` | 100 | 100 | 100 | 100 |
| `lib/validators/cnpj.ts` | 95,65 | 83,33 | 100 | 100 |
| `lib/validators/cpf.ts` | 95,23 | 91,66 | 100 | 100 |
| **Média** | **96,55** | **92** | **100** | **100** |

---

## 10. REGISTRO DE BUGS ENCONTRADOS PELOS TESTES

Durante o desenvolvimento, três defeitos reais foram identificados. Dois deles foram capturados pelos próprios testes automatizados antes de qualquer impacto em produção; o terceiro foi detectado manualmente e, pela ausência de teste que o cobrisse, serve como contra-prova útil da hipótese 4.

| # | Data | Encontrado por | Defeito | Causa raiz | Correção |
|---|---|---|---|---|---|
| **1** | 2026-11-10 | **Teste unitário** (`isValidCnpj`) | CNPJ inserido como "válido conhecido" no seed falhava na verificação de dígitos verificadores. | Valor digitado manualmente sem cálculo de DV. | Substituído por CNPJ com DV calculado e validado pelo próprio `isValidCnpj`. |
| **2** | 2026-11-10 | **Testes de sistema** (três cenários E2E em Playwright) | Em qualquer fluxo com preenchimento do formulário, o campo Nome aparecia vazio no momento do submit — a mensagem "Nome é obrigatório" era exibida apesar do `.fill()` ter sido chamado explicitamente. Reprodução consistente em três cenários independentes. | O componente auxiliar `Campo` estava declarado **dentro** de `ColaboradorForm`, criando nova referência de função a cada render. React tratava como componente diferente e desmontava/remontava os `<input>` filhos a cada atualização de estado do React Hook Form, zerando os valores digitados. | Mover `Campo` e a constante `inputCls` para o escopo do módulo, acima da função `ColaboradorForm`. Testes de componente e E2E continuaram verdes após a correção. |
| **3** | 2026-11-11 | Verificação manual pós-deploy | A segunda execução de `npm run db:seed` falhava com `P2002` ao invés de ser idempotente. | Resíduo da correção do Bug #1: o `create.cnpj` da empresa Globex foi atualizado para o CNPJ correto, mas o `where.cnpj` do `upsert` continuou apontando para o CNPJ antigo. O `upsert` não encontrava, caía no `create` e colidia com o registro já existente. | Alinhar o `where.cnpj` ao `create.cnpj`. **Observação**: este bug não foi coberto porque o seed não tem teste de idempotência. Débito explícito registrado. |

Dos três defeitos, **dois foram capturados pela suíte automatizada** antes de produção. O Bug #3, único detectado em produção, só passou porque a função afetada (seed) não tinha teste cobrindo idempotência. A relação não foi acidental: ela é consistente com a hipótese 4 do PI II.

---

## 11. IMPLANTAÇÃO E TESTE BETA

O sistema foi implantado publicamente em:

> **https://pi3-colaboradores.vercel.app**

O **pipeline de build** executado pela Vercel aplica a sequência `prisma generate → prisma migrate deploy → next build`, garantindo que a versão de produção sempre utilize as migrações que passaram pelos testes de integração em desenvolvimento. As variáveis `DATABASE_URL` (conexão com pooler para runtime) e `DATABASE_URL_UNPOOLED` (conexão direta para migrações) são injetadas pela própria integração com a plataforma Neon.

O **repositório público** com o código, os testes, os commits em português e a documentação está em:

> **https://github.com/igorfiquene/pi3-colaboradores**

O **teste beta** foi conduzido com um usuário real (colaborador externo ao autor), que acessou o sistema pelo domínio público e realizou operações de cadastro, listagem e exclusão. O retorno do usuário é citado na seção de conclusão.

---

## 12. ANÁLISE DAS HIPÓTESES

### 12.1 H1 — Testes unitários identificam erros precocemente

**Confirmada.**

A **evidência direta** é o Bug #1: o teste unitário `isValidCnpj` rejeitou um CNPJ com dígitos verificadores inválidos que eu havia digitado manualmente no seed. Sem o teste, o valor incorreto seria enviado ao banco de produção e, embora a aplicação continuasse funcionando (porque a validação de CNPJ só é usada no futuro CRUD de empresa), o dado armazenado estaria errado e qualquer relatório que o cruzasse com fontes externas (ex.: Receita Federal) revelaria a inconsistência.

Como **evidência complementar**, a suíte conta com 57 testes unitários cobrindo todas as regras do schema de validação. Cada regra que aparece no formulário tem pelo menos um caso válido e um inválido no arquivo `schema.test.ts`. A taxa de cobertura de linhas em `src/lib/` e nos schemas Zod é de 100%.

### 12.2 H2 — Código testável promove design modular e coeso

**Confirmada.**

A **evidência direta** é arquitetural: a pasta `src/lib/` contém cinco módulos puros (`validators/cpf.ts`, `validators/cnpj.ts`, `masks.ts`, `dates.ts`, `db.ts`), nenhum deles importando React, Next.js ou Prisma. Essa disciplina só foi viável porque a decisão de escrever testes unitários rápidos pressionou o design a manter essa pasta isolada.

A segunda **evidência direta** é o schema Zod único (`src/features/colaboradores/schema.ts`), consumido tanto pelo formulário quanto pelas Server Actions. A existência desse módulo central evita o problema comum de divergência entre validação do cliente e do servidor — problema típico de projetos sem testes, nos quais as duas versões derivam ao longo do tempo.

Como **contra-prova interessante**, o Bug #2 ocorreu justamente porque eu *não* mantive essa disciplina em um ponto: declarei o componente auxiliar `Campo` dentro do `ColaboradorForm` em vez de no escopo do módulo. A suíte de E2E incomodou (os três cenários falharam) até que a arquitetura voltasse a ser coesa. Isso ilustra a hipótese pelo avesso: quando o design foge do princípio, os testes se tornam o mecanismo de pressão que o traz de volta.

### 12.3 H3 — Testes de integração garantem que componentes funcionem juntos

**Confirmada.**

A **evidência direta** é novamente o Bug #2. O bug só se manifesta na combinação React + RHF + DOM real. Os 57 testes unitários não o pegaram (não usam React). Os 6 testes de componente com React Testing Library também não (user-event opera diretamente no React controlado, em DOM simulado, e o remount não tem o mesmo efeito). **Apenas** os três cenários de E2E, rodando contra o navegador real, foram capazes de expor o problema. A inversão de valor é marcante: o teste mais caro e mais lento foi também o único que encontrou o defeito.

Como **evidência complementar** no eixo backend, os 17 testes de integração executam cada Server Action contra um banco PostgreSQL real da Neon, validando o caminho `input do formulário → schema Zod → Prisma → Postgres → read-back`. Isso cobre a hipótese 3 no eixo servidor.

### 12.4 H4 — Uma suíte robusta garante continuidade das funcionalidades

**Confirmada.**

A **evidência direta** é a correção do Bug #2: mover `Campo` para o escopo do módulo altera código que é usado por 6 testes de componente e pelos 4 E2E. Após a mudança, executei toda a suíte (`npm test && npm run test:e2e`) e os 84 testes continuaram verdes. A refatoração foi feita com confiança justamente porque a suíte existia.

A **contra-prova** mais interessante da hipótese 4 vem do Bug #3: o seed, por não ter teste de idempotência, regrediu silenciosamente quando a função foi alterada para corrigir o Bug #1. O resultado foi uma falha que só apareceu em produção, no momento em que tentei re-executar o seed. Essa falha é consistente com a hipótese: **funcionalidades não cobertas por testes são as mais propensas à regressão**.

---

## 13. CONCLUSÃO

O PI III colocou à prova as quatro hipóteses herdadas do PI II em condições reais de desenvolvimento, publicação e uso. Ao contrário do PI II, no qual as hipóteses foram defendidas com exemplos ilustrativos, o PI III apresenta uma suíte com 84 testes automatizados executáveis, uma cobertura de 96,55% em termos de *statements* na camada de lógica pura, um sistema publicado em domínio público em testes com usuário real, e três defeitos documentados — dois deles capturados pela própria suíte.

As quatro hipóteses se confirmam, mas com uma observação importante que só é possível fazer *depois* de ter construído o sistema: **cada tipo de teste captura uma classe diferente de defeito, e nenhuma camada substitui a outra**. O Bug #1 (CNPJ inválido no seed) foi pego pelo teste unitário e nenhum outro o teria revelado tão cedo. O Bug #2 (`Campo` interno gerando remount) foi pego apenas pelo E2E — nem o unitário, nem o de componente com RTL o detectaram, porque ele é uma interação entre React, DOM real e React Hook Form que só o navegador verdadeiro reproduz. O Bug #3 (seed não-idempotente) não foi pego por teste algum, e é exatamente por isso que se materializou em produção. A hierarquia das camadas de teste não é redundância — é **especialização**.

Isso valida a **hipótese 4** em uma forma mais específica do que o enunciado original: não basta ter muitos testes; é preciso ter **testes de cada camada**. A ausência de qualquer camada deixa uma classe inteira de bugs passar despercebida.

Do ponto de vista acadêmico, o trabalho atende integralmente ao que foi pedido no roteiro do PI III: o projeto desenvolvido no PI II foi efetivamente desenvolvido, testado em diferentes níveis, documentado, implantado publicamente, e testado por usuário real. Do ponto de vista profissional, o repositório público serve como amostra de trabalho e as evidências materiais (URL em produção, código em GitHub, suíte executável) podem ser reproduzidas e verificadas de forma independente.

O **retorno do usuário beta** confirmou os fluxos principais: o cadastro funcionou, a busca retornou resultados esperados, as mensagens de erro guiaram o preenchimento quando ele propositalmente preencheu dados inválidos, e o CPF aparece mascarado na listagem conforme esperado pelo requisito LGPD. Nenhum defeito adicional foi reportado pelo beta.

---

## 14. REFERÊNCIAS

BARTON, J. A.; LOVE, D. M.; TAYLOR, G. D. Design determines 70 % of cost? A review of implications for design evaluation. *Journal of Engineering Design*, v. 12, n. 1, p. 47–58, 2001.

BECK, K. *Test-Driven Development: By Example*. Boston: Addison-Wesley Professional, 2003.

BRASIL. *Lei nº 13.709, de 14 de agosto de 2018*. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília: Presidência da República, 2018. Disponível em: <http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>. Acesso em: 12 nov. 2026.

DIXON, J. R. New product development: a design engineering perspective. *Research in Engineering Design*, v. 3, p. 7–20, 1991.

DOWNEY, G. R. The parts of the Design Process. *Astronautics & Aeronautics*, v. 7, 1969.

FOWLER, M. *Refactoring: Improving the Design of Existing Code*. 2. ed. Boston: Addison-Wesley Professional, 2018.

HUTHWAITE, B.; SCHNEBERGER, K. A step-by-step guide to IPD. *Manufacturing Systems*, p. 32–38, out. 1992.

MARTIN, R. C. *Clean Code: A Handbook of Agile Software Craftsmanship*. Upper Saddle River: Prentice Hall, 2008.

MESZAROS, G. *xUnit Test Patterns: Refactoring Test Code*. Boston: Addison-Wesley Professional, 2007.

MYERS, G. J.; SANDLER, C.; BADGETT, T. *The Art of Software Testing*. 3. ed. Hoboken: John Wiley & Sons, 2011.

PRESSMAN, R. S. *Engenharia de Software: Uma Abordagem Profissional*. 8. ed. Porto Alegre: AMGH, 2014.

SMITH, P. G.; REINERTSEN, D. G. *Developing Products in Half the Time*. New York: Van Nostrand Reinhold, 1991.

---

## 15. ANEXOS

### Anexo A — Prints de evidência

Ver `docs/evidencias/PRINTS.md` e `docs/evidencias/prints/`.

- Print 01 — Aplicação publicada em `pi3-colaboradores.vercel.app/colaboradores`.
- Print 02 — Execução de `npm test` com `80 passed (80)` em 35 s.
- Print 03 — Relatório de cobertura com 96,55% de *statements* em `src/lib/` e schemas.
- Print 04 — Execução de `npm run test:e2e` com `4 passed (25 s)`.
- Print 05 — Relatório HTML do Playwright, visão de resumo (4 Passed, 0 Failed, 0 Flaky).
- Print 06 — Playwright detalhando os passos do teste `CPF duplicado: mensagem no campo`.

### Anexo B — Registro de bugs

Ver `docs/registro-de-bugs.md`.

### Anexo C — Resumo técnico de evidências

Ver `docs/evidencias/RESUMO.md` para a tabela completa de testes por tipo, tempos de execução e justificativa de cada escolha de stack.

### Anexo D — Design e plano de execução

- `docs/superpowers/specs/2026-11-10-pi3-colaboradores-design.md`
- `docs/superpowers/plans/2026-11-10-pi3-colaboradores.md`

### Anexo E — Reprodução local

```bash
git clone https://github.com/igorfiquene/pi3-colaboradores.git
cd pi3-colaboradores
nvm use 22
npm install --legacy-peer-deps
# Configurar .env.local com DATABASE_URL e DATABASE_URL_UNPOOLED da Neon
npm run db:migrate
npm run db:seed
npm run dev       # http://localhost:3000
# Suite completa:
npm test
npm run test:e2e
npm run test:coverage
```
