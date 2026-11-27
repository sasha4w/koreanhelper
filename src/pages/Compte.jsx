import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthProvider";
import {
  getSyncStatus,
  subscribeSyncStatus,
  syncNow,
} from "../lib/progressSync";
import { BarChart, Cloud, LogOut, User } from "../components/Icon";
import "./Compte.css";

export default function Compte() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Chargement…</div>;
  return user ? <Account user={user} /> : <AuthForm />;
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
  const { signIn, signUp } = useAuth();
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
      mode === "signin"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);
    if (res.error) setError(res.error);
    else if (res.needsConfirmation)
      setInfo("Compte créé ! Clique sur le lien reçu par email pour l'activer, puis connecte-toi.");
  };

  return (
    <div className="stack loose account">
      <header className="account-hero">
        <span className="account-avatar guest">
          <User />
        </span>
        <h2>{mode === "signin" ? "Connexion" : "Créer un compte"}</h2>
        <p className="subtitle">
          Retrouve ta progression sur tous tes appareils. Ce que tu as déjà
          fait en invité est conservé.
        </p>
      </header>

      <div className="segmented-row">
        <div className="segmented">
          <button
            type="button"
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Inscription
          </button>
        </div>
      </div>

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
        <label>
          <span>Mot de passe</span>
          <input
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="account-msg error">{error}</p>}
        {info && <p className="account-msg info">{info}</p>}

        <button type="submit" className="btn primary block" disabled={busy}>
          {busy
            ? "Un instant…"
            : mode === "signin"
              ? "Se connecter"
              : "Créer mon compte"}
        </button>
      </form>

      <p className="account-note">
        Sans compte, l'app reste utilisable : ta progression est alors gardée
        dans ce navigateur uniquement.
      </p>
    </div>
  );
}
