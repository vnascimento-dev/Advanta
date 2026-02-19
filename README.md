# PJe CRM (RBAC) — Next.js + MySQL + Redis

Controle de clientes/processos/tarefas/audiências **com login e permissões por usuário (RBAC)**.

## Perfis
- **ADMIN**: tudo (inclui criar usuários)
- **ADVOGADO**: cria/edita/exclui
- **ASSISTENTE**: cria/edita (sem excluir)
- **LEITURA**: apenas visualizar

## Rodar local
```bash
docker compose up -d
cp .env.example .env
# ajuste AUTH_SECRET
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Admin padrão (seed):
- email: admin@local
- senha: admin123


## Login como página principal
A rota **/** (home) mostra o **login** quando não há sessão. Após logar, a home vira o dashboard.


## UI
- Deslogado: **tela limpa** apenas com formulário de login.
- Logado: **nav lateral esquerda** com Início, Clientes, Contratos, PJe, Configurações, Relatórios e Sair.

## PJe dentro do CRM
Defina `PJE_URL` no `.env`. Alguns tribunais bloqueiam iframe (X-Frame-Options). O botão “Abrir em nova aba” serve como fallback.
