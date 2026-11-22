# PROJETO.md: Sistema de Gestão para Oficinas de Moto

> Este arquivo é a fonte da verdade do projeto. Fica na **raiz do projeto**.
> **O código é salvo automaticamente no GitHub** (repositório privado `oficina-moto`), pela integração nativa do bolt.new. Ao fim de cada etapa, o repositório recebe uma **tag** (`etapa-NN`).
> O **ZIP** é o backup secundário: use antes de trocar de conta e nas etapas 3, 6 e 10.
> Ao trocar de conta no bolt.new, **importe o repositório do GitHub** e cole o prompt de retomada (seção 10).

## 1. Resumo

Sistema web (SaaS por assinatura mensal) para **oficinas de moto pequenas** (1 a 5 mecânicos).
Foco: ordem de serviço digital, orçamento aprovado pelo cliente via WhatsApp, histórico por placa e lembrete automático de retorno (troca de óleo, revisão).

**Não é um ERP.** Deve ser simples o bastante para o dono da oficina aprender em 15 minutos, no celular.

## 2. Público e dores

| Dor da oficina | O que o sistema faz |
|---|---|
| Orçamento combinado só de boca, depois o cliente contesta | Orçamento enviado por link, com botão "Aprovar" e registro de data e hora |
| Cliente liga toda hora perguntando se a moto está pronta | Aviso automático de status por WhatsApp |
| Cliente esquece a troca de óleo e some | Lembrete de retorno por data ou quilometragem |
| Histórico da moto no caderno | Histórico por placa e por cliente |
| Não sabe quanto entrou e saiu no mês | Caixa simples e contas a receber |

## 3. Regras de ouro

1. Interface pensada primeiro para **celular**.
2. Poucos cliques: abrir uma OS em menos de 1 minuto.
3. Sem emissão de nota fiscal no MVP.
4. Sem aplicativo nativo. Site responsivo (PWA, se der).
5. Cada oficina só enxerga os próprios dados (multi-oficina com isolamento).
6. Tudo em português do Brasil. Valores em R$, datas em dd/mm/aaaa.
7. **O código vive no GitHub.** Repositório privado, sincronizado automaticamente pelo Bolt. Toda etapa termina com o fechamento da seção 9.1 (prompt de fechamento, conferência do GitHub e tag).
8. **Migrações são só para frente:** cada mudança no banco vira um arquivo novo e numerado em `/supabase/migrations` (ex.: `0003_catalogo.sql`). Nunca editar migrações antigas.
9. **Nunca editar arquivos direto no GitHub enquanto o projeto estiver aberto no Bolt.** Se os dois mudarem ao mesmo tempo, o Bolt mantém a versão dele e sobrescreve a do GitHub.
10. **Nenhuma chave no código nem no repositório.** O `.env` fica no `.gitignore`; só o `.env.example` (nomes das variáveis) vai para o GitHub.

## 4. Stack técnica

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend/banco:** Supabase (Postgres + Auth + Storage), em **conta própria** do dono do projeto. O banco não muda quando troca a conta do bolt.new; só o código muda de lugar.
- **Segurança:** Row Level Security (RLS) em todas as tabelas, filtrando por `oficina_id`
- **Código:** repositório **privado** no GitHub, em conta própria, conectado ao projeto pela integração nativa do bolt.new (commits automáticos). Backup secundário por ZIP (seção 9.1).
- **Hospedagem:** Netlify ou Vercel, em conta própria, com domínio próprio. Pode ser ligada ao repositório do GitHub para publicar automaticamente (decidir na Etapa 10), ou por upload manual da pasta `dist`.
- **WhatsApp (MVP):** links `https://wa.me/55DDDNUMERO?text=...` abertos pelo dono da oficina. Sem API oficial no início.
- **WhatsApp (fase 2):** automação via provedor de API, quando houver clientes pagando.

## 5. Modelo de dados

