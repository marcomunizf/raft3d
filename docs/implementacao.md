# Implementação — Resina Raft ERP

> Documento vivo. Atualizar sempre que uma feature for entregue ou alterada.
> Versão: 0.4 | Última atualização: 2026-03-11

---

## 1. Visão Geral do Sistema

Sistema ERP para empresa de impressão 3D em resina, composto por:

| Camada | Tecnologia | Status |
|---|---|---|
| Landing page pública | HTML/CSS ou React | Pendente |
| Painel administrativo (frontend) | React | Pendente |
| API backend | Node.js + Express | ✅ Completo |
| Banco de dados | PostgreSQL | ✅ Completo |

---

## 2. Status por Módulo (Backend)

### 2.1 Autenticação

| Feature | Status |
|---|---|
| Login com usuário/senha | ✅ Implementado |
| JWT com expiração (8h) | ✅ Implementado |
| Verificação de senha com bcrypt | ✅ Implementado |
| Rate limiting (20 req/15min no login) | ✅ Implementado |
| Confirm password (cancelar venda) | ✅ Implementado |
| Refresh token | Pendente |
| Logout / blacklist de token | Pendente |

**Credenciais padrão (após `npm run hash-passwords`):**
- Admin: `admin` / `admin`
- Funcionário de teste: `luca` / `123`

---

### 2.2 Usuários (CRUD)

| Feature | Status |
|---|---|
| Listar usuários | ✅ Implementado |
| Criar usuário | ✅ Implementado |
| Detalhe do usuário | ✅ Implementado |
| Atualizar usuário (nome, email, role) | ✅ Implementado |
| Alterar senha (própria com confirmação / ADMIN qualquer) | ✅ Implementado |
| Inativar usuário | ✅ Implementado |

> ADMIN cria/edita/inativa qualquer usuário. FUNCIONARIO só altera a própria senha (confirmando senha atual).

---

### 2.3 Dashboard

| Feature | Status |
|---|---|
| KPIs mensais (total, count, ticket, pendentes, baixo estoque, em produção) | ✅ Implementado |
| Série temporal de vendas (por dia ou semana) | ✅ Implementado |
| Kanban (cards por status) | ✅ Implementado |

---

### 2.4 Vendas

| Feature | Status |
|---|---|
| Listar com filtros (período, status, cliente) | ✅ Implementado |
| Criar venda com itens | ✅ Implementado |
| Detalhe da venda | ✅ Implementado |
| Atualizar venda e itens | ✅ Implementado |
| Atualizar status / status pagamento | ✅ Implementado |
| Cancelar venda (requer confirmação de senha) | ✅ Implementado |
| Audit log (create, update, cancel) | ✅ Implementado |
| RBAC: apenas ADMIN cria/edita/cancela | ✅ Implementado |
| RBAC: ADMIN e FUNCIONARIO atualizam status | ✅ Implementado |

---

### 2.5 Pagamentos

| Feature | Status |
|---|---|
| Listar pagamentos da venda | ✅ Implementado |
| Registrar pagamento | ✅ Implementado |
| Recalcular `payment_status` automaticamente | ✅ Implementado |
| Audit log de pagamento | ✅ Implementado |

---

### 2.6 Clientes

| Feature | Status |
|---|---|
| Listar com busca (nome/telefone) e filtro is_active | ✅ Implementado |
| Detalhe do cliente | ✅ Implementado |
| Criar cliente (PF/PJ) | ✅ Implementado |
| Atualizar cliente | ✅ Implementado |
| Inativar cliente | ✅ Implementado |
| Vendas do cliente | ✅ Implementado |
| Audit log (create, update, deactivate) | ✅ Implementado |
| RBAC: apenas ADMIN cria/edita/inativa | ✅ Implementado |

---

### 2.7 Estoque — Itens

| Feature | Status |
|---|---|
| Listar itens (filtro por categoria) | ✅ Implementado |
| Detalhe do item | ✅ Implementado |
| Criar item | ✅ Implementado |
| Atualizar item | ✅ Implementado |
| Inativar item | ✅ Implementado |
| Audit log (create, update, deactivate) | ✅ Implementado |
| RBAC: apenas ADMIN cria/edita/inativa | ✅ Implementado |

---

### 2.8 Estoque — Movimentações

| Feature | Status |
|---|---|
| Listar movimentações (filtros: item, tipo, período) | ✅ Implementado |
| Registrar movimentação (IN, OUT, ADJUST, LOSS) | ✅ Implementado |
| Atualizar `current_qty` do item | ✅ Implementado |
| Audit log de movimentação | ✅ Implementado |
| RBAC: apenas ADMIN registra movimentação | ✅ Implementado |

---

### 2.9 Configurações

