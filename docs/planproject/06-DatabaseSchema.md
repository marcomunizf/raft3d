# 06 - Database Schema - Plataforma de Impressao 3D em Resina (MVP)

## Visao Geral
Banco de dados relacional (PostgreSQL) para plataforma administrativa.

- Todas as tabelas usam UUID como chave primaria.
- Nomes em snake_case.

---

## Tabelas principais
- users
- customers
- sales
- sale_items
- payments
- inventory_items
- inventory_movements
- audit_logs (opcional)

---

## users

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| name | TEXT | Nome do usuario |
| email | TEXT | Email unico |
| password_hash | TEXT | Senha criptografada |
| role | TEXT | ADMIN |
| is_active | BOOLEAN | Usuario ativo |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## customers

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| type | TEXT | PF ou PJ |
| name | TEXT | Nome ou razao social |
| document | TEXT | CPF/CNPJ (opcional, unico) |
| phone | TEXT | Telefone/WhatsApp |
| email | TEXT | Email (opcional) |
| notes | TEXT | Observacoes |
| is_active | BOOLEAN | Cliente ativo |
| created_at | TIMESTAMPTZ | Data de cadastro |

---

## sales

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| customer_id | UUID | FK customers.id (opcional) |
| customer_name_snapshot | TEXT | Nome no momento da venda |
| status | TEXT | BUDGET, APPROVED, IN_PRODUCTION, DONE, DELIVERED, CANCELLED |
| sale_date | DATE | Data da venda |
| due_date | DATE | Previsao de entrega |
| subtotal | NUMERIC(12,2) | Valor bruto |
| discount_total | NUMERIC(12,2) | Desconto total |
| total | NUMERIC(12,2) | Valor final |
| payment_status | TEXT | PENDING, PARTIAL, PAID, REFUNDED |
| notes | TEXT | Observacoes |
| created_by_user_id | UUID | FK users.id |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## sale_items

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| sale_id | UUID | FK sales.id (ON DELETE CASCADE) |
| description | TEXT | Descricao do item |
| qty | NUMERIC(12,3) | Quantidade |
| unit_price | NUMERIC(12,2) | Preco unitario |
| line_total | NUMERIC(12,2) | Total do item |

---

## payments

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| sale_id | UUID | FK sales.id (ON DELETE CASCADE) |
| method | TEXT | PIX, CARD, CASH |
| amount | NUMERIC(12,2) | Valor pago |
| paid_at | TIMESTAMPTZ | Data do pagamento |
| notes | TEXT | Observacoes |
| created_by_user_id | UUID | FK users.id |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## inventory_items

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| name | TEXT | Nome do item |
| category | TEXT | RAW_MATERIAL ou CONSUMABLE |
| unit | TEXT | ML, L, G, UNIT |
| min_qty | NUMERIC(12,3) | Estoque minimo |
| current_qty | NUMERIC(12,3) | Quantidade atual |
| unit_cost | NUMERIC(12,2) | Custo unitario (opcional) |
| is_active | BOOLEAN | Item ativo |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## inventory_movements

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| item_id | UUID | FK inventory_items.id |
| type | TEXT | IN, OUT, ADJUST, LOSS |
| qty | NUMERIC(12,3) | Quantidade movimentada |
| movement_date | TIMESTAMPTZ | Data da movimentacao |
| reason | TEXT | Motivo |
| sale_id | UUID | FK sales.id (opcional) |
| created_by_user_id | UUID | FK users.id |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## audit_logs (opcional)

| Campo | Tipo | Descricao |
|------|------|----------|
| id | UUID | PK |
| user_id | UUID | FK users.id |
| entity | TEXT | Entidade afetada |
| entity_id | UUID | ID da entidade |
| action | TEXT | CREATE, UPDATE, DELETE |
| data | JSONB | Dados alterados |
| created_at | TIMESTAMPTZ | Data do evento |

---

## Relacionamentos (resumo)
- sales.customer_id -> customers.id (opcional)
- sales.created_by_user_id -> users.id
- sale_items.sale_id -> sales.id (ON DELETE CASCADE)
- payments.sale_id -> sales.id (ON DELETE CASCADE)
- payments.created_by_user_id -> users.id
- inventory_movements.item_id -> inventory_items.id
- inventory_movements.sale_id -> sales.id (opcional)
- inventory_movements.created_by_user_id -> users.id
- audit_logs.user_id -> users.id
