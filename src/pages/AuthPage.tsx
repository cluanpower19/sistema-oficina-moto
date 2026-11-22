import { useState, type FormEvent } from 'react';
import { Wrench, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { traduzirErroAuth } from '@/lib/format';

type Modo = 'login' | 'cadastro';

export default function AuthPage() {
  const { entrar, entrarComGoogle, cadastrar } = useAuth();
  const [modo, setModo] = useState<Modo>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [googleEnviando, setGoogleEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const msg = modo === 'login' ? await entrar(email.trim(), senha) : await cadastrar(email.trim(), senha);
      if (msg) setErro(traduzirErroAuth(msg));
    } finally {
      setEnviando(false);
    }
  }

  async function handleClickGoogle() {
    setErro(null);
    setGoogleEnviando(true);
    try {
      const msg = await entrarComGoogle();
      if (msg) {
        setErro(traduzirErroAuth(msg));
        setGoogleEnviando(false);
      }
      // Se deu certo, o navegador segue para o Google; sem reset do loading.
    } finally {
      setGoogleEnviando(false);
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
              : 'Crie sua conta: depois você completa os dados da oficina.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 rounded-2xl p-6 space-y-5 border border-neutral-700"
        >
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
            disabled={enviando || googleEnviando}
            className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 text-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            {enviando && <LoaderCircle className="w-5 h-5 animate-spin" />}
            {enviando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-600" />
            <span className="text-sm text-neutral-400">ou</span>
            <div className="flex-1 h-px bg-neutral-600" />
          </div>

          <button
            type="button"
            onClick={handleClickGoogle}
            disabled={enviando || googleEnviando}
            className="w-full h-14 rounded-xl bg-neutral-100 hover:bg-white active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 text-lg font-bold transition-colors flex items-center justify-center gap-3"
          >
            {googleEnviando ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcone />
            )}
            Continuar com Google
          </button>

          <div className="text-center text-base">
            {modo === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setModo('cadastro');
                  setErro(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Ainda não tem conta? <u>Cadastre-se</u>
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

function GoogleIcone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.16 9.14 5.38 12 5.38z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.15-1.99 3.74-4.93 3.74-8.67z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L2.18 7.07C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.68-2.85c-1.02.68-2.29 1.09-3.6 1.09-2.86 0-5.29-1.78-6.16-4.29l-3.66 2.84C3.99 20.53 7.7 23 12 23z"
      />
    </svg>
  );
}
