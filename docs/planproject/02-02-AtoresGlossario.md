# 02.02 - Atores e Glossário

---
## ÐY'¾ Atores do Sistema
- Separar todos os atores do sistema com roles

### 1. Administrador
- Permissões
  - Acesso total ao painel administrativo.
  - Pode acessar dashboard, vendas, clientes, pagamentos e estoque.
  - Opera todas as ações do MVP via modais.

### 2. Usuário Operacional
- Permissões
  - No MVP, o papel operacional e representado pelo visitante.
  - Visitantes acessam a landing page publica e o CTA de orcamento.
  - Pode visualizar secoes e acionar o botao de WhatsApp.

### 3. Serviço Externo (atual ou futuro)
- Não previsto no MVP.

---
## ÐY"- Relacionamento 
- Usuário (admin) cria e atualiza vendas, pagamentos e movimentações de estoque.
- Vendas podem se relacionar com clientes (opcional) e possuem itens e pagamentos.
- Movimentações de estoque se relacionam com itens de estoque e podem se relacionar a uma venda.

---
## ÐY"~ Glossário
- Definir nessa etapa toda a nomenclatura do sistema

**Administrador:**  
Usuário único do MVP com acesso completo ao painel administrativo.

**Landing page:**  
Página pública com apresentação da empresa, serviços e CTA de orçamento.

**Dashboard:**  
Tela inicial do admin com KPIs mensais, gráfico e indicadores rápidos.

**Cliente (PF/PJ):**  
Pessoa física ou jurídica cadastrada para vincular pedidos/vendas.

**Venda/Pedido:**  
Registro de uma venda com itens, status e informações de pagamento.

**Item de venda:**  
Linha que descreve um item da venda com quantidade e preço.

**Pagamento:**  
Registro financeiro associado a uma venda, permitindo pagamento parcial.

**Estoque:**  
Cadastro de itens (matéria-prima ou consumo) com quantidade e estoque mínimo.

**Movimentação de estoque:**  
Registro de entrada, saída, ajuste ou perda de um item de estoque.

**Venda genérica:**  
Venda sem cliente associado (customer_id nulo).

## Complementos (Atores)
### Visitante
- Acessa a landing page, navega nas secoes e aciona o CTA de orcamento/WhatsApp.
- Nao acessa a plataforma administrativa.

## Complementos (Glossario)
**Orcamento:**
Pedido de cotacao iniciado pelo CTA da landing page.

**Modal:**
Janela sobreposta usada para CRUDs e detalhes, sem trocar de pagina.

**Como chegar:**
Acao do botao do mapa que abre rotas no app ou servico de mapas.

**Pagamento parcial:**
Pagamento feito em mais de uma parcela, mantendo saldo pendente.

**Status de pedido:**
BUDGET, APPROVED, IN_PRODUCTION, DONE, DELIVERED, CANCELLED.

**Status de pagamento:**
PENDING, PARTIAL, PAID, REFUNDED.
