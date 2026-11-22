import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Perfil } from '@/lib/types';

interface AuthContexto {
  session: Session | null;
  perfil: Perfil | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<string | null>;
  cadastrar: (dados: {
    email: string;
    senha: string;
    nomeUsuario: string;
    nomeOficina: string;
    telefoneOficina: string;
  }) => Promise<string | null>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContexto | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(async (userId: string) => {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*, oficina:oficinas(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error || !usuario || !usuario.oficina) {
      setPerfil(null);
      return;
    }
    setPerfil({ usuario, oficina: usuario.oficina });
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (data.session) {
          (async () => {
            await carregarPerfil(data.session!.user.id);
            setCarregando(false);
          })();
        } else {
          setCarregando(false);
        }
      })
      .catch(() => setCarregando(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSession) => {
      setSession(novaSession);
      if (novaSession) {
        (async () => {
          await carregarPerfil(novaSession.user.id);
        })();
      } else {
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [carregarPerfil]);

  const entrar = useCallback(
    async (email: string, senha: string): Promise<string | null> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) return error.message;
      if (data.session) {
        await carregarPerfil(data.session.user.id);
      }
      return null;
    },
    [carregarPerfil]
  );

  const cadastrar = useCallback(
    async (dados: {
      email: string;
      senha: string;
      nomeUsuario: string;
      nomeOficina: string;
      telefoneOficina: string;
    }): Promise<string | null> => {
      const { data, error } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
      });
      if (error) return error.message;
      if (!data.session || !data.user) {
        return 'Cadastro feito, mas faltou confirmar o e-mail. Faça login.';
      }

      const userId = data.user.id;
      const oficinaId = crypto.randomUUID();

      const { error: erroOficina } = await supabase.from('oficinas').insert({
        id: oficinaId,
        nome: dados.nomeOficina,
        telefone: dados.telefoneOficina,
      });
      if (erroOficina) return erroOficina.message;

      const { error: erroUsuario } = await supabase.from('usuarios').insert({
        id: userId,
        oficina_id: oficinaId,
        nome: dados.nomeUsuario,
        papel: 'dono',
      });
      if (erroUsuario) return erroUsuario.message;

      await carregarPerfil(userId);
      return null;
    },
    [carregarPerfil]
  );

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    setSession(null);
  }, []);

  const valor = useMemo(
    () => ({ session, perfil, carregando, entrar, cadastrar, sair }),
    [session, perfil, carregando, entrar, cadastrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return ctx;
}
