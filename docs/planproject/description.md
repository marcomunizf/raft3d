# 🧩 MVP — Plataforma de Impressão 3D em Resina

## Visão Geral do MVP
A plataforma é composta por:
- **Landing page pública**
- **Plataforma administrativa (restrita a admins)**

Após login, o administrador **entra diretamente no Dashboard** e acessa todas as funcionalidades por **modais**, sem navegação complexa entre páginas.

---

## 🔐 Acesso ao Sistema

### Usuário padrão (hardcoded para MVP)
- **Login:** admin  
- **Senha:** admin  

> Este usuário existe apenas para testes iniciais.  
> Em versões futuras, será substituído por usuários cadastrados no banco.

---

## 🌐 Landing Page (Pública)

### Estrutura (Página única / Landpage)
- Menu fixo no topo com âncoras:
  - Quem somos
  - Serviços
  - Orçamentos
  - 📍 Localização
- Botão flutuante WhatsApp (contato)
- Botão **⚙️ (engrenagem)** no canto superior direito → **Login da plataforma**

### Conteúdo
1. Apresentação da empresa
2. Quem somos
3. Serviços oferecidos
4. Orçamentos (CTA para WhatsApp)
5. Mapa com botão “Como chegar”

---

## 🔐 Tela de Login
- Campo usuário
- Campo senha
- Botão “Entrar”

### Comportamento
- Login válido → redireciona direto para **Dashboard**
- Login inválido → mensagem de erro simples

---

## 📊 Dashboard (Tela Inicial do Admin)

### Objetivo
Visão geral do negócio no mês atual.

### Conteúdo
- Cards (KPIs):
  - Total vendido no mês
  - Quantidade de vendas
  - Ticket médio
  - Pagamentos pendentes
- Gráfico:
  - Vendas por dia ou semana
- Indicadores rápidos:
  - Estoque baixo
  - Vendas em produção

### Ações (botões principais)
- 📦 Estoque
- 🧾 Vendas
- 👤 Clientes
- ➕ Nova venda
- ⚙️ Configurações (opcional no MVP)

> Todos os botões abrem **modais**, sem trocar de página.

---

## 🧾 Vendas (Modal)

### Modal: Lista de Vendas
- Tabela com:
  - Data
  - Cliente (ou “Venda genérica”)
  - Valor total
  - Status
  - Status de pagamento
- Filtros:
  - Período
  - Status
  - Cliente
- Ações por linha:
  - Visualizar / editar
- Botão **“Nova venda”**

---

### Modal: Nova Venda
- Cliente:
  - Selecionar cliente existente
  - Opção “Venda genérica”
- Itens da venda:
  - Descrição
  - Quantidade
  - Valor unitário
- Valores:
  - Subtotal
  - Desconto
  - Total
- Datas:
  - Data da venda
  - Previsão de entrega
- Status do pedido
- Status do pagamento
- Observações
- Botão **Salvar**

---

### Modal: Detalhe da Venda
- Resumo da venda
- Lista de itens
- Histórico de pagamentos
- Alterar status
- Registrar novo pagamento
- Observações
- Botão **Cancelar venda**

---

## 👤 Clientes (Modal Único)

### Modal: Clientes
Este modal concentra **lista + criação + edição**.

#### Área 1 — Lista de Clientes
- Tabela com:
  - Nome
  - Tipo (PF/PJ)
  - Telefone
  - Total de pedidos
  - Total gasto
- Busca por nome/telefone
- Botão **“Novo cliente”**

---

### Modal: Novo Cliente
(Aberto a partir do modal Clientes)

- Tipo:
  - Pessoa Física
  - Pessoa Jurídica
- Campos:
  - Nome / Razão Social
  - CPF ou CNPJ (opcional)
  - Telefone / WhatsApp
  - Email (opcional)
  - Observações
- Botão **Salvar**

---

### Modal: Detalhe do Cliente
- Dados do cliente
- Indicadores:
  - Total de pedidos
  - Total gasto
- Lista de vendas associadas
- Botões:
  - Editar cliente
  - Inativar cliente

---

## 📦 Estoque (Modal)

### Modal: Visão Geral do Estoque
- Lista de itens com:
  - Nome
  - Categoria (Matéria-prima / Consumo)
  - Quantidade atual
  - Unidade
  - Estoque mínimo
  - Status (OK / Baixo)
- Filtros por categoria
- Botões:
  - “Novo item”
  - “Movimentar estoque”

---

### Modal: Novo Item de Estoque
- Nome do item
- Categoria
- Unidade
- Quantidade inicial
- Estoque mínimo
- Custo unitário (opcional)
- Botão **Salvar**

---

### Modal: Movimentação de Estoque
- Selecionar item
- Tipo de movimentação:
  - Entrada
  - Saída
  - Ajuste
  - Perda
- Quantidade
- Data
- Motivo
- (Opcional) Vincular a uma venda
- Botão **Confirmar movimentação**

---

## ⚙️ Configurações (opcional no MVP)
- Dados da empresa
- Formas de pagamento disponíveis
- Status padrão de pedidos
- Link do WhatsApp

---

## 🧠 Fluxo Principal do Admin
1. Login
2. Dashboard
3. Abertura de modais:
   - Clientes
   - Vendas
   - Estoque
4. Todas as ações ocorrem em modais
5. Dashboard sempre acessível

---

## ✅ Escopo do MVP
Incluído:
- Dashboard mensal
- CRUD de clientes
- CRUD de vendas
- Pagamentos
- Estoque básico
- Movimentações de estoque

