# 07 - Backend Structure - Plataforma de Impressao 3D em Resina (MVP)

## 1. Visao geral

- Linguagem: JavaScript
- Plataforma: Node.js
- Framework HTTP: Express
- Banco: PostgreSQL via node-postgres (pg)
- Autenticacao: JWT (Bearer Token)
- Arquitetura: camadas (routes, controllers, services, repositories)

---

## 2. Estrutura de diretorios

```
/backend
  package.json
  Dockerfile
  .env
  /src
    /routes
    /controllers
    /services
    /repositories
    /middlewares
    /utils
    /config
    app.js
    server.js
```

---

## 3. Fluxo de inicializacao

1. `server.js` carrega variaveis de ambiente.
2. `app.js` registra middlewares e rotas.
3. Servidor inicia na porta configurada.

---

## 4. Padroes de rotas

- Rotas devem seguir `05-APIRoutes.md`.
- `/api/auth/login` e publica.
- Demais rotas exigem JWT valido.

---

## 5. Padroes de controllers

- Validam entrada basica.
- Chamam services.
- Retornam JSON.
- Nao implementam regras de negocio.

---

## 6. Padroes de services

- Implementam regras do dominio.
- Calculam totais e status de pagamento.
- Orquestram repositorios.

---

## 7. Padroes de repositories

- CRUD e consultas especificas.
- Sem regras de negocio.
- Isolam SQL do resto do sistema.

---

## 8. Middlewares globais

- Autenticacao JWT.
- Tratamento global de erros.
- Logs (morgan).

---

## 9. Configuracoes

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`

---

## 10. Docker e deploy

- Dockerfile para API.
- docker-compose com API + PostgreSQL.
