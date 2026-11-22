import type { ReactNode } from 'react';
import { Wrench, LayoutDashboard, FileText, Users, Bell, Wallet, Settings, LogOut } from 'lucide-react';

export interface NavItem {
  rota: string;
  rotulo: string;
  icone: typeof LayoutDashboard;
}

export const ITENS_NAV: NavItem[] = [
  { rota: 'painel', rotulo: 'Painel', icone: LayoutDashboard },
  { rota: 'os', rotulo: 'OS', icone: FileText },
  { rota: 'clientes', rotulo: 'Clientes', icone: Users },
  { rota: 'lembretes', rotulo: 'Lembretes', icone: Bell },
  { rota: 'financeiro', rotulo: 'Financeiro', icone: Wallet },
  { rota: 'config', rotulo: 'Configurações', icone: Settings },
];

interface AppLayoutProps {
  tela: string;
  onNavegar: (rota: string) => void;
  nomeOficina: string;
  onSair: () => void;
  children: ReactNode;
}

export default function AppLayout({ tela, onNavegar, nomeOficina, onSair, children }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-neutral-900">
      {/* Barra lateral (desktop) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-neutral-800 border-r border-neutral-700 flex-col">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-neutral-700">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-neutral-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-neutral-100 truncate" title={nomeOficina}>
            {nomeOficina}
          </span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {ITENS_NAV.map(({ rota, rotulo, icone: Icone }) => {
            const ativo = tela === rota;
            return (
              <button
                key={rota}
                onClick={() => onNavegar(rota)}
                className={`w-full flex items-center gap-3 px-4 h-12 rounded-xl text-lg font-medium transition-colors ${
                  ativo
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100'
                }`}
              >
                <Icone className="w-5 h-5 shrink-0" />
                {rotulo}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-neutral-700">
          <button
            onClick={onSair}
            className="w-full flex items-center gap-3 px-4 h-12 rounded-xl text-lg font-medium text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="md:pl-64">
        {/* Topo (mobile) */}
        <header className="md:hidden sticky top-0 z-10 flex items-center gap-3 px-4 h-14 bg-neutral-800 border-b border-neutral-700">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-neutral-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-neutral-100 truncate" title={nomeOficina}>
            {nomeOficina}
          </span>
        </header>

        <main className="px-4 pt-6 pb-24 md:px-8 md:pb-10 max-w-4xl mx-auto">{children}</main>
      </div>

      {/* Menu inferior (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 bg-neutral-800 border-t border-neutral-700 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6 h-16">
          {ITENS_NAV.map(({ rota, rotulo, icone: Icone }) => {
            const ativo = tela === rota;
            return (
              <button
                key={rota}
                onClick={() => onNavegar(rota)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  ativo ? 'text-orange-400' : 'text-neutral-400'
                }`}
              >
                <Icone className="w-6 h-6" />
                <span className="text-xs font-medium">{rotulo}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sair (mobile) fica no topo, à direita */}
      <button
        onClick={onSair}
        aria-label="Sair"
        className="md:hidden fixed top-3 right-3 z-10 w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 active:bg-neutral-700 transition-colors"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
