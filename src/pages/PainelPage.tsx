import { FileText, Bell, Wallet, Users, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PainelPage() {
  const { perfil } = useAuth();

  if (!perfil) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400">
        <LoaderCircle className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-100">Painel</h1>
      <p className="text-neutral-400 mt-1">Bem-vindo, {perfil.usuario.nome}!</p>

      <div className="mt-6 rounded-2xl bg-neutral-800 border border-neutral-700 p-6">
        <p className="text-lg text-neutral-200 font-medium">{perfil.oficina.nome}</p>
        <p className="text-neutral-400 mt-1">
          Plano {perfil.oficina.plano} · Status: {perfil.oficina.status_assinatura}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-5">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <FileText className="w-5 h-5" />
            <span className="font-medium">OS abertas</span>
          </div>
          <p className="text-3xl font-bold text-neutral-100">0</p>
          <p className="text-sm text-neutral-500 mt-1">Disponível na Etapa 4</p>
        </div>
        <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-5">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Faturamento do mês</span>
          </div>
          <p className="text-3xl font-bold text-neutral-100">R$ 0,00</p>
          <p className="text-sm text-neutral-500 mt-1">Disponível na Etapa 8</p>
        </div>
        <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-5">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Lembretes para hoje</span>
          </div>
          <p className="text-3xl font-bold text-neutral-100">0</p>
          <p className="text-sm text-neutral-500 mt-1">Disponível na Etapa 7</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-neutral-600 p-6 flex items-start gap-3">
        <Users className="w-6 h-6 text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-neutral-400">
          Aqui você vai acompanhar sua oficina em um só lugar: ordens de serviço, clientes, lembretes
          e o caixa do mês. As próximas etapas preenchem este painel.
        </p>
      </div>
    </div>
  );
}
