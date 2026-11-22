# Project memory

## Product intent & audience

- Web system (pt-BR) for small motorcycle repair shops ("oficinas de moto")
- Single-workshop ownership model; each user ("dono" or "mecânico") belongs to one workshop and only sees its data
- MVP scope excludes: NF-e, supplier integrations, native app, WhatsApp API, online client scheduling, multi-branch
- Modular feature set: Painel, OS (orders), Clientes, Lembretes, Financeiro, Configurações
- Development proceeds in numbered stages ("Etapas"); each stage is tagged on GitHub (`etapa-NN`) after testing and closing
- Audience: shop owners with ~15 min learning target; needs large buttons and readable text

## Brand personality & voice

- Professional but approachable; Portuguese (Brazilian) only
- Clear, practical, no jargon; error messages in pt-BR and human-readable
- Business documentation tone in PROJETO.md; UI tone is direct and task-focused

## Visual design & UX direction

- Mobile-first layout; bottom nav on mobile, sidebar on desktop
- Nav items fixed: Painel, OS, Clientes, Lembretes, Financeiro, Configurações
- Palette: sober dark gray base with orange accent; large touch targets; legible typography
- Icons via lucide-react; no extra UI/icon packages
- Code organized in `components`, `pages`, `lib`, `hooks`; imports via `@/` alias to `src/`
- Avoid: screens beyond stage scope, hardcoded secrets, editing old migrations

## Decisions, constraints & rationale

- Stack fixed: React + Vite + TypeScript + Tailwind + Supabase (Auth + Postgres)
- `PROJETO.md` at repo root is the source of truth; updated at each stage close
- SQL migrations live in `/supabase/migrations`, numbered (e.g., `0001_base.sql`), forward-only; never edit old ones
- `.env.example` contains only var names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); `.env` gitignored; no keys in code; never store `service_role` key in client
- RLS required on all data tables, scoped per `oficina_id`
- GitHub is primary backup (private repo `oficina-moto`); Bolt GitHub sync must show "Synced to GitHub"; stage tags created manually via GitHub Releases
- ZIP backup is secondary (`oficina-moto_etapaNN_AAAA-MM-DD.zip`), kept in Google Drive; required before account switches and at stages 3, 6, 10; keep last 3
- Resume protocol: import repo/ZIP in new Bolt account, paste resume prompt, recreate env vars, verify login, do not re-run existing migrations
- Per-stage close: paste closing prompt to update PROJETO.md §15, verify migrations and `.env.example`, confirm sync, create tag, update "Última tag no GitHub"
- After Etapa 1, do resume rehearsal on another account/incognito

## Open questions & assumptions

- Assumes a private GitHub repo `oficina-moto` will be created and connected to Bolt; not yet confirmed
- Assumes user has (or will create) a personal Supabase account; temporary/default Supabase connection may be used initially
- Stage 1 scope only: layout, auth, workshop/user tables, empty dashboard; later stages add OS, clients, reminders, finance
- No test credentials or GitHub repo metadata established yet (PROJETO.md §15 still empty)