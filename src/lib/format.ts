export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarTelefone(digitos: string): string {
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return digitos;
}

export function normalizarPlaca(valor: string): string {
  return valor.toUpperCase().replace(/\s+/g, '').trim();
}

export function formatarPlaca(valor: string): string {
  const limpo = valor.toUpperCase().replace(/\s+/g, '');
  if (limpo.length <= 3) return limpo;
  return `${limpo.slice(0, 3)}${limpo.slice(3)}`;
}

export function traduzirErroAuth(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente entrar.';
  }
  if (m.includes('password') && (m.includes('weak') || m.includes('at least'))) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return 'Digite um e-mail válido.';
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Sem conexão. Verifique sua internet e tente de novo.';
  }
  return 'Não deu certo. Verifique os dados e tente de novo.';
}
