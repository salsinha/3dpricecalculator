# 3D J.A. – Price Calculator

Aplicação web para calcular o custo e o preço de venda de peças impressas em 3D. Os dados e a autenticação ficam no Supabase. O alojamento previsto é a Vercel. Não há backend separado: o browser e o Next.js falam diretamente com o Supabase, com Row Level Security.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Authentication → Providers → Email**, deixe o email/palavra-passe ativo.
3. Para desenvolvimento, pode desativar **Confirm email** em Authentication → Sign In / Providers, para entrar logo após criar o utilizador.
4. Em **Authentication → Users**, crie o utilizador da equipa com email e palavra-passe.
5. Em **Project Settings → API**, copie o Project URL e a chave `anon` `public`. Não use a chave `service_role` nesta aplicação.

## 3. Executar a migration

No **SQL Editor** do Supabase, abra e execute o ficheiro:

`supabase/migrations/001_init.sql`

Isto cria `profiles`, `settings`, `printers`, `filaments`, `pieces` e `piece_filaments`, a função `save_piece`, o trigger de conta nova e as políticas de RLS. Cada utilizador só vê e altera os seus dados.

Os dados de exemplo (PLA branco, preto e vermelho, e a peça Suporte de comandos) carregam-se dentro da aplicação, em Configurações ou no painel vazio, com **Carregar dados de exemplo**. Não substituem dados já existentes.

## 4. Configurar .env.local

```bash
cp .env.example .env.local
```

Preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
# ou, no painel novo: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 5. Executar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Sem sessão, a aplicação redireciona para `/login`.

## 6. Deploy na Vercel

1. Importe o repositório na Vercel. O framework detetado é Next.js.
2. Em **Settings → Environment Variables**, defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) antes do build.
3. Faça deploy.
4. No Supabase, em **Authentication → URL Configuration**, coloque o domínio da Vercel como Site URL.

## Cálculo

O preço usa margem sobre o valor de venda, não um acréscimo sobre o custo:

```
custo = filamento + eletricidade + mão de obra + máquina + embalagem
preço = custo / (1 - margem / 100)
```

Se o preço ficar abaixo do preço mínimo, é usado o mínimo.

Exemplo com as configurações iniciais (PLA branco 80 g, PLA vermelho 20 g, 5 h, 0,75 h, embalagem 0,50 €, margem 25%): custo cerca de 8,07 € e preço recomendado cerca de 10,76 €.

## Estrutura

- `app/` rotas e proteção de sessão
- `components/` interface
- `lib/` cálculos, validação, formatação e clientes Supabase
- `services/` leitura e escrita no Supabase
- `supabase/migrations/` SQL
- `types/` documentação dos objetos do domínio