Fora do MVP:
- Usuários múltiplos
- Permissões
- PDFs
- Relatórios avançados
- Automação de produção

---



# 📦 Database Schema — Plataforma de Impressão 3D em Resina (MVP)

## Visão Geral
Banco de dados relacional (PostgreSQL) para uma plataforma administrativa de empresa de impressão 3D em resina.

Objetivos:
- Controle de usuários (admins)
- Cadastro de clientes (PF / PJ)
- Gestão de vendas / pedidos
- Controle de pagamentos
- Controle de estoque (matéria-prima e consumo)
- Histórico de movimentações de estoque
- Base para dashboards e relatórios

Todas as tabelas utilizam **UUID como chave primária (PK)**.

---

## 🔐 users
Usuários do sistema (inicialmente apenas administradores).

**PK:** `id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do usuário |
| email | TEXT | Email (único) |
| password_hash | TEXT | Senha criptografada |
| role | TEXT | Perfil (`ADMIN`) |
| is_active | BOOLEAN | Usuário ativo/inativo |
| created_at | TIMESTAMPTZ | Data de criação |

---

## 👤 customers
Clientes pessoa física ou jurídica.

**PK:** `id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador único |
| type | TEXT | `PF` ou `PJ` |
| name | TEXT | Nome ou razão social |
| document | TEXT | CPF ou CNPJ (opcional, único) |
| phone | TEXT | Telefone / WhatsApp |
| email | TEXT | Email (opcional) |
| notes | TEXT | Observações |
| is_active | BOOLEAN | Cliente ativo |
| created_at | TIMESTAMPTZ | Data de cadastro |

---

## 🧾 sales
Pedidos / vendas realizadas.

**PK:** `id`  
**FK:** `customer_id → customers.id` (nullable)  
**FK:** `created_by_user_id → users.id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador da venda |
| customer_id | UUID | Cliente (NULL para venda genérica) |
| customer_name_snapshot | TEXT | Nome do cliente no momento da venda |
| status | TEXT | `BUDGET`, `APPROVED`, `IN_PRODUCTION`, `DONE`, `DELIVERED`, `CANCELLED` |
| sale_date | DATE | Data da venda |
| due_date | DATE | Previsão de entrega/retirada |
| subtotal | NUMERIC(12,2) | Valor bruto |
| total | NUMERIC(12,2) | Valor final |
| payment_status | TEXT | `PENDING`, `PARTIAL`, `PAID`, `REFUNDED` |
| notes | TEXT | Observações |
| created_by_user_id | UUID | Usuário criador |
| created_at | TIMESTAMPTZ | Data de criação |

---

## 📦 sale_items
Itens que compõem uma venda.

**PK:** `id`  
**FK:** `sale_id → sales.id` (ON DELETE CASCADE)

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador |
| sale_id | UUID | Venda associada |
| description | TEXT | Descrição do item |
| qty | NUMERIC(12,3) | Quantidade |
| unit_price | NUMERIC(12,2) | Preço unitário |
| line_total | NUMERIC(12,2) | Total do item |

---

## 💰 payments
Pagamentos vinculados a uma venda (suporta pagamento parcial).

**PK:** `id`  
**FK:** `sale_id → sales.id` (ON DELETE CASCADE)

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador |
| sale_id | UUID | Venda |
| method | TEXT | `PIX`, `CARD`, `CASH`|
| amount | NUMERIC(12,2) | Valor pago |
| paid_at | TIMESTAMPTZ | Data do pagamento |
| notes | TEXT | Observações |
| created_by_user_id | UUID | Usuário que registrou |
| created_at | TIMESTAMPTZ | Data de criação |

---

## 🧪 inventory_items
Itens de estoque (matéria-prima e consumo).

**PK:** `id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador |
| name | TEXT | Nome do item |
| category | TEXT | `RAW_MATERIAL` ou `CONSUMABLE` |
| unit | TEXT | Unidade (`ML`, `L`, `G`, `UNIT`) |
| min_qty | NUMERIC(12,3) | Estoque mínimo |
| current_qty | NUMERIC(12,3) | Quantidade atual |
| is_active | BOOLEAN | Item ativo |
| created_at | TIMESTAMPTZ | Data de criação |

---

## 🔄 inventory_movements
Histórico de movimentações de estoque.

**PK:** `id`  
**FK:** `item_id → inventory_items.id`  
**FK:** `sale_id → sales.id` (nullable)  
**FK:** `created_by_user_id → users.id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador |
| item_id | UUID | Item do estoque |
| type | TEXT | `IN`, `OUT`, `ADJUST`, `LOSS` |
| qty | NUMERIC(12,3) | Quantidade movimentada |
| movement_date | TIMESTAMPTZ | Data da movimentação |
| reason | TEXT | Motivo |
| sale_id | UUID | Venda associada (opcional) |
| created_by_user_id | UUID | Usuário responsável |
| created_at | TIMESTAMPTZ | Data de criação |

---

## 📝 audit_logs (opcional)
Registro de ações relevantes no sistema.

**PK:** `id`

| Campo | Tipo | Descrição |
|------|-----|----------|
| id | UUID | Identificador |
| user_id | UUID | Usuário |
| entity | TEXT | Entidade afetada |
| entity_id | UUID | ID da entidade |
| action | TEXT | `CREATE`, `UPDATE`, `DELETE` |
| data | JSONB | Dados alterados |
| created_at | TIMESTAMPTZ | Data do evento |

---

## 📌 Observações Gerais
- UUID facilita uso em ambientes serverless.
- Campos `created_at` permitem auditoria básica.
- Estrutura preparada para dashboards e relatórios mensais.

---