# PI III — Resumo de Evidências para o Relatório Acadêmico

**Autor:** Igor Fiquene Pessoa (RA 007747)
**Disciplina:** Projeto Interdisciplinar III — UniCEUMA
**Período:** 2026-11-10 → 2026-11-13
**URL de produção:** https://pi3-colaboradores.vercel.app

---

## 1. Stack e justificativa

| Camada | Tecnologia | Justificativa curta |
|---|---|---|
| Framework | Next.js 16 (App Router, TS strict) | Server Actions permitem revalidar com o **mesmo** schema Zod no cliente e no servidor — fonte única da verdade exigida pela hipótese 2 (código modular) |
| Validação | Zod | Schema é objeto importável; o mesmo módulo é testado isoladamente e consumido por form + action |
| Formulário | React Hook Form | Minimiza re-renders e expõe `fieldErrors` por campo — necessário para mapear erros do servidor (ex.: CPF duplicado) de volta pros inputs |
| ORM | Prisma 6 | `P2002` tipado permite tratar unicidade como erro de campo sem try/catch espalhado |
| Banco | PostgreSQL (Neon) | Branch por ambiente, free tier, direct URL separada pra migrações — adequado pra testes de integração contra banco real |
| Testes unit/integração | Vitest + RTL + user-event + jsdom | Vitest tem o mesmo API do Jest + nativo pra TS/ESM |
| Testes de sistema | Playwright | 3 cenários cobrem exatamente o que `fireEvent`/RTL não cobre (navegação, URL, modal nativo `<dialog>`) |
| Deploy | Vercel | Build chain inclui `prisma migrate deploy` — garante que prod sempre usa a mesma migração testada em dev |

## 2. Testes por tipo e tempo de execução

| Tipo | Arquivos | Testes | Tempo (local, última execução) |
|---|---:|---:|---|
| Unitário | `src/lib/validators/cpf.test.ts`, `cnpj.test.ts`, `src/lib/masks.test.ts`, `src/lib/dates.test.ts`, `src/features/colaboradores/schema.test.ts` | 57 | ~1,2 s |
| Componente (RTL) | `src/features/colaboradores/components/ColaboradorForm.test.tsx` | 6 | ~1,9 s |
| Integração (banco real) | `src/features/colaboradores/actions.test.ts`, `queries.test.ts` | 17 | ~29 s |
| Sistema (E2E, Playwright) | `tests/e2e/fluxo-feliz.spec.ts`, `validacao.spec.ts`, `cpf-duplicado.spec.ts` | 4 | ~24 s |
| **Total** | **9 arquivos** | **84** | **~56 s** |

Comando para reproduzir: `npm test && npm run test:e2e`.

## 3. Cobertura por pasta

Via `npm run test:coverage` (threshold 80%).

| Pasta/arquivo | % Statements | % Branches | % Functions | % Lines |
|---|---:|---:|---:|---:|
| `src/lib/validators/cpf.ts` | 95,23 | 91,66 | 100 | 100 |
| `src/lib/validators/cnpj.ts` | 95,65 | 83,33 | 100 | 100 |
| `src/lib/masks.ts` | 100 | 100 | 100 | 100 |
| `src/lib/dates.ts` | 92 | 90,9 | 100 | 100 |
| `src/lib/db.ts` | 100 | 75 | 100 | 100 |
| `src/features/colaboradores/schema.ts` | 100 | 100 | 100 | 100 |
| **Média (`src/lib/` + schemas)** | **96,55** | **92** | **100** | **100** |

## 4. Registro de bugs — resumo agrupado

Registro completo em [`docs/registro-de-bugs.md`](../registro-de-bugs.md).

| Tipo de teste que encontrou | Quantidade | IDs |
|---|---:|---|
| Unitário | 1 | #1 (CNPJ inválido no seed, pego pelo `isValidCnpj`) |
| Integração | 0 | — |
| Sistema (E2E) | 1 | #2 (componente auxiliar `Campo` declarado dentro do form causando remount de inputs — só aparecia ao preencher o form via navegador real) |
| Manual (pós-deploy) | 1 | #3 (seed não-idempotente por inconsistência `where`/`create` de CNPJ — débito documentado: faltava teste de idempotência do seed) |

Dos 3 defeitos encontrados durante o desenvolvimento, **2 foram pegos por testes automatizados antes do deploy**. O #3 só não foi coberto porque a suíte não tinha teste para o `seed.ts` — a lição ficou registrada.

## 5. Relação com as hipóteses do PI II

> *Hipóteses do PI II (2024-06-03):*
> 1. Testes unitários identificam erros precocemente.
> 2. Código testável promove design modular e coeso.
> 3. Testes de integração garantem que componentes funcionem juntos.
> 4. Uma suíte robusta garante continuidade das funcionalidades (regressão).

