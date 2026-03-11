# Project Guidelines

## Descricao do Guia

Este documento reune regras especificas do projeto atual.
Registra decisoes tecnicas, arquiteturais e de dominio que valem apenas
para este sistema.

O objetivo deste guia e:
- evitar ambiguidades durante o desenvolvimento,
- alinhar todos os envolvidos,
- garantir consistencia entre codigo, SPEC, arquitetura e decisoes de negocio.

---

## Quando criar uma nova regra neste guideline

Uma nova regra deve ser adicionada quando:
- a regra depende do dominio do projeto,
- a decisao foi tomada durante o desenvolvimento e precisa ser preservada,
- existe mais de uma forma de implementar e o projeto escolheu uma,
- a ausencia da regra pode gerar comportamentos inconsistentes,
- a regra nao faz sentido fora deste projeto.

---

## Estrutura de uma regra especifica do projeto

1. Identificador da Regra (ex.: P-01)
2. Nome da Regra
3. Contexto
4. Regra
5. Onde se aplica
6. Impacto tecnico
7. Relacao com RF/RNF

---

### Regra P-01 - Credenciais fixas no MVP

**Contexto**
O MVP usa um unico admin para acelerar testes iniciais.

**Regra**
As credenciais padrao sao `admin/admin` e nao podem ser alteradas no MVP.

**Onde se aplica**
- Backend
- Auth

**Impacto tecnico**
- Login valida apenas o usuario admin do MVP.

**Relacao com RF/RNF**
- RF-03
- RNF-02

---

### Regra P-02 - Painel em pagina unica com modais

**Contexto**
O fluxo do admin e baseado em modais sem navegacao entre paginas.

**Regra**
Todas as acoes do admin (vendas, clientes, estoque, nova venda) abrem em modais.

**Onde se aplica**
- Frontend

**Impacto tecnico**
- Roteamento interno minimo.
- Estado de modais controlado pela tela do dashboard.

**Relacao com RF/RNF**
- RF-04
- RNF-01

---

### Regra P-03 - Cancelamento de venda por status

**Contexto**
O MVP precisa preservar historico de vendas.

**Regra**
Cancelar venda significa atualizar o status para `CANCELLED`.
Nao deve haver exclusao fisica.

**Onde se aplica**
- Backend
- Database
- API

**Impacto tecnico**
- Lista de vendas deve incluir canceladas quando solicitado.

**Relacao com RF/RNF**
- RF-12
- RNF-04

---

### Regra P-04 - Pagamento parcial

**Contexto**
O sistema permite pagamentos em mais de uma parcela.

**Regra**
- Se nao houver pagamento: `PENDING`.
- Se soma < total: `PARTIAL`.
- Se soma = total: `PAID`.

**Onde se aplica**
- Backend
- Services
- API

**Impacto tecnico**
- Atualizar status de pagamento a cada novo pagamento.

**Relacao com RF/RNF**
- RF-07
- RNF-04

---

### Regra P-05 - Configuracoes opcionais no MVP

**Contexto**
O modulo de configuracoes e opcional no MVP.

**Regra**
Quando o modulo estiver desativado, o botao e as rotas de configuracao
nao devem ser exibidos.

**Onde se aplica**
- Frontend
- API

**Impacto tecnico**
- Feature flag simples para habilitar/desabilitar configuracoes.

**Relacao com RF/RNF**
- RF-13
