# 04 - Tech Stack do Projeto

Este documento descreve as tecnologias adotadas para implementar o MVP.

---

## Principios de escolha
- Simplicidade para entrega do MVP.
- Tecnologias maduras e bem suportadas.
- Manutencao simples e previsivel.

---

## Front-end
- Framework: React
- Linguagem: JavaScript
- Cliente HTTP: Axios
- Estilizacao: CSS (CSS Modules quando necessario)
- Build/dev: Vite

---

## Back-end
- Plataforma: Node.js
- Framework HTTP: Express
- Linguagem: JavaScript
- Formato de comunicacao: JSON sobre HTTP
- Autenticacao: JWT (Bearer Token)
- Validacao de dados: Joi
- Arquitetura interna: camadas (routes/controllers/services/repositories)

---

## Banco de Dados
- Banco relacional: PostgreSQL
- Acesso ao banco: node-postgres (pg)
- Migracoes: node-pg-migrate
- Chaves primarias: UUID
- Padrao de nomes: snake_case

---

## Infraestrutura
- Containerizacao: Docker
- Orquestracao local: Docker Compose
- Configuracao por variaveis de ambiente (.env)

---

## Qualidade e Ferramentas de Suporte
- Lint: ESLint
- Formatacao: Prettier
- Logs: morgan (ou equivalente)
- Tratamento de erros: middleware global

---

## Testes
- Testes de aceitacao: baseados nos CTAs da SPEC
- Testes automatizados: unitarios para services

---

## Integracoes externas
- WhatsApp via link/CTA (sem API no MVP)

---

## Relacao com outros documentos
- `03-Architecture.md`: estrutura e responsabilidades
- `02-00-SpecFirst.md`: comportamento esperado do sistema
- `05-APIRoutes.md`: contrato HTTP
- `06-DatabaseSchema.md`: estrutura do banco
