import { Construction } from 'lucide-react';

interface EmBrevePageProps {
  titulo: string;
  etapa: string;
}

export default function EmBrevePage({ titulo, etapa }: EmBrevePageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-100">{titulo}</h1>
      <div className="mt-10 rounded-2xl bg-neutral-800 border border-neutral-700 p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-700 flex items-center justify-center mb-4">
          <Construction className="w-7 h-7 text-orange-400" />
        </div>
        <p className="text-lg text-neutral-200 font-medium">Em construção</p>
        <p className="text-neutral-400 mt-2 max-w-sm">
          Esta tela será criada na {etapa}, seguindo o plano do PROJETO.md. Por enquanto, nada aqui.
        </p>
      </div>
    </div>
  );
}
