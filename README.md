# GymPass Fullstack

Aplicação full-stack inspirada no GymPass, desenvolvida com Next.js, Fastify e TypeScript, aplicando TDD, SOLID, arquitetura REST e integração contínua.

## Estrutura

- `apps/api`: API REST com Node.js, Fastify, Prisma e PostgreSQL.
- `apps/web`: interface web desenvolvida com Next.js.

## Funcionalidades

- Autenticação com JWT e renovação de sessão.
- Busca e gerenciamento de academias.
- Realização e validação de check-ins.
- Perfis de membro e administrador.
- Testes unitários e E2E.

## Executando a API

Entre em `apps/api`, copie `.env.example` para `.env`, instale as dependências e execute `npm run dev`.

## Executando o frontend

Entre em `apps/web`, copie `.env.example` para `.env.local`, instale as dependências e execute `npm run dev`.
