import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Users,
  Search,
  Plus,
  X,
  LoaderCircle,
  ChevronRight,
  ChevronDown,
  Phone,
  Bike,
  Pencil,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { apenasDigitos, formatarTelefone, normalizarPlaca, traduzirErroAuth } from '@/lib/format';
import type { Cliente, Moto } from '@/lib/types';

interface FormCliente {
  id: string | null;
  nome: string;
  telDigitos: string;
  observacoes: string;
}

interface FormMoto {
  clienteId: string;
  id: string | null;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  km: string;
}

const FORM_CLIENTE_VAZIO: FormCliente = {
  id: null,
  nome: '',
  telDigitos: '',
  observacoes: '',
};

const FORM_MOTO_VAZIO: FormMoto = {
  clienteId: '',
  id: null,
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  km: '',
};

export default function ClientesPage() {
  const { perfil } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motosPorCliente, setMotosPorCliente] = useState<Record<string, Moto[]>>({});
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  const [modalCliente, setModalCliente] = useState<FormCliente | null>(null);
  const [modalMoto, setModalMoto] = useState<FormMoto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const oficinaId = perfil?.oficina.id ?? null;

  const carregarClientes = useCallback(async () => {
    if (!oficinaId) return;
    setCarregando(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('oficina_id', oficinaId)
      .order('nome', { ascending: true });
    if (error) {
      setErro(traduzirErroAuth(error.message));
    } else {
      setClientes(data ?? []);
    }
    setCarregando(false);
  }, [oficinaId]);

  const carregarMotos = useCallback(
    async (clienteId: string) => {
      if (!oficinaId) return;
      const { data, error } = await supabase
        .from('motos')
        .select('*')
        .eq('oficina_id', oficinaId)
        .eq('cliente_id', clienteId)
        .order('criado_em', { ascending: false });
      if (error) {
        setErro(traduzirErroAuth(error.message));
      } else {
        setMotosPorCliente((prev) => ({ ...prev, [clienteId]: data ?? [] }));
      }
    },
    [oficinaId]
  );

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const clientesFiltrados = busca.trim()
    ? clientes.filter((c) => {
        const q = busca.toLowerCase().trim();
        return (
          c.nome.toLowerCase().includes(q) ||
          (c.telefone ?? '').includes(apenasDigitos(busca))
        );
      })
    : clientes;

  function alternarExpansao(clienteId: string) {
    if (expandido === clienteId) {
      setExpandido(null);
      return;
    }
    setExpandido(clienteId);
    if (!motosPorCliente[clienteId]) {
      carregarMotos(clienteId);
    }
  }

  function abrirNovoCliente() {
    setErro(null);
    setModalCliente({ ...FORM_CLIENTE_VAZIO });
  }

  function abrirEditarCliente(cliente: Cliente) {
    setErro(null);
    setModalCliente({
      id: cliente.id,
      nome: cliente.nome,
      telDigitos: cliente.telefone ?? '',
      observacoes: cliente.observacoes ?? '',
    });
  }

  function abrirNovaMoto(clienteId: string) {
    setErro(null);
    setModalMoto({ ...FORM_MOTO_VAZIO, clienteId });
  }

  function abrirEditarMoto(moto: Moto) {
    setErro(null);
    setModalMoto({
      clienteId: moto.cliente_id,
      id: moto.id,
      placa: moto.placa,
      marca: moto.marca ?? '',
      modelo: moto.modelo ?? '',
      ano: moto.ano?.toString() ?? '',
      cor: moto.cor ?? '',
      km: moto.km_atual?.toString() ?? '',
    });
  }

  async function salvarCliente(e: FormEvent) {
    e.preventDefault();
    if (!modalCliente || !oficinaId) return;
    setSalvando(true);
    setErro(null);
    const dados = {
      oficina_id: oficinaId,
      nome: modalCliente.nome.trim(),
      telefone: modalCliente.telDigitos || null,
      observacoes: modalCliente.observacoes.trim() || null,
    };
    if (modalCliente.id) {
      const { error } = await supabase
        .from('clientes')
        .update(dados)
        .eq('id', modalCliente.id);
      if (error) {
        setErro(traduzirErroAuth(error.message));
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from('clientes').insert(dados);
      if (error) {
        setErro(traduzirErroAuth(error.message));
        setSalvando(false);
        return;
      }
    }
    setModalCliente(null);
    setSalvando(false);
    carregarClientes();
  }

  async function salvarMoto(e: FormEvent) {
    e.preventDefault();
    if (!modalMoto || !oficinaId) return;
    setSalvando(true);
    setErro(null);
    const dados = {
      oficina_id: oficinaId,
      cliente_id: modalMoto.clienteId,
      placa: normalizarPlaca(modalMoto.placa),
      marca: modalMoto.marca.trim() || null,
      modelo: modalMoto.modelo.trim() || null,
      ano: modalMoto.ano ? parseInt(modalMoto.ano, 10) : null,
      cor: modalMoto.cor.trim() || null,
      km_atual: modalMoto.km ? parseInt(modalMoto.km, 10) : 0,
    };
    if (modalMoto.id) {
      const { error } = await supabase.from('motos').update(dados).eq('id', modalMoto.id);
      if (error) {
        setErro(traduzirErroAuth(error.message));
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from('motos').insert(dados);
      if (error) {
        setErro(traduzirErroAuth(error.message));
        setSalvando(false);
        return;
      }
    }
    setModalMoto(null);
    setSalvando(false);
    carregarMotos(modalMoto.clienteId);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-100">Clientes</h1>
        <button
          onClick={abrirNovoCliente}
          className="shrink-0 flex items-center gap-2 h-11 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-neutral-950 font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo
        </button>
      </div>

      <div className="mt-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <LoaderCircle className="w-8 h-8 animate-spin" />
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-600 p-8 flex flex-col items-center text-center">
          <Users className="w-10 h-10 text-neutral-500 mb-3" />
          <p className="text-neutral-400">
            {busca.trim()
              ? 'Nenhum cliente encontrado para essa busca.'
              : 'Nenhum cliente cadastrado ainda. Toque em "Novo" para começar.'}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {clientesFiltrados.map((cliente) => {
            const aberto = expandido === cliente.id;
            const motos = motosPorCliente[cliente.id] ?? [];
            return (
              <li
                key={cliente.id}
                className="rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden"
              >
                <button
                  onClick={() => alternarExpansao(cliente.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-750 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-100 truncate">{cliente.nome}</p>
                    {cliente.telefone && (
                      <p className="text-sm text-neutral-400 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {formatarTelefone(cliente.telefone)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-medium text-neutral-500 bg-neutral-700 px-2 py-1 rounded-lg">
                    {motos.length > 0
                      ? `${motos.length} ${motos.length === 1 ? 'moto' : 'motos'}`
                      : 'Sem motos'}
                  </span>
                  {aberto ? (
                    <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
                  )}
                </button>

                {aberto && (
                  <div className="border-t border-neutral-700 p-4 space-y-3">
                    {cliente.observacoes && (
                      <p className="text-sm text-neutral-400 italic">{cliente.observacoes}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-300">Motos</span>
                      <button
                        onClick={() => abrirNovaMoto(cliente.id)}
                        className="flex items-center gap-1 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar moto
                      </button>
                    </div>

                    {motos.length === 0 ? (
                      <p className="text-sm text-neutral-500">Nenhuma moto cadastrada.</p>
                    ) : (
                      <ul className="space-y-2">
                        {motos.map((moto) => (
                          <li
                            key={moto.id}
                            className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-700 p-3"
                          >
                            <Bike className="w-5 h-5 text-orange-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-100">
                                {moto.placa}
                                {moto.modelo && ` · ${moto.modelo}`}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {moto.marca ?? '—'}
                                {moto.ano && ` · ${moto.ano}`}
                                {moto.cor && ` · ${moto.cor}`}
                                {` · ${moto.km_atual.toLocaleString('pt-BR')} km`}
                              </p>
                            </div>
                            <button
                              onClick={() => abrirEditarMoto(moto)}
                              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => abrirEditarCliente(cliente)}
                      className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar cliente
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {modalCliente && (
        <ModalCliente
          form={modalCliente}
          setForm={setModalCliente}
          salvando={salvando}
          erro={erro}
          onSubmit={salvarCliente}
          onFechar={() => setModalCliente(null)}
        />
      )}

      {modalMoto && (
        <ModalMoto
          form={modalMoto}
          setForm={setModalMoto}
          salvando={salvando}
          erro={erro}
          onSubmit={salvarMoto}
          onFechar={() => setModalMoto(null)}
        />
      )}
    </div>
  );
}

function ModalCliente({
  form,
  setForm,
  salvando,
  erro,
  onSubmit,
  onFechar,
}: {
  form: FormCliente;
  setForm: (f: FormCliente | null) => void;
  salvando: boolean;
  erro: string | null;
  onSubmit: (e: FormEvent) => void;
  onFechar: () => void;
}) {
  const podeSalvar = form.nome.trim().length >= 2;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onFechar}>
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-neutral-800 border border-neutral-700 p-6 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-100">
            {form.id ? 'Editar cliente' : 'Novo cliente'}
          </h2>
          <button onClick={onFechar} className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-neutral-200 mb-2">Nome</label>
            <input
n            </div>