Todas as tabelas (exceto `oficinas`) têm `oficina_id` e `criado_em`.

- **oficinas**: id, nome, telefone, endereco, logo_url, plano, status_assinatura
- **usuarios**: id (Auth), oficina_id, nome, papel (`dono` | `mecanico`)
- **clientes**: id, oficina_id, nome, telefone (com DDD), observacoes
- **motos**: id, oficina_id, cliente_id, placa, marca, modelo, ano, cor, km_atual
- **servicos_catalogo**: id, oficina_id, nome, valor_padrao
- **pecas**: id, oficina_id, nome, codigo (opcional), preco_venda, quantidade_estoque, estoque_minimo
- **ordens_servico**: id, oficina_id, numero (sequencial por oficina), cliente_id, moto_id, mecanico_id, defeito_relatado, km_entrada, status, valor_total, token_publico, aprovado_em, entregue_em
  - status: `orcamento` → `aguardando_aprovacao` → `aprovado` → `em_andamento` → `pronto` → `entregue` (ou `cancelado`)
- **os_itens**: id, os_id, tipo (`servico` | `peca`), descricao, quantidade, valor_unitario, peca_id (opcional)
- **os_fotos**: id, os_id, url, legenda
- **lembretes**: id, oficina_id, moto_id, tipo (óleo, revisão, pneu, outro), data_prevista, km_previsto, enviado (bool)
- **financeiro**: id, oficina_id, tipo (`entrada` | `saida`), descricao, valor, data, os_id (opcional), pago (bool)

## 6. Telas do MVP

1. **Login / cadastro da oficina** (e-mail e senha)
2. **Painel inicial**: OS abertas por status, faturamento do mês, lembretes para enviar hoje
3. **Nova OS** (fluxo rápido):
   - buscar moto por placa (se não existir, cadastrar cliente e moto na hora)
   - defeito relatado, km de entrada
   - adicionar serviços e peças (do catálogo ou livre)
   - fotos (câmera do celular)
   - botão **"Enviar orçamento por WhatsApp"**
4. **Detalhe da OS**: alterar status, editar itens, botão "Avisar cliente" (abre WhatsApp com mensagem pronta), registrar pagamento
5. **Página pública do orçamento** (sem login, acessada por `token_publico`): mostra oficina, moto, itens, fotos, total e botões **Aprovar** / **Recusar**
6. **Clientes e motos**: lista, busca por nome ou placa, histórico de serviços
7. **Catálogo de serviços** e **Peças** (estoque simples, alerta de estoque mínimo)
8. **Lembretes**: lista do que vence nos próximos 30 dias, com botão "Enviar lembrete por WhatsApp"
9. **Financeiro**: entradas, saídas, saldo do mês, contas a receber
10. **Configurações**: dados da oficina, logo, mensagens padrão de WhatsApp, usuários

## 7. Regras de negócio

- Número da OS é sequencial **por oficina**.
- O link do orçamento usa token aleatório e longo. Não usar o id sequencial.
- Ao aprovar pelo link, gravar `aprovado_em` e mudar o status para `aprovado`.
- Ao marcar a OS como `entregue`, perguntar: "Criar lembrete de retorno?" (sugestão padrão: troca de óleo em 90 dias ou +1.500 km, editável).
- Ao entregar a OS, gerar automaticamente a entrada no financeiro (pendente ou paga).
- Peças usadas em OS aprovada dão baixa no estoque ao marcar `em_andamento`.
- Mecânico vê e edita OS, mas não vê o financeiro. Dono vê tudo.
- Telefone sempre salvo só com dígitos e DDD. Montar o link do WhatsApp com prefixo 55.

### Mensagens padrão de WhatsApp (editáveis)

