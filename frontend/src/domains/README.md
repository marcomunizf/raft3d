# Frontend por Dominios

## Dominios principais

- `auth`: sessao, login, leitura de token JWT.
- `dashboard`: indicadores e serie de vendas.
- `sales`: kanban, pedidos, historico e alteracoes de status.
- `customers`: cadastro, busca e historico de pedidos do cliente.
- `inventory`: itens de estoque, unidade/medida e atualizacoes.
- `users`: gestao de usuarios, permissoes e senha.
- `permissions`: regras de acesso por tipo (`RESINA`, `FDM`).
- `shared`: funcoes utilitarias de data, moeda e formatacao.

## Criterio usado para separar

- **Regra de negocio**: cada dominio agrupa o que muda junto no produto.
- **API por contexto**: cada dominio expoe seu `*.service.js` com chamadas HTTP.
- **UI compartilhavel**: componentes de dominio (ex: busca de clientes) ficam dentro do proprio dominio.
- **Baixo acoplamento**: paginas de tela (`pages/`) orquestram fluxos, sem conhecer detalhes de endpoint.

## Proximo passo sugerido

Mover os `forms` e `constants` remanescentes de `Dashboard.jsx` e `FuncionarioDashboard.jsx` para `domains/*` para concluir a separacao total.