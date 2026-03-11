# 05 - API Routes - Plataforma de Impressao 3D em Resina (MVP)

> Versao: 0.2

---

# 1. Convencoes Gerais

- Base URL: `/api`
- Formato das respostas: JSON
- Datas: ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:MM:SSZ`)
- Autenticacao:
  - Login via `/auth/login`
  - Demais rotas exigem `Authorization: Bearer <token>`

Padrao de erro (exemplo):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Descricao do erro",
  "details": []
}
```

Codigos de erro padrao:
- 400 Bad Request - dados invalidos
- 401 Unauthorized - nao autenticado
- 403 Forbidden - sem permissao
- 404 Not Found - recurso inexistente
- 409 Conflict - conflito de estado
- 422 Unprocessable Entity - regra de negocio invalida
- 500 Internal Server Error

---

# 2. Autenticacao

## 2.1 POST /api/auth/login

**Descricao:** autentica o admin e retorna token JWT.

**Body (exemplo):**
```json
{
  "usuario": "admin",
  "senha": "admin"
}
```

**Response 200 (exemplo):**
```json
{
  "token": "<jwt>",
  "usuario": {
    "id": "uuid",
    "name": "Admin",
    "role": "ADMIN",
    "is_active": true
  }
}
```

---

# 3. Dashboard

## 3.1 GET /api/dashboard/summary

**Descricao:** retorna KPIs do mes atual.

**Response 200 (exemplo):**
```json
{
  "total_sales_month": 12500.50,
  "sales_count_month": 42,
  "average_ticket": 297.63,
  "payments_pending": 3,
  "low_stock_count": 2,
  "in_production_count": 4
}
```

## 3.2 GET /api/dashboard/sales-series

**Query Params (opcionais):**
```
period=day|week
start_date=YYYY-MM-DD
end_date=YYYY-MM-DD
```

**Response 200 (exemplo):**
```json
[
  { "label": "2026-01-01", "total": 350.00 },
  { "label": "2026-01-02", "total": 800.00 }
]
```

---

# 4. Vendas

## 4.1 GET /api/sales

**Query Params (opcionais):**
```
start_date=YYYY-MM-DD
end_date=YYYY-MM-DD
status=BUDGET|APPROVED|IN_PRODUCTION|DONE|DELIVERED|CANCELLED
payment_status=PENDING|PARTIAL|PAID|REFUNDED
customer_id=<uuid>
```

**Response 200 (exemplo):**
```json
[
  {
    "id": "uuid",
    "sale_date": "2026-01-10",
    "customer_name_snapshot": "Cliente A",
    "status": "APPROVED",
    "payment_status": "PARTIAL",
    "total": 950.00
  }
]
```

## 4.2 POST /api/sales

**Body (exemplo):**
```json
{
  "customer_id": "uuid",
  "customer_name_snapshot": "Cliente A",
  "sale_date": "2026-01-10",
  "due_date": "2026-01-15",
  "status": "BUDGET",
  "payment_status": "PENDING",
  "subtotal": 1000.00,
  "discount_total": 50.00,
  "total": 950.00,
  "notes": "Observacoes",
  "items": [
    {
      "description": "Peca X",
      "qty": 2,
      "unit_price": 500.00,
      "line_total": 1000.00
    }
  ]
}
```

## 4.3 GET /api/sales/:id

Retorna detalhes da venda, itens e pagamentos.

## 4.4 PUT /api/sales/:id

Atualiza dados da venda e itens.

## 4.5 PATCH /api/sales/:id/status

**Body (exemplo):**
```json
{
  "status": "IN_PRODUCTION",
  "payment_status": "PARTIAL"
}
```

## 4.6 POST /api/sales/:id/cancel

Marca a venda como `CANCELLED`.

---

# 5. Pagamentos

## 5.1 GET /api/sales/:id/payments

Lista pagamentos da venda.

## 5.2 POST /api/sales/:id/payments

**Body (exemplo):**
```json
{
  "method": "PIX",
  "amount": 200.00,
  "paid_at": "2026-01-10T10:00:00Z",
  "notes": "Parcial"
}
```

---

# 6. Clientes

## 6.1 GET /api/customers

**Query Params (opcionais):**
```
q=nome|telefone
is_active=true|false
```

## 6.2 GET /api/customers/:id

## 6.3 POST /api/customers

**Body (exemplo):**
```json
{
  "type": "PF",
  "name": "Cliente A",
  "document": "00000000000",
  "phone": "11999999999",
  "email": "cliente@email.com",
  "notes": "Observacoes"
}
```

## 6.4 PUT /api/customers/:id

## 6.5 PATCH /api/customers/:id/deactivate

Inativa o cliente.

---

# 7. Estoque

## 7.1 GET /api/inventory/items

## 7.2 GET /api/inventory/items/:id

## 7.3 POST /api/inventory/items

**Body (exemplo):**
```json
{
  "name": "Resina X",
  "category": "RAW_MATERIAL",
  "unit": "ML",
  "min_qty": 500,
  "current_qty": 1200,
  "unit_cost": 0.50
}
```

## 7.4 PUT /api/inventory/items/:id

## 7.5 PATCH /api/inventory/items/:id/deactivate

Inativa o item do estoque.

---

# 8. Movimentacoes de Estoque

## 8.1 GET /api/inventory/movements

**Query Params (opcionais):**
```
item_id=<uuid>
start_date=YYYY-MM-DD
end_date=YYYY-MM-DD
type=IN|OUT|ADJUST|LOSS
```

## 8.2 POST /api/inventory/movements

**Body (exemplo):**
```json
{
  "item_id": "uuid",
  "type": "IN",
  "qty": 250,
  "movement_date": "2026-01-10T10:00:00Z",
  "reason": "Reposicao",
  "sale_id": "uuid"
}
```

---

# 9. Configuracoes (opcional no MVP)

## 9.1 GET /api/settings

## 9.2 PUT /api/settings

**Body (exemplo):**
```json
{
  "company_name": "Resina Raft",
  "whatsapp_link": "https://wa.me/5511999999999",
  "default_sale_status": "BUDGET",
  "payment_methods": ["PIX", "CARD", "CASH"]
}
```