- **Orçamento:** "Olá, {cliente}! O orçamento da sua {moto} ({placa}) está pronto. Veja os detalhes e aprove por aqui: {link}"
- **Pronta:** "Olá, {cliente}! Sua {moto} ({placa}) está pronta para retirada. Valor: R$ {total}."
- **Lembrete:** "Olá, {cliente}! Está chegando a hora da {tipo} da sua {moto}. Quer agendar um horário?"

## 8. Planos (estimativa a validar com clientes)

| Plano | Valor | Limites |
|---|---|---|
| Básico | R$ 79/mês | 2 usuários, OS, orçamento por WhatsApp, histórico |
| Completo | R$ 149/mês | 5 usuários, lembretes, financeiro, relatórios |

Teste grátis de 14 dias, sem cartão. No MVP, cobrança manual (Pix). Depois, integrar um gateway (Asaas, Mercado Pago ou similar).

## 9. Etapas de construção (um prompt por etapa)

Marque cada etapa ao concluir. **Ao concluir, siga o fechamento da seção 9.1 antes de começar a próxima.**

- [ ] **Etapa 1:** Projeto base (Vite, React, Tailwind), layout responsivo com menu, login com Supabase Auth, criação da oficina no cadastro
- [ ] **Etapa 2:** Tabelas `oficinas`, `usuarios`, `clientes`, `motos` com RLS. Telas de clientes e motos
- [ ] **Etapa 3:** Catálogo de serviços e peças
- [ ] **Etapa 4:** Nova OS e detalhe da OS (itens, status, número sequencial)
- [ ] **Etapa 5:** Fotos da OS (Supabase Storage) e página pública do orçamento com aprovar/recusar
- [ ] **Etapa 6:** Botões de WhatsApp com mensagens padrão (wa.me)
- [ ] **Etapa 7:** Lembretes de retorno
- [ ] **Etapa 8:** Financeiro e painel inicial
- [ ] **Etapa 9:** Configurações, permissões (dono x mecânico), polimento mobile
- [ ] **Etapa 10:** Controle de assinatura (status ativo/bloqueado) e deploy com domínio próprio

**Etapa atual:** 1

**Última tag no GitHub:** nenhuma ainda (padrão: `etapa-01`, `etapa-02`...)

**Último ZIP salvo:** nenhum ainda (padrão: `oficina-moto_etapa03_AAAA-MM-DD.zip`)

### 9.0 Preparação (uma vez, antes da Etapa 1)

1. Criar conta no GitHub (se não tiver) e um repositório **privado e vazio** chamado `oficina-moto`.
2. No bolt.new, criar o projeto e **conectar o GitHub** pelo ícone do GitHub no canto superior direito. Só o **dono do projeto** consegue conectar. Criar o repositório novo (privado) ou importar o vazio.
3. Confirmar no painel do ícone do GitHub que o status é **"Synced to GitHub"** e que os arquivos aparecem no github.com.
4. Confirmar que o `.gitignore` do projeto inclui `.env`.
5. Anotar no gerenciador de senhas: login do GitHub, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
6. Fazer o **ensaio de retomada** depois da Etapa 1 (ver 9.1, passo 5).

### 9.1 Fechamento de etapa (5 passos)

O Bolt faz commits sozinho a cada alteração que não quebra o projeto e verifica o GitHub a cada 30 segundos. Por isso o commit é automático, mas **a tag da etapa é manual** (é ela que marca "a etapa X está pronta e testada").

1. **Testar** o que foi feito (login, telas e fluxos da etapa) e corrigir erros.
2. **Colar o prompt de fechamento** (seção 10). Ele atualiza o PROJETO.md, confere as migrações e o `.env.example`. O commit desse ajuste sobe sozinho.
3. **Conferir a sincronização:** clicar no ícone do GitHub no Bolt e ver **"Synced to GitHub"**. Se o status ficar preso em "Syncing", esperar um pouco. Se mudanças recentes não aparecerem no repositório, **reautorizar a conexão com o GitHub** (mesmo painel).
4. **Conferir no github.com** que existem: `PROJETO.md` atualizado, `/supabase/migrations` com arquivos numerados e `.env.example`, e que **não** existe `.env` com valores.
5. **Criar a tag da etapa:** no github.com → repositório → Releases → *Create a new release* → tag `etapa-NN` (ex.: `etapa-03`) → publicar. Atualizar a linha "Última tag no GitHub" acima. Depois da Etapa 1, fazer também o **ensaio de retomada** (seção 10) em outra conta ou aba anônima para ter certeza de que funciona.

