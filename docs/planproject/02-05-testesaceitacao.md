# 02-05 - Casos de Teste de Aceitação (CTA)

Os CTAs descrevem como validar os Requisitos Funcionais na prática.

---
## Estrutura dos Casos de Teste de Aceitação (CTA)

Cada caso de teste contém:
- Objetivo
- Pré-condições
- Entrada / Ação do Usuário
- Passos do Teste
- Resultado Esperado

---
## Casos de Teste de Aceitação

CTA-01 - Navegação na landing page

Objetivo:
- Validar a navegação pelas seções via menu âncora.

Pré-condições:
- Landing page publicada.

Entrada / Ação:
- Acessar a landing page e clicar nos itens do menu.

Passos:
- Abrir a landing page.
- Clicar em "Quem somos", "Serviços", "Orçamentos" e "Localização".

Resultado Esperado:
- A página rola para cada seção correspondente.

---

CTA-02 - Login válido do admin

Objetivo:
- Validar acesso ao painel com credenciais corretas.

Pré-condições:
- Usuário padrão do MVP disponível.

Entrada / Ação:
- Informar usuário `admin` e senha `admin` na tela de login.

Passos:
- Acessar a tela de login pelo ícone de engrenagem.
- Preencher usuário e senha.
- Clicar em "Entrar".

Resultado Esperado:
- O sistema redireciona para o dashboard.

---

CTA-03 - Login inválido

Objetivo:
- Validar mensagem de erro ao informar credenciais inválidas.

Pré-condições:
- Tela de login acessível.

Entrada / Ação:
- Informar usuário ou senha incorretos.

Passos:
- Preencher credenciais inválidas.
- Clicar em "Entrar".

Resultado Esperado:
- O sistema exibe mensagem de erro simples.

---

CTA-04 - Criar nova venda

Objetivo:
- Validar criação de venda com itens e valores.

Pré-condições:
- Admin autenticado.

Entrada / Ação:
- Preencher o modal "Nova venda".

Passos:
- Abrir o modal de Vendas.
- Clicar em "Nova venda".
- Informar cliente (ou venda genérica), itens e valores.
- Salvar.

Resultado Esperado:
- A venda aparece na lista de vendas com status definido.

---

CTA-05 - Registrar pagamento em venda

Objetivo:
- Validar registro de pagamento em uma venda existente.

Pré-condições:
- Venda criada.

Entrada / Ação:
- Registrar um novo pagamento no detalhe da venda.

Passos:
- Abrir o detalhe da venda.
- Registrar pagamento com método e valor.

Resultado Esperado:
- O pagamento aparece no histórico da venda.
- O status de pagamento é atualizado.

---

CTA-06 - Criar cliente PF e inativar

Objetivo:
- Validar criação e inativação de cliente.

Pré-condições:
- Admin autenticado.

Entrada / Ação:
- Preencher cadastro de cliente PF.

Passos:
- Abrir modal de Clientes.
- Clicar em "Novo cliente".
- Salvar com tipo PF.
- Abrir o detalhe e inativar cliente.

Resultado Esperado:
- Cliente aparece na lista e fica marcado como inativo após a ação.

---

CTA-07 - Movimentação de estoque

Objetivo:
- Validar registro de movimentação de estoque.

Pré-condições:
- Item de estoque cadastrado.

Entrada / Ação:
- Registrar movimentação de entrada, saída, ajuste ou perda.

Passos:
- Abrir modal de Estoque.
- Selecionar "Movimentar estoque".
- Preencher tipo, quantidade e motivo.
- Confirmar movimentação.

Resultado Esperado:
- Movimentação registrada no histórico do item.

CTA-08 - Mapa e como chegar

Objetivo:
- Validar o botao "Como chegar" na secao de Localizacao.

Pre-condicoes:
- Landing page publicada.

Entrada / Acao:
- Clicar no botao "Como chegar".

Passos:
- Acessar a landing page.
- Ir para a secao Localizacao.
- Clicar em "Como chegar".

Resultado Esperado:
- O sistema abre o app/servico de mapas com a rota.

---

CTA-09 - Cancelar venda

Objetivo:
- Validar o cancelamento de uma venda pelo detalhe.

Pre-condicoes:
- Venda criada.

Entrada / Acao:
- Acionar o botao "Cancelar venda".

Passos:
- Abrir o detalhe da venda.
- Clicar em "Cancelar venda".
- Confirmar a acao.

Resultado Esperado:
- A venda fica com status CANCELLED e permanece na lista.

---

CTA-10 - Pagamento parcial

Objetivo:
- Validar registro de pagamento parcial.

Pre-condicoes:
- Venda com valor total acima do valor pago.

Entrada / Acao:
- Registrar um pagamento menor que o total.

Passos:
- Abrir o detalhe da venda.
- Informar metodo e valor parcial.
- Confirmar o pagamento.

Resultado Esperado:
- Pagamento aparece no historico.
- Status de pagamento fica PARTIAL.

---

CTA-11 - Criar item de estoque

Objetivo:
- Validar criacao de novo item de estoque.

Pre-condicoes:
- Admin autenticado.

Entrada / Acao:
- Preencher o modal "Novo item".

Passos:
- Abrir o modal de Estoque.
- Clicar em "Novo item".
- Informar nome, categoria, unidade, quantidade inicial e estoque minimo.
- Salvar.

Resultado Esperado:
- Item aparece na lista de estoque.

---

CTA-12 - Configuracoes (opcional)

Objetivo:
- Validar edicao de configuracoes do sistema quando o modulo estiver ativo.

Pre-condicoes:
- Modulo de configuracoes habilitado.

Entrada / Acao:
- Editar dados da empresa e link do WhatsApp.

Passos:
- Abrir o modal de Configuracoes.
- Alterar os dados.
- Salvar.

Resultado Esperado:
- Dados salvos sao refletidos no sistema.
