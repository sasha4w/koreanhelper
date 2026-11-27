import { supabase } from "../supabaseClient";
import { fetchAll } from "./fetchAll";
import { diffForServer, emptySnapshot, rowsToState, snapshotOf } from "./progressRows";
import {
  GUEST_KEY,
  clearStore,
  getState,
  mergeStates,
  peekStore,
  replaceState,
  subscribe,
  switchStore,
} from "./progress";

/**
 * Synchronisation de la progression avec Supabase.
 *
 * Tables (voir supabase/migrations) :
 *   user_progress_items  1 ligne par élément révisé
 *   user_stats           série de jours
 *   user_history         activité quotidienne
 * Écritures via la fonction sync_progress(), qui ignore toute donnée plus
 * ancienne que celle en base.
 *
 * À la connexion :
 *   1. on bascule sur le cache local du compte
 *   2. on fusionne : cache du compte + serveur + progression invité
 *   3. on vide la progression invité (elle appartient maintenant au compte)
 *   4. on envoie au serveur ce qu'il n'a pas
 * Ensuite, seules les lignes modifiées sont envoyées (regroupées sur 1,5 s).
 *
 * Hors ligne ou en erreur, l'app continue en local ; l'envoi suivant
 * reprend tout ce qui n'a pas encore été accepté.
 */

const PUSH_DELAY = 1500;
const userKey = (id) => `${GUEST_KEY}:user:${id}`;

let currentUser = null;
let unsubscribe = null;
let timer = null;
let applying = false;
// Ce que le serveur a déjà (pour n'envoyer que la différence)
let synced = emptySnapshot();


/* ── Statut observable (affiché sur la page Compte) ── */
let status = { state: "idle", at: null, error: null };
const statusListeners = new Set();
function setStatus(next) {
  status = { ...status, ...next };
  statusListeners.forEach((fn) => fn(status));
}
export function getSyncStatus() {
  return status;
}
export function subscribeSyncStatus(fn) {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

/* ───────────────── Réseau ───────────────── */

async function fetchRemote() {
  const [items, history, statsRes] = await Promise.all([
    fetchAll("user_progress_items", { orderBy: ["item_key"] }),
    fetchAll("user_history", { orderBy: ["day"] }),
    supabase.from("user_stats").select("*").maybeSingle(),
  ]);
  if (statsRes.error) throw statsRes.error;
  return rowsToState({ items, history, stats: statsRes.data });
}

async function push() {
  if (!currentUser) return;
  clearTimeout(timer);
  timer = null;

  const state = getState();
  const diff = diffForServer(state, synced);
  if (!diff.items.length && !diff.history.length && !diff.stats) {
    setStatus({ state: "synced", at: Date.now(), error: null });
    return;
  }

  setStatus({ state: "syncing" });
  const { error } = await supabase.rpc("sync_progress", {
    p_items: diff.items,
    p_stats: diff.stats,
    p_history: diff.history,
  });
  if (error) {
    setStatus({ state: "error", error: error.message });
    return;
  }
  synced = snapshotOf(state);
  setStatus({ state: "synced", at: Date.now(), error: null });
}

function schedulePush() {
  if (applying || !currentUser) return;
  clearTimeout(timer);
  timer = setTimeout(push, PUSH_DELAY);
}

/* ───────────────── Cycle de vie ───────────────── */

/** À appeler quand une session s'ouvre (ou au chargement si déjà connecté). */
export async function startSync(userId) {
  if (!userId || userId === currentUser) return;
  if (currentUser) await stopSync();

  currentUser = userId;
  synced = emptySnapshot();
  const guest = peekStore(GUEST_KEY);
  switchStore(userKey(userId));
  setStatus({ state: "syncing", error: null });

  try {
    const remote = await fetchRemote();
    if (currentUser !== userId) return; // déconnecté entre-temps
    synced = snapshotOf(remote);
    applying = true;
    replaceState(mergeStates(mergeStates(getState(), remote), guest));
    applying = false;
    clearStore(GUEST_KEY);
    await push();
  } catch (err) {
    applying = false;
    // Hors ligne : on garde le cache local + invité ; tout sera renvoyé
    replaceState(mergeStates(getState(), guest));
    clearStore(GUEST_KEY);
    setStatus({ state: "error", error: err?.message || String(err) });
  }

  unsubscribe = subscribe(schedulePush);
}

/** À appeler à la déconnexion. */
export async function stopSync() {
  if (!currentUser) return;
  if (timer) await push();
  unsubscribe?.();
  unsubscribe = null;
  currentUser = null;
  synced = emptySnapshot();
  switchStore(GUEST_KEY);
  setStatus({ state: "idle", at: null, error: null });
}

/** Force un envoi immédiat (bouton « Synchroniser »). */
export function syncNow() {
  return push();
}
