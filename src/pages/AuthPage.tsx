import { useState, type FormEvent } from 'react';
import { Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apenasDigitos, formatarTelefone, traduzirErroAuth } from '@/lib/format';

type Modo = 'login' | 'cadastro-conta' | 'cadastro-oficina';

export default function AuthPage() {
  const { entrar, cadastrar } = useAuth();
  const [modo, setModo] = useState<Modo>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeOficina, setNomeOficina] = useState('');
  const [telDigitos, setTelDigitos] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const podeAvancarCadastro =
    nomeUsuario.trim().length >= 2 &&
    nomeOficina.trim().length >= 2 &&
    telDigitos.length >= 10;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (modo === 'login') {
        const msg = await entrar(email.trim(), senha);
        if (msg) setErro(traduzirErroAuth(msg));
        return;
      }
      if (modo === 'cadastro-conta') {
        if (senha.length < 6) {
          setErro('A senha precisa ter pelo menos 6 caracteres.');
          return;
        }
        setModo('cadastro-oficina');
        return;
      }
      const msg = await cadastrar({
        email: email.trim(),
        senha,
        nomeUsuario: nomeUsuario.trim(),
        nomeOficina: nomeOficina.trim(),
        telefoneOficina: telDigitos,
      });
      if (msg) setErro(traduzirErroAuth(msg));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-neutral-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-100 text-center leading-tight">
            Sistema para Oficinas de Moto
          </h1>
          <p className="text-neutral-400 mt-1 text-center">
            {modo === 'login'
              ? 'Entre com sua conta para acessar o painel.'
              : modo === 'cadastro-conta'
                ? 'Crie sua conta em dois passos rápidos.'
                : 'Agora, fale sobre a sua oficina.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 rounded-2xl p-6 space-y-5 border border-neutral-700"
        >
          {modo === 'cadastro-oficina' && (
            <>
              <div>
                <label htmlFor="nomeUsuario" className="block text-base font-medium text-neutral-200 mb-2">
                  Seu nome
                </label>
                <input
                  id="nomeUsuario"
                  type="text"
                  required
                  autoComplete="name"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  placeholder="Ex.: João da Silva"
                  className="w-full h-14 px-4 rounded-xl bg-neutral-900 border border-neutral-600 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label htmlFor="nomeOficina" className="block text-base font-medium text-neutral-200 mb-2">
                  Nome da oficina
                </label>
                <input
                  id="nomeOficina"
                  type="text"
                  required
                  value={nomeOficina}
                  onChange={(e) => setNomeOficina(e.target.value)}
                  placeholder="Ex.: Oficina do João"
                  className="w-full h-14 px-4 rounded-xl bg-neutral-900 border border-neutral-600 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-base font-medium text-neutral-200 mb-2">
                  Telefone da oficina (com DDD)
                </label>
                <input
                  id="telefone"
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formatarTelefone(telDigitos)}
                  onChange={(e) => setTelDigitos(apenasDigitos(e.target.value).slice(0, 11))}
                  placeholder="(11) 99999-9999"
                  className="w-full h-14 px-4 rounded-xl bg-neutral-900 border border-neutral-600 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </>
          )}

          {modo !== 'cadastro-oficina' && (
            <>
              <div>
                <label htmlFor="email" className="block text-base font-medium text-neutral-200 mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full h-14 px-4 rounded-xl bg-neutral-900 border border-neutral-600 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label htmlFor="senha" className="block text-base font-medium text-neutral-200 mb-2">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full h-14 px-4 rounded-xl bg-neutral-900 border border-neutral-600 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </>
          )}

          {erro && (
            <p
              role="alert"
              className="rounded-xl bg-red-950 border border-red-800 text-red-200 px-4 py-3 text-base"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || (modo === 'cadastro-oficina' && !podeAvancarCadastro)}
            className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 text-lg font-bold transition-colors"
          >
            {enviando
              ? 'Aguarde...'
              : modo === 'login'
                ? 'Entrar'
                : modo === 'cadastro-conta'
                  ? 'Continuar'
                  : 'Criar conta e oficina'}
          </button>

          <div className="text-center text-base">
            {modo === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setModo('cadastro-conta');
                  setErro(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Ainda não tem conta? <u>Cadastre sua oficina</u>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setModo('login');
                  setErro(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Já tem conta? <u>Entrar</u>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
