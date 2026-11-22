import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/AuthPage';
import CompletarCadastroPage from '@/pages/CompletarCadastroPage';
import PainelPage from '@/pages/PainelPage';
import EmBrevePage from '@/pages/EmBrevePage';
import AppLayout from '@/components/AppLayout';

const TECLAS_FUTURAS: Record<string, { titulo: string; etapa: string }> = {
  os: { titulo: 'Ordens de Serviço', etapa: 'Etapa 4' },
  clientes: { titulo: 'Clientes', etapa: 'Etapa 2' },
  lembretes: { titulo: 'Lembretes', etapa: 'Etapa 7' },
  financeiro: { titulo: 'Financeiro', etapa: 'Etapa 8' },
  config: { titulo: 'Configurações', etapa: 'Etapa 9' },
};

function AppInterno() {
  const { session, perfil, carregando, sair } = useAuth();
  const [tela, setTela] = useState('painel');

  if (carregando) {
    return (
      <div className="min-h-dvh bg-neutral-900 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-700 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  if (!perfil) {
    return <CompletarCadastroPage />;
  }

  const telaFutura = TECLAS_FUTURAS[tela];

  return (
    <AppLayout
      tela={tela}
      onNavegar={setTela}
      nomeOficina={perfil.oficina.nome}
      onSair={sair}
    >
      {tela === 'painel' ? (
        <PainelPage />
      ) : telaFutura ? (
        <EmBrevePage titulo={telaFutura.titulo} etapa={telaFutura.etapa} />
      ) : null}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInterno />
    </AuthProvider>
  );
}
