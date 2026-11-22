/*
# Etapa 1 — Tabelas base: oficinas e usuarios

1. Resumo em português
- Cria as duas tabelas iniciais do sistema: `oficinas` (dados da oficina) e
  `usuarios` (vínculo de cada conta de login com a sua oficina).
- Ativa Row Level Security (RLS) nas duas: cada usuário só enxerga e altera
  dados da própria oficina. Nenhuma oficina vê dados de outra.

2. Novas tabelas
- `oficinas`
  - `id` (uuid, chave primária)
  - `nome` (texto, obrigatório)
  - `telefone` (texto, apenas dígitos com DDD, pode ser nulo)
  - `endereco` (texto, opcional)
  - `logo_url` (texto, opcional)
  - `plano` (texto: `basico` | `completo`; padrão `basico`)
  - `status_assinatura` (texto: `teste` | `ativa` | `inadimplente` | `bloqueada`; padrão `teste`)
  - `criado_em` (data e hora, padrão agora)
- `usuarios`
  - `id` (uuid, chave primária; igual ao id da conta de login em auth.users)
  - `oficina_id` (uuid, obrigatório; oficina do usuário)
  - `nome` (texto, obrigatório)
  - `papel` (texto: `dono` | `mecanico`; padrão `dono`)
  - `criado_em` (data e hora, padrão agora)

3. Segurança (RLS, policies e grants)
- RLS ativado em `oficinas` e `usuarios`; sem policy, ninguém acessa nada.
- Função auxiliar `oficina_atual()`: SECURITY DEFINER, devolve a oficina do
  usuário logado (auth.uid). Usada nas policies para evitar recursão de RLS.
- `oficinas`:
  - SELECT: apenas a oficina do próprio usuário.
  - INSERT: qualquer usuário autenticado pode criar a oficina dele no cadastro.
  - UPDATE: apenas a própria oficina.
  - Sem DELETE (dados não são apagados pelo app).
- `usuarios`:
  - SELECT: o próprio usuário ou colegas da mesma oficina.
  - INSERT: o usuário só cria a própria linha (id = auth.uid()).
  - UPDATE: o usuário só edita a própria linha.
  - Sem DELETE.
- GRANT: SELECT/INSERT/UPDATE nas duas tabelas somente para `authenticated`.
- EXECUTE da função `oficina_atual()` revogado de PUBLIC/anon e concedido a
  `authenticated`.

4. Observações
- Migração idempotente (IF NOT EXISTS / DROP POLICY IF EXISTS) e segura para
  rodar de novo. Nunca editar este arquivo depois de aplicado: criar 0002.
*/

CREATE TABLE IF NOT EXISTS public.oficinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  endereco text,
  logo_url text,
  plano text NOT NULL DEFAULT 'basico' CHECK (plano IN ('basico', 'completo')),
  status_assinatura text NOT NULL DEFAULT 'teste'
    CHECK (status_assinatura IN ('teste', 'ativa', 'inadimplente', 'bloqueada')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  oficina_id uuid NOT NULL REFERENCES public.oficinas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  papel text NOT NULL DEFAULT 'dono' CHECK (papel IN ('dono', 'mecanico')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_oficina ON public.usuarios (oficina_id);

ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.oficina_atual()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oficina_id FROM public.usuarios WHERE id = auth.uid();
$$;

-- Policies de oficinas
DROP POLICY IF EXISTS "oficinas_select_propria" ON public.oficinas;
CREATE POLICY "oficinas_select_propria"
ON public.oficinas FOR SELECT
TO authenticated
USING (id = public.oficina_atual());

DROP POLICY IF EXISTS "oficinas_insert_cadastro" ON public.oficinas;
CREATE POLICY "oficinas_insert_cadastro"
ON public.oficinas FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "oficinas_update_propria" ON public.oficinas;
CREATE POLICY "oficinas_update_propria"
ON public.oficinas FOR UPDATE
TO authenticated
USING (id = public.oficina_atual())
WITH CHECK (id = public.oficina_atual());

-- Policies de usuarios
DROP POLICY IF EXISTS "usuarios_select_equipe" ON public.usuarios;
CREATE POLICY "usuarios_select_equipe"
ON public.usuarios FOR SELECT
TO authenticated
USING (id = auth.uid() OR oficina_id = public.oficina_atual());

DROP POLICY IF EXISTS "usuarios_insert_proprio" ON public.usuarios;
CREATE POLICY "usuarios_insert_proprio"
ON public.usuarios FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "usuarios_update_proprio" ON public.usuarios;
CREATE POLICY "usuarios_update_proprio"
ON public.usuarios FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.oficinas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated;

REVOKE EXECUTE ON FUNCTION public.oficina_atual() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.oficina_atual() TO authenticated;