### Hipótese 1 — **CONFIRMADA**

**Evidência direta:** `src/lib/validators/cnpj.test.ts` rejeitou o CNPJ `45283163000134` como "válido conhecido" antes que a lista de colaboradores ficasse vinculada à empresa inexistente. Documentado como bug #1 em `docs/registro-de-bugs.md`. Correção no commit `feat: lógica pura com TDD (validators, masks, dates, schema)`.

**Evidência complementar:** 57 testes unitários cobrem todas as regras do form (CPF, CNPJ, idade ≥ 16, bissexto, máscaras) com casos positivos e negativos. Ver `src/features/colaboradores/schema.test.ts` — cada regra do design tem um `it(...)` dedicado.

### Hipótese 2 — **CONFIRMADA**

**Evidência direta — modularidade:** a pasta `src/lib/` contém 5 módulos puros (`validators/cpf.ts`, `validators/cnpj.ts`, `masks.ts`, `dates.ts`, `db.ts`) **sem dependência de React, Next.js ou Prisma**. Todos são testáveis isoladamente, com cobertura média de 96,55% statements.

**Evidência direta — coesão:** o schema Zod em `src/features/colaboradores/schema.ts` é a **única** fonte de regras de validação, consumida tanto pelo formulário (`ColaboradorForm.tsx`) quanto pelas Server Actions (`actions.ts`). Isso evita divergências entre validação client-side e server-side — um padrão típico que gera bugs em projetos não-testados.

**Evidência negativa relevante (bug #2):** justamente por eu NÃO ter mantido coesão no `ColaboradorForm.tsx` (declarei `Campo` dentro do componente), a suíte E2E expôs o problema. Isso ilustra o enunciado da hipótese pelo avesso: quando o design foge do princípio, os testes incomodam.

### Hipótese 3 — **CONFIRMADA**

**Evidência direta:** o bug #2 (`Campo` interno causando remount) **só foi detectado pelos testes E2E**, não pelos unitários nem pelos testes de componente com RTL. A razão: `@testing-library/user-event` opera direto nos eventos do React controlado; o navegador real (Playwright) força o caminho DOM→React→DOM, que é onde o remount quebra a persistência de valor. Os 3 cenários de E2E falharam em preencher o campo nome, levando à investigação do componente — ver bug #2.

**Evidência complementar:** os 17 testes de integração em `actions.test.ts` + `queries.test.ts` validam o caminho `form input → schema Zod → Prisma → Postgres → read-back` contra uma instância real do Neon. Isso cobre a hipótese no eixo backend (form ↔ validação ↔ banco).

### Hipótese 4 — **CONFIRMADA**

**Evidência direta:** durante a Task 4, o componente `Campo` foi movido pra fora de `ColaboradorForm` (correção do bug #2). Essa mudança afeta diretamente o form que já tinha 6 testes de componente passando. Após a correção, **todos os 6 continuaram verdes** (`npm run test:components`). Depois disso, **todos os 84 testes da suíte** (`npm test && npm run test:e2e`) ficaram verdes. A suíte evitou que a correção introduzisse regressão em algum caso sutil.

**Evidência negativa relevante (bug #3):** o seed foi alterado duas vezes (correção do bug #1 e deploy em produção) sem teste de idempotência. A segunda alteração introduziu o bug #3. **Isso ilustra o contra-positivo da hipótese 4**: funcionalidades sem teste são propensas à regressão. O débito ficou registrado explicitamente.

---

## 6. Como reproduzir as evidências (para os prints)

| O que mostrar | Comando / lugar |
|---|---|
| Suíte de testes verdes | Terminal: `npm test` (deve mostrar `8 passed (8)` / `80 passed (80)`) |
| E2E verdes com HTML report | Terminal: `npm run test:e2e` e depois abrir `playwright-report/index.html` |
| Cobertura ≥ 80% em `src/lib/` | Terminal: `npm run test:coverage` (deve mostrar `96,55%` statements) |
| Deploy funcionando | Browser: https://pi3-colaboradores.vercel.app/colaboradores |
| CPF mascarado na listagem (LGPD) | Mesma página acima, coluna CPF mostra `***.XXX.XXX-**` |
| Banner de ambiente de demonstração | Topo de qualquer página |
| Registro de bugs | `docs/registro-de-bugs.md` |
| Commits em pt-BR | `git log --oneline` |

## 7. Dados do beta

Beta user: 1 pessoa (amigo do autor).
URL compartilhada: https://pi3-colaboradores.vercel.app
Feedback será anexado ao final deste documento depois do uso real.
