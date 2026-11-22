/*
# Etapa 2 — Tabelas clientes e motos

1. Resumo em português
- Cria as tabelas `clientes` e `motos`, que armazenam os clientes e as
  motos vinculadas a cada oficina.
- Ativa Row Level Security (RLS) nas duas: cada oficina só enxerga e
  altera os próprios clientes e motos. Nenhuma oficina vê dados de outra.

2. Novas tabelas
- `clientes`
  - `id` (uuid, chave primária)
  - `oficina_id` (uuid, obrigatório; oficina à qual o cliente pertence)
  - `nome` (texto, obrigatório)
  - `telefone` (texto, apenas dígitos com DDD, pode ser nulo)
  - `observacoes` (texto, opcional)
  - `criado_em` (data e hora, padrão agora)
- `motos`
  - `id` (uuid, chave primária)
  - `oficina_id` (uuid, obrigatório; oficina à qual a moto pertence)
  - `cliente_id` (uuid, obrigatório; dono da moto)
  - `placa` (texto, obrigatório)
  - `marca` (texto, opcional)
  - `modelo` (texto, opcional)
  - `ano` (inteiro, opcional)
  - `cor` (texto, opcional)
  - `km_atual` (inteiro, opcional, padrão 0)
  - `criado_em` (data e hora, padrão agora)

3. Segurança (RLS, policies e grants)
- RLS ativado em `clientes` e `motos`; sem policy, ninguém acessa nada.
- `clientes`:
  - SELECT: apenas clientes da própria oficina.
  - INSERT: apenas na própria oficina.
  - UPDATE: apenas clientes da própria oficina.
  - Sem DELETE (dados não são apagados pelo app).
- `motos`:
  - SELECT: apenas motos da própria oficina.
  - INSERT: apenas na própria oficina.
  - UPDATE: apenas motos da própria oficina.
  - Sem DELETE.
- GRANT: SELECT/INSERT/UPDATE nas duas tabelas somente para `authenticated`.
- Índices em oficina_id, clientes(oficina_id, nome) e motos(oficina_id, placa).

4. Observações
- Migração idempotente (IF NOT EXISTS / DROP POLICY IF EXISTS).
- A função oficina_atual() já existe (criada na migração 0001).
- Nunca editar este arquivo depois de aplicado: criar 0003.
*/

CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id uuid NOT NULL REFERENCES public.oficinas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone text,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.motos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id uuid NOT NULL REFERENCES public.oficinas(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  placa text NOT NULL,
  marca text,
  modelo text,
  ano integer,
  cor text,
  km_atual integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_oficina ON public.clientes (oficina_id);
CREATE INDEX IF NOT EXISTS idx_clientes_oficina_nome ON public.clientes (oficina_id, nome);
CREATE INDEX IF NOT EXISTS idx_motos_oficina ON public.motos (oficina_id);
CREATE INDEX IF NOT EXISTS idx_motos_oficina_placa ON public.motos (oficina_id, placa);
CREATE INDEX IF NOT EXISTS idx_motos_cliente ON public.motos (cliente_id);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

-- Policies de clientes
DROP POLICY IF EXISTS "clientes_select_propria" ON public.clientes;
CREATE POLICY "clientes_select_propria"
ON public.clientes FOR SELECT
TO authenticated
USING (oficina_id = public.oficina_atual());

DROP POLICY IF EXISTS "clientes_insert_propria" ON public.clientes;
CREATE POLICY "clientes_insert_propria"
ON public.clientes FOR INSERT
TO authenticated
WITH CHECK (oficina_id = public.oficina_atual());

DROP POLICY IF EXISTS "clientes_update_propria" ON public.clientes;
CREATE POLICY "clientes_update_propria"
ON public.clientes FOR UPDATE
TO authenticated
USING (oficina_id = public.oficina_atual())
WITH CHECK (oficina_id = public.oficina_atual());

-- Policies de motos
DROP POLICY IF EXISTS "motos_select_propria" ON public.motos;
CREATE POLICY "motos_select_propria"
ON public.motos FOR SELECT
TO authenticated
USING (oficina_id = public.oficina_atual());

DROP POLICY IF EXISTS "motos_insert_propria" ON public.motos;
CREATE POLICY "motos_insert_propria"
ON public.motos FOR INSERT
TO authenticated
WITH CHECK (oficina_id = public.oficina_atual());

DROP POLICY IF EXISTS "motos_update_propria" ON public.motos;
CREATE POLICY "motos_update_propria"
ON public.motos FOR UPDATE
TO authenticated
USING (oficina_id = public.oficina_atual())
WITH CHECK (oficina_id = public.oficina_atual());

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.motos TO authenticated;