**ZIP (backup secundário):** baixar do bolt.new (menu do projeto → Download/Export, só no desktop) **antes de trocar de conta** e ao concluir as etapas 3, 6 e 10. Nome: `oficina-moto_etapaNN_AAAA-MM-DD.zip`. Configurar o navegador para baixar direto na pasta sincronizada do Google Drive. Manter os 3 últimos.

> Se o bolt.new travar ou a conta acabar no meio de uma etapa, o código já está no GitHub. Volte à última tag (`etapa-NN`) se o estado atual estiver quebrado.

## 10. Como continuar em uma nova conta do bolt.new

1. Na conta nova, abrir o bolt.new e **conectar a mesma conta do GitHub** (a que tem o repositório `oficina-moto`).
2. **Importar o repositório** `oficina-moto` como projeto novo. Se quiser voltar a uma etapa específica, importar a partir da tag ou do commit correspondente. Se a importação falhar, usar o **ZIP** mais recente: criar projeto vazio, carregar o ZIP (ou descompactar e arrastar os arquivos).
3. Colar o **prompt de retomada** abaixo e enviar.
4. Recriar as variáveis de ambiente no projeto novo: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API, ou gerenciador de senhas). O `.env` não vai para o GitHub. Nunca salvar a chave `service role` no código.
5. Conferir se o app abre e se o login funciona. O banco continua o mesmo. **Não rodar as migrações de novo** se as tabelas já existem; rodar só as novas.
6. Confirmar o status **"Synced to GitHub"** no projeto novo. Só depois continuar a etapa.
7. **Não apagar o projeto da conta antiga** até confirmar que a retomada funcionou. Só o dono do projeto antigo consegue desconectar o GitHub; evite que os dois projetos fiquem ligados ao mesmo repositório ao mesmo tempo.

### Prompt de fechamento (colar ao terminar cada etapa)

```
Fim da Etapa X. Faça apenas o seguinte:
1. Atualize o PROJETO.md: marque a Etapa X como concluída, mude "Etapa atual" para a próxima e preencha a seção 15 (o que existe no código, migrações aplicadas, pendências e "Como testar esta etapa").
2. Confirme que todas as migrações SQL estão em /supabase/migrations, numeradas e sem edição de arquivos antigos.
3. Confirme que o .env.example existe, com apenas os nomes das variáveis, que o .env está no .gitignore e que nenhuma chave está escrita no código.
Não altere mais nada no projeto.
```

### Prompt de retomada (colar na conta nova, depois de importar o repositório ou carregar o ZIP)

```
Este projeto foi importado de um repositório do GitHub (ou de um ZIP). Leia o PROJETO.md na raiz. Estamos na Etapa X.
Não execute nem recrie migrações; o banco já existe no Supabase.
Não altere a conexão com o GitHub nem crie outro repositório.
Antes de qualquer mudança:
1. Liste em poucas linhas o que já existe no código (páginas, componentes, tabelas e migrações).
2. Aponte qualquer inconsistência entre o PROJETO.md e o código.
3. Confirme que as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são lidas de variáveis de ambiente.
Depois continue a partir da Etapa X, sem refazer o que já existe e sem alterar telas e tabelas fora do escopo da etapa.
```

## 11. Checklist de controle (para nunca perder o projeto)

