import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { startSync, stopSync } from "../progressSync";

/**
 * Session Supabase (email + mot de passe) et synchronisation de la
 * progression. Sans compte, l'app fonctionne en mode invité (localStorage).
 */

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  recovering: false,
  requestPasswordReset: async () => ({}),
  updatePassword: async () => ({}),
});

/** Messages Supabase les plus courants, en français. */
function frError(error) {
  const msg = error?.message || "";
  if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/email not confirmed/i.test(msg)) return "Confirme d'abord ton adresse email (lien reçu par mail).";
  if (/already registered|already been registered/i.test(msg)) return "Un compte existe déjà avec cet email.";
  if (/password should be at least/i.test(msg)) return "Le mot de passe doit faire au moins 6 caractères.";
  if (/should be different from the old/i.test(msg)) return "Le nouveau mot de passe doit être différent de l'ancien.";
  if (/expired|invalid.*(token|link)|otp/i.test(msg)) return "Le lien a expiré ou n'est plus valide. Redemande un lien de réinitialisation.";
  if (/auth session missing/i.test(msg)) return "Session expirée. Redemande un lien de réinitialisation.";
  if (/error sending .*email/i.test(msg)) return "L'email n'a pas pu être envoyé. Réessaie plus tard.";
  if (/rate limit/i.test(msg)) return "Trop de tentatives, réessaie dans quelques minutes.";
  if (/failed to fetch|network/i.test(msg)) return "Impossible de joindre le serveur. Vérifie ta connexion.";
  return msg || "Une erreur est survenue.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Vrai quand l'utilisateur arrive via le lien "mot de passe oublié" :
  // Supabase ouvre une session, mais il doit d'abord choisir un nouveau mot de passe.
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const u = data.session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) startSync(u.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
      setUser(u);
      if (u) startSync(u.id);
      else stopSync();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: frError(error) } : {};
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: frError(error) };
    // Email déjà inscrit (et confirmé) : Supabase renvoie un faux succès,
    // sans erreur ni mail, avec une liste `identities` vide.
    if (data.user && data.user.identities?.length === 0) {
      return { error: "Un compte existe déjà avec cet email. Connecte-toi, ou utilise « Mot de passe oublié ? »." };
    }
    // Confirmation email activée côté Supabase : pas de session immédiate
    return data.session ? {} : { needsConfirmation: true };
  }, []);

  const signOut = useCallback(async () => {
    await stopSync(); // envoie ce qui reste tant que la session est valide
    await supabase.auth.signOut();
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/compte`,
    });
    // Supabase répond déjà OK pour un email inconnu : afficher l'erreur ne
    // révèle pas quels comptes existent, et rend visibles les échecs d'envoi.
    return error ? { error: frError(error) } : {};
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: frError(error) };
    setRecovering(false);
    return {};
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      recovering,
      requestPasswordReset,
      updatePassword,
    }),
    [user, loading, signIn, signUp, signOut, recovering, requestPasswordReset, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
