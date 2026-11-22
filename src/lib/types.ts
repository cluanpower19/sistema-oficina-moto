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