- [ ] Repositório **privado** `oficina-moto` no GitHub, em conta própria
- [ ] Integração do GitHub conectada no Bolt, status "Synced to GitHub"
- [ ] **Tag criada no GitHub ao fim de cada etapa** (`etapa-NN`)
- [ ] `.env` no `.gitignore`; `.env.example` presente e atualizado
- [ ] Migrações SQL numeradas na pasta `/supabase/migrations`
- [ ] ZIP baixado antes de trocar de conta e nas etapas 3, 6 e 10, guardado na pasta do Drive
- [ ] Ensaio de retomada feito depois da Etapa 1
- [ ] Conta Supabase própria (não dependente do bolt)
- [ ] Chaves do Supabase e login do GitHub no gerenciador de senhas, fora do repositório
- [ ] Domínio registrado no seu nome
- [ ] Hospedagem em conta própria
- [ ] Backup do banco semanal (export do Supabase)
- [ ] Este `PROJETO.md` atualizado após cada mudança importante

## 12. Prompt inicial para colar no bolt.new (Etapa 1)

```
Crie um sistema web em português do Brasil para oficinas de moto, usando React + Vite + TypeScript + Tailwind CSS e Supabase (Auth e Postgres).

Importante: o código será sincronizado com um repositório privado do GitHub. Mantenha tudo dentro do projeto: PROJETO.md na raiz, migrações SQL numeradas em /supabase/migrations (ex.: 0001_base.sql; nunca editar migrações antigas, só criar novas), um arquivo .env.example com os nomes das variáveis (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY), sem valores, e um .gitignore que inclua .env. Nunca escreva chaves no código.

Nesta primeira etapa, faça apenas:
1. Layout responsivo, pensado primeiro para celular, com menu inferior no mobile e lateral no desktop (itens: Painel, OS, Clientes, Lembretes, Financeiro, Configurações). As telas ainda podem estar vazias.
2. Login e cadastro com e-mail e senha usando Supabase Auth.
3. No cadastro, criar a oficina (nome e telefone) e vincular o usuário como "dono".
4. Tabelas "oficinas" e "usuarios" com Row Level Security: cada usuário só acessa dados da própria oficina.
5. Um painel inicial vazio com o nome da oficina.

Use cores sóbrias (cinza escuro e laranja de destaque), botões grandes e textos legíveis. Não crie funcionalidades além das listadas. Mantenha o código organizado em pastas (components, pages, lib, hooks).
```

## 13. Fora do escopo do MVP

Emissão de nota fiscal, integração com fornecedores de peças, aplicativo nativo, automação de WhatsApp por API, agendamento online pelo cliente, multi-filial.

## 14. Histórico de decisões

| Data | Decisão |
|---|---|
| 22/11/2026 | Nicho inicial: oficinas de moto pequenas. Sem nota fiscal e sem WhatsApp por API no MVP. |
| 22/11/2026 | GitHub removido do fluxo (estava dando problema). Backup por ZIP a cada etapa. Adicionados prompt de retomada e `.env.example`. |
| 22/11/2026 | Fechamento de etapa simplificado, com prompt de fechamento único. Migrações numeradas e só para frente. Prompt de retomada proíbe recriar migrações. |
| 22/11/2026 | **GitHub retomado como backup principal e automático**, pela integração nativa do bolt.new (repositório privado). Tag `etapa-NN` ao fim de cada etapa. ZIP vira backup secundário (antes de trocar de conta e nas etapas 3, 6 e 10). Extensão de Chrome de terceiros descartada por depender do layout do Bolt. |

## 15. Estado atual do projeto (atualizar a cada etapa)

- **Etapa concluída mais recente:** nenhuma
- **O que já existe no código:** (vazio)
- **Migrações aplicadas no Supabase:** (vazio)
- **Repositório GitHub:** (preencher: nome do repositório, último commit conferido e tag da etapa)
- **Como testar esta etapa:** (vazio. Informar o login de teste, as telas a abrir e o resultado esperado)
- **Pendências e observações:** (vazio)
