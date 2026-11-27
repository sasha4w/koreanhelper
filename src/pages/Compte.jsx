import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthProvider";
import {
  getSyncStatus,
  subscribeSyncStatus,
  syncNow,
} from "../lib/progressSync";
import { BarChart, Cloud, Eye, EyeOff, LogOut, User } from "../components/Icon";
import "./Compte.css";

/** Champ mot de passe avec un bouton œil pour afficher / masquer la saisie. */
function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </span>
  );
}

export default function Compte() {
  const { user, loading, recovering } = useAuth();
  if (loading) return <div className="loader">Chargement…</div>;
  if (user && recovering) return <NewPasswordForm />;
  return user ? <Account user={user} /> : <AuthForm />;
}

/* ───────────────── Nouveau mot de passe (lien de réinitialisation) ───────────────── */

function NewPasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    const res = await updatePassword(password);
    setBusy(false);
    if (res.error) setError(res.error);
    // Succès : recovering repasse à false, la page affiche le compte.
  };

  return (
    <div className="stack loose account">
      <header className="account-hero">
        <span className="account-avatar guest">
          <User />
        </span>
        <h2>Nouveau mot de passe</h2>
        <p className="subtitle">Choisis un nouveau mot de passe pour ton compte.</p>
      </header>

      <form className="account-form" onSubmit={submit}>
        <label>
          <span>Nouveau mot de passe</span>
          <PasswordInput
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          <span>Confirmer le mot de passe</span>
          <PasswordInput
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        {error && <p className="account-msg error">{error}</p>}

        <button type="submit" className="btn primary block" disabled={busy}>
          {busy ? "Un instant…" : "Enregistrer le mot de passe"}
        </button>
      </form>
    </div>
  );
}

/* ───────────────── Connecté ───────────────── */

function Account({ user }) {
  const { signOut } = useAuth();
  const [status, setStatus] = useState(getSyncStatus);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeSyncStatus(setStatus), []);

  const label =
    status.state === "syncing"
      ? "Synchronisation…"
      : status.state === "error"
        ? `Échec de synchronisation : ${status.error}`
        : status.at
          ? `Synchronisé à ${new Date(status.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
          : "En attente";

  return (
    <div className="stack loose account">
      <header className="account-hero">
        <span className="account-avatar">
          {(user.email || "?").slice(0, 1).toUpperCase()}
        </span>
        <h2>Mon compte</h2>
        <p className="subtitle">{user.email}</p>
      </header>

      <div className={`account-sync ${status.state}`} role="status">
        <Cloud />
        <span>{label}</span>
        <button
          type="button"
          className="btn ghost"
          onClick={() => syncNow()}
          disabled={status.state === "syncing"}
        >
          Synchroniser
        </button>
      </div>

      <p className="account-note">
        Ta progression est enregistrée sur ton compte : tu la retrouves sur
        tous tes appareils.
      </p>

      <Link to="/progres" className="btn primary block">
        <BarChart /> Voir ma progression
      </Link>
      <button
        type="button"
        className="btn secondary block"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await signOut();
          setBusy(false);
        }}
      >
        <LogOut /> Se déconnecter
      </button>
    </div>
  );
}

/* ───────────────── Connexion / inscription ───────────────── */

function AuthForm() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const res =
      mode === "forgot"
        ? await requestPasswordReset(email.trim())
        : mode === "signin"
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);
    setBusy(false);
    if (res.error) setError(res.error);
    else if (mode === "forgot")
      setInfo("Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.");
    else if (res.needsConfirmation)
      setInfo("Compte créé ! Clique sur le lien reçu par email pour l'activer, puis connecte-toi.");
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const title =
    mode === "forgot" ? "Mot de passe oublié" : mode === "signin" ? "Connexion" : "Créer un compte";
  const submitLabel =
    mode === "forgot" ? "Envoyer le lien" : mode === "signin" ? "Se connecter" : "Créer mon compte";

  return (
    <div className="stack loose account">
      <header className="account-hero">
        <span className="account-avatar guest">
          <User />
        </span>
        <h2>{title}</h2>
        <p className="subtitle">
          {mode === "forgot"
            ? "Entre ton email : tu recevras un lien pour choisir un nouveau mot de passe."
            : "Retrouve ta progression sur tous tes appareils. Ce que tu as déjà fait en invité est conservé."}
        </p>
      </header>

      {mode !== "forgot" && (
      <div className="segmented-row">
        <div className="segmented">
          <button
            type="button"
            className={mode === "signin" ? "active" : ""}
            onClick={() => switchMode("signin")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            Inscription
          </button>
        </div>
      </div>
      )}

      <form className="account-form" onSubmit={submit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {mode !== "forgot" && (
          <label>
            <span>Mot de passe</span>
            <PasswordInput
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}

        {mode === "signin" && (
          <button type="button" className="account-link" onClick={() => switchMode("forgot")}>
            Mot de passe oublié ?
          </button>
        )}

        {error && <p className="account-msg error">{error}</p>}
        {info && <p className="account-msg info">{info}</p>}

        <button type="submit" className="btn primary block" disabled={busy}>
          {busy ? "Un instant…" : submitLabel}
        </button>

        {mode === "forgot" && (
          <button type="button" className="account-link center" onClick={() => switchMode("signin")}>
            Retour à la connexion
          </button>
        )}
      </form>

      <p className="account-note">
        Sans compte, l'app reste utilisable : ta progression est alors gardée
        dans ce navigateur uniquement.
      </p>
    </div>
  );
}
