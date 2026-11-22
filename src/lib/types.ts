export type Papel = 'dono' | 'mecanico';

export interface Oficina {
  id: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  logo_url: string | null;
  plano: 'basico' | 'completo';
  status_assinatura: 'teste' | 'ativa' | 'inadimplente' | 'bloqueada';
  criado_em: string;
}

export interface Usuario {
  id: string;
  oficina_id: string;
  nome: string;
  papel: Papel;
  criado_em: string;
}

export interface Perfil {
  usuario: Usuario;
  oficina: Oficina;
}

export interface Cliente {
  id: string;
  oficina_id: string;
  nome: string;
  telefone: string | null;
  observacoes: string | null;
  criado_em: string;
}

export interface Moto {
  id: string;
  oficina_id: string;
  cliente_id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  cor: string | null;
  km_atual: number;
  criado_em: string;
}

export interface ClienteComMotos extends Cliente {
  motos: Moto[];
}
