# Sistema de Cadastro de Colaboradores — Projeto Interdisciplinar III

**Autor:** Igor Fiquene Pessoa (RA 007747)
**Disciplina:** Projeto Interdisciplinar III — UniCEUMA, Sistemas de Informação
**Professor:** Edilson Lima
**Repositório:** https://github.com/igorfiquene/pi3-colaboradores
**App em produção:** https://pi3-colaboradores.vercel.app

Sistema web de cadastro de colaboradores desenvolvido como objeto de estudo do PI III, com foco na demonstração da importância dos testes de software (unitários, integração e sistema) na garantia de qualidade. Continuação direta do trabalho do PI II.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript strict
- **UI:** React + Tailwind CSS
- **Validação:** Zod (schemas compartilhados cliente+servidor)
- **Formulários:** React Hook Form
- **Banco:** PostgreSQL (Neon)
- **ORM:** Prisma 6
- **Back-end:** Server Actions
- **Testes:** Vitest + React Testing Library + Playwright
- **Deploy:** Vercel

## Funcionalidades

- CRUD de colaboradores (nome, CPF validado por DV, e-mail, telefone, datas, cargo, departamento, empresa, status).
- Listagem com busca por nome ou CPF, filtro por departamento e status, paginação.
- CPF mascarado na listagem (`***.XXX.XXX-**`) — LGPD.
- Checkbox obrigatório de consentimento LGPD no cadastro.
- Banner fixo "Ambiente de demonstração acadêmica".
- Exclusão lógica (soft delete) com modal de confirmação.
- Empresas semeadas (ACME, Globex) — sem UI de CRUD nesta versão.

## Rodando localmente

```bash
# Node 22+
nvm use 22

# Deps
npm install --legacy-peer-deps

# Banco (requer conta Neon)
neon login
neon link --org-id <org> --project-id <proj>

# Migração + seed
npm run db:migrate
npm run db:seed

# Dev
npm run dev
```

## Suíte de testes

| Comando | O que roda |
|---|---|
| `npm test` | Todos os testes Vitest (unit + integração + componentes) |
| `npm run test:unit` | Lógica pura (`src/lib/`, schemas Zod) |
| `npm run test:integration` | Actions + queries contra o banco de teste |
| `npm run test:components` | `ColaboradorForm` (RTL + user-event) |
| `npm run test:e2e` | 4 cenários Playwright contra `npm run dev` |
| `npm run test:coverage` | Cobertura HTML + threshold 80% em `src/lib/` |

### Contagem atual

| Camada | Testes |
|---|---|
| Unitários | 57 |
| Componente | 6 |
| Integração | 17 |
| E2E | 4 |
| **Total** | **84** |

### Bugs encontrados pelos testes

Ver [`docs/registro-de-bugs.md`](docs/registro-de-bugs.md).

## Documentação

- **Design:** [`docs/superpowers/specs/2026-11-10-pi3-colaboradores-design.md`](docs/superpowers/specs/2026-11-10-pi3-colaboradores-design.md)
- **Plano de execução:** [`docs/superpowers/plans/2026-11-10-pi3-colaboradores.md`](docs/superpowers/plans/2026-11-10-pi3-colaboradores.md)
- **Registro de bugs:** [`docs/registro-de-bugs.md`](docs/registro-de-bugs.md)
- **Resumo para o relatório:** [`docs/evidencias/RESUMO.md`](docs/evidencias/RESUMO.md) _(gerado no final)_

## Deploy

**URL de produção:** https://pi3-colaboradores.vercel.app

Env vars na Vercel:
- `DATABASE_URL` — pooler (Neon)
- `DATABASE_URL_UNPOOLED` — direct connection (Neon, para migrações)

Build command: `prisma generate && prisma migrate deploy && next build`

## Licença

Trabalho acadêmico — uso livre para fins educacionais.