| Feature | Status |
|---|---|
| Buscar configurações | ✅ Implementado (persiste no DB) |
| Salvar configurações | ✅ Implementado (persiste no DB) |
| RBAC: apenas ADMIN atualiza | ✅ Implementado |

Campos: `company_name`, `whatsapp_link`, `default_sale_status`, `payment_methods`.

---

### 2.10 Segurança

| Mecanismo | Status |
|---|---|
| Senhas hasheadas com bcrypt (rounds=12) | ✅ Implementado |
| JWT com expiração de 8h | ✅ Implementado |
| `JWT_SECRET` obrigatório em produção | ✅ Implementado |
| CORS configurável via `CORS_ORIGIN` | ✅ Implementado |
| Rate limit no login (20 req/15min) | ✅ Implementado |
| RBAC via middleware `requireRole()` | ✅ Implementado |
| Helmet (headers HTTP de segurança) | ✅ Implementado |
| HTTPS | Configurar no servidor/proxy (nginx) |

---

### 2.11 Auditoria

| Feature | Status |
|---|---|
| Tabela `audit_logs` no banco | ✅ Implementado |
| Utilitário `utils/audit.js` | ✅ Implementado |
| Audit em vendas (create, update, cancel) | ✅ Implementado |
| Audit em pagamentos (create) | ✅ Implementado |
| Audit em clientes (create, update, deactivate) | ✅ Implementado |
| Audit em estoque — itens (create, update, deactivate) | ✅ Implementado |
| Audit em estoque — movimentações (create) | ✅ Implementado |
| Audit em usuários (create, update, deactivate) | ✅ Implementado |
| Rota de consulta de logs | Pendente |

---

## 3. RBAC — Tabela de Permissões

| Rota | Público | FUNCIONARIO | ADMIN |
|---|:---:|:---:|:---:|
| `POST /api/auth/login` | ✅ | — | — |
| `POST /api/auth/confirm-password` | — | ✅ | ✅ |
| `GET /api/dashboard/*` | — | ✅ | ✅ |
| `GET /api/sales` | — | ✅ | ✅ |
| `POST /api/sales` | — | — | ✅ |
| `GET /api/sales/:id` | — | ✅ | ✅ |
| `PUT /api/sales/:id` | — | — | ✅ |
| `PATCH /api/sales/:id/status` | — | ✅ | ✅ |
| `POST /api/sales/:id/cancel` | — | — | ✅ |
| `GET /api/sales/:id/payments` | — | ✅ | ✅ |
| `POST /api/sales/:id/payments` | — | — | ✅ |
| `GET /api/customers` | — | ✅ | ✅ |
| `GET /api/customers/:id` | — | ✅ | ✅ |
| `POST /api/customers` | — | — | ✅ |
| `PUT /api/customers/:id` | — | — | ✅ |
| `PATCH /api/customers/:id/deactivate` | — | — | ✅ |
| `GET /api/inventory/items` | — | ✅ | ✅ |
| `POST /api/inventory/items` | — | — | ✅ |
| `PUT /api/inventory/items/:id` | — | — | ✅ |
| `PATCH /api/inventory/items/:id/deactivate` | — | — | ✅ |
| `GET /api/inventory/movements` | — | ✅ | ✅ |
| `POST /api/inventory/movements` | — | — | ✅ |
| `GET /api/settings` | — | ✅ | ✅ |
| `PUT /api/settings` | — | — | ✅ |
| `GET /api/users` | — | — | ✅ |
| `POST /api/users` | — | — | ✅ |
| `GET /api/users/:id` | — | — | ✅ |
| `PUT /api/users/:id` | — | — | ✅ |
| `PATCH /api/users/:id/password` | — | ✅ (própria) | ✅ |
| `PATCH /api/users/:id/deactivate` | — | — | ✅ |

---

## 4. Banco de Dados

### 4.1 Migrações

| Arquivo | Conteúdo |
|---|---|
| `001_init.sql` | users, customers, sales, sale_items, payments, inventory_items, inventory_movements, audit_logs |
| `002_funcionario.sql` | `delivered_at` em sales; seed usuário `luca` |
| `003_inventory_brand.sql` | Complemento de estoque |
| `004_sales_payment_method.sql` | `payment_method` em sales |
| `005_settings_and_security.sql` | Tabela `settings` com valores padrão |

### 4.2 Convenções

- Banco: **PostgreSQL**
- IDs: `UUID v4` com `gen_random_uuid()`
- Timestamps: `TIMESTAMPTZ`
- Nomes em `snake_case`
- Soft delete via `is_active` — nenhuma entidade é deletada fisicamente

---

## 5. Variáveis de Ambiente

