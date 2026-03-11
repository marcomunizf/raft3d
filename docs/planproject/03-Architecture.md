# 03 - Arquitetura do Sistema

Este documento descreve a **arquitetura do sistema**, apresentando a organização das
camadas, responsabilidades de cada parte, fluxos de comunicação e visão geral da
infraestrutura, com base no MVP descrito.

Este arquivo **não define tecnologias específicas, bibliotecas ou versões**.
Essas decisões devem ficar registradas em `04-TechStack.md`.

---

## Objetivos da Arquitetura

- Separar responsabilidades entre interface pública, painel admin e dados.
- Facilitar manutenção e evolução do MVP.
- Evitar acoplamento entre interface e persistência.
- Garantir que o fluxo principal do admin fique claro.

---

## Visão Geral da Arquitetura

O sistema é dividido em quatro blocos conceituais:

- **Landing page pública** (apresentação e CTA de orçamento)
- **Plataforma administrativa** (dashboard e modais)
- **Serviço de aplicação** (autenticação e regras de negócio)
- **Database** (persistência relacional conforme schema)

Fluxo geral:

Interface administrativa -> serviço de aplicação -> banco de dados

---

## Arquitetura do Front-end (Conceitual)

Responsabilidades do front-end:

- Exibir landing page pública com seções e CTA.
- Exibir tela de login e validar o fluxo de acesso.
- Exibir dashboard do admin e abrir modais (vendas, clientes, estoque).
- Não manter regras críticas de negócio no lado cliente.

---

## Arquitetura do Back-end

O back-end é responsável por:

- Autenticar o admin e controlar acesso ao painel.
- Implementar regras de negócio de vendas, clientes, pagamentos e estoque.
- Persistir e consultar dados do banco conforme schema.

### Organização em Camadas

A organização interna do back-end não foi detalhada no `description.md`.
Quando definida, deve separar rotas, controllers, services, repositories,
middlewares, utils e config.

---

## Fluxo de uma Requisição

Interface administrativa -> serviço de aplicação -> banco de dados  
banco de dados -> serviço de aplicação -> interface administrativa

---

## Infraestrutura (Visão Conceitual)

A infraestrutura do MVP não está detalhada no `description.md`.
Deve suportar a landing page pública, o painel admin e o banco de dados.

---

## O que NÃO é responsabilidade deste arquivo

Este documento **não define**:

- tecnologias, frameworks e versões,
- contratos completos de API,
- detalhes físicos de banco,
- estrutura de diretórios do backend.

## Modulos principais
- Landing page publica (apresentacao, servicos, orcamentos, localizacao).
- Autenticacao e acesso do admin.
- Dashboard mensal (KPIs, grafico e indicadores).
- Vendas e pagamentos (lista, cadastro, detalhe, cancelamento).
- Clientes (PF/PJ).
- Estoque e movimentacoes.
- Configuracoes (opcional no MVP).

## Fluxo principal do admin
1. Login.
2. Dashboard.
3. Abertura de modais: vendas, clientes, estoque e nova venda.
4. Acoes executadas em modais, sem troca de pagina.

## Integracoes externas
- WhatsApp via link/CTA (sem integracao de API no MVP).