| Variável | Obrigatória em produção | Padrão (dev) |
|---|:---:|---|
| `DATABASE_URL` | ✅ | — |
| `JWT_SECRET` | ✅ | `dev_secret_change_me_in_production` |
| `PORT` | — | `3000` |
| `JWT_EXPIRES_IN` | — | `8h` |
| `CORS_ORIGIN` | — | `*` |
| `NODE_ENV` | — | `development` |

---

## 6. Scripts disponíveis

```bash
npm start              # Inicia em produção
npm run dev            # Inicia com auto-reload (node --watch)
npm run migrate:up     # Roda migrações pendentes
npm run migrate:down   # Reverte a última migração
npm run hash-passwords # Converte senhas plain-text para bcrypt (executar uma vez após migration 005)
```

---

## 7. Próximos Passos

### 7.1 Backend — pendente

- [ ] Rota de consulta de audit logs (`GET /api/audit-logs`)
- [ ] Refresh token
- [ ] Relatório PDF de venda

### 7.2 Frontend — Landing page

Baseada em raft3d.com.br:
- [ ] Menu fixo no topo com âncoras: Quem somos, Serviços, Orçamentos, Localização
- [ ] Paleta de cores: **verde** para FDM, **roxo** para Resina
- [ ] Botão flutuante WhatsApp (link configurável via `settings.whatsapp_link`)
- [ ] CTA de orçamento → abre WhatsApp
- [ ] Ícone de engrenagem (canto superior direito) → `/login`
- [ ] Seção de mapa com botão "Como chegar"

### 7.3 Frontend — Painel administrativo

**Telas ADMIN:**
- [ ] Login (usuário + senha)
- [ ] Dashboard com KPIs, gráfico e kanban
- [ ] Modal Vendas — lista, filtros, criar/editar, cancelar, pagamentos
- [ ] Modal Clientes — lista com busca, criar/editar, inativar
- [ ] Modal Estoque — itens e movimentações
- [ ] Modal Configurações — dados da empresa e formas de pagamento
- [ ] Menu → Usuários (criar, editar, inativar) + Alterar senha

**Telas FUNCIONARIO:**
- [ ] Dashboard (kanban + KPIs básicos)
- [ ] Vendas (somente leitura + atualização de status)
- [ ] Clientes (somente leitura)
- [ ] Estoque (somente leitura)
- [ ] Menu → Alterar senha

### 7.4 Kanban — estados e regras

| Estado (DB) | Label no kanban |
|---|---|
| `BUDGET` | Orçamento |
| `APPROVED` | A Produzir |
| `IN_PRODUCTION` | Produzindo |
| `DONE` | Pronto |
| `DELIVERED` | Entregue |

> Cards `DELIVERED` ficam visíveis por 7 dias e somem automaticamente (backend: `GET /api/dashboard/kanban`).

---

## 8. Estrutura de Arquivos (Backend)

```
backend/
├── migrations/
│   ├── 001_init.sql
│   ├── 002_funcionario.sql
│   ├── 003_inventory_brand.sql
│   ├── 004_sales_payment_method.sql
│   └── 005_settings_and_security.sql
├── scripts/
│   └── hash-passwords.js
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customers.controller.js       ← audit log
│   │   ├── dashboard.controller.js
│   │   ├── inventory-items.controller.js ← audit log
│   │   ├── inventory-movements.controller.js ← audit log + userId
│   │   ├── sales.controller.js           ← audit log
│   │   ├── settings.controller.js
│   │   └── users.controller.js           ← NOVO
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error-handler.middleware.js
│   │   └── rbac.middleware.js
│   ├── repositories/
│   │   ├── customers.repository.js
│   │   ├── dashboard.repository.js
│   │   ├── inventory-items.repository.js
│   │   ├── inventory-movements.repository.js
│   │   ├── sales.repository.js
│   │   ├── settings.repository.js
│   │   └── users.repository.js           ← list, create, update, updatePassword, deactivate
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customers.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── health.routes.js
│   │   ├── inventory-items.routes.js
│   │   ├── inventory-movements.routes.js ← RBAC adicionado
│   │   ├── sales.routes.js
│   │   ├── settings.routes.js
│   │   └── users.routes.js               ← NOVO
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── customers.service.js
│   │   ├── dashboard.service.js
│   │   ├── inventory-items.service.js
│   │   ├── inventory-movements.service.js ← userId autenticado
│   │   ├── sales.service.js
│   │   ├── settings.service.js
│   │   └── users.service.js              ← NOVO
│   └── utils/
│       ├── audit.js
│       ├── jwt.js
│       └── validation.js
└── package.json
```

---

## 9. Setup inicial (do zero)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, PORT

# 3. Rodar migrações
npm run migrate:up

# 4. Converter senhas para bcrypt (executar uma única vez)
npm run hash-passwords

# 5. Iniciar em desenvolvimento
npm run dev
```
