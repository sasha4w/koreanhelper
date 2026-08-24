import { useEffect, useSyncExternalStore } from "react";
import { fetchAll } from "../lib/fetchAll";

/**
 * Petit store externe : chaque table est chargée une fois puis partagée entre
 * les pages. Les snapshots sont des objets stables, ce qui permet aux useMemo
 * consommateurs de ne pas se recalculer à chaque rendu.
 */

const EMPTY_ROWS = Object.freeze([]);
const LOADING = { data: EMPTY_ROWS, loading: true, error: null };

const ORDERS = {
  vocabulaire: ["chapitre", "partie", "id"],
  verbes: ["level", "id"],
  grammaire: ["level", "id"],
  exercices: ["level", "id"],
};

const store = new Map(); // table -> { data, loading, error }
const inflight = new Set();
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function snapshot(table) {
  return store.get(table) || LOADING;
}

function load(table) {
  if (!table || inflight.has(table)) return;
  const current = store.get(table);
  if (current && !current.loading) return; // déjà résolu (succès ou erreur)

  inflight.add(table);
  fetchAll(table, { orderBy: ORDERS[table] || ["id"] })
    .then((rows) => {
      store.set(table, { data: rows, loading: false, error: null });
    })
    .catch((error) => {
      console.error(`Erreur de chargement de "${table}" :`, error);
      store.set(table, { data: EMPTY_ROWS, loading: false, error });
    })
    .finally(() => {
      inflight.delete(table);
      emit();
    });
}

/**
 * Charge une table Supabase entière (cache partagé).
 * @returns {{ data: object[], loading: boolean, error: Error|null }}
 */
export function useTable(table) {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot(table),
    () => LOADING,
  );

  useEffect(() => {
    load(table);
  }, [table]);

  return state;
}

/**
 * Charge plusieurs tables en parallèle.
 * @param {string[]} tables
 * @returns {{ data: Record<string, object[]>, loading: boolean, error: Error|null }}
 */
export function useTables(tables) {
  const key = tables.join(",");

  const state = useSyncExternalStore(
    subscribe,
    () => combined(key),
    () => combined(key),
  );

  useEffect(() => {
    key.split(",").forEach(load);
  }, [key]);

  return state;
}

/** Snapshot combiné mémorisé : indispensable pour useSyncExternalStore. */
const combinedCache = new Map(); // key -> { signature, value }

function combined(key) {
  const tables = key.split(",");
  const states = tables.map(snapshot);
  const signature = states.map((s) => `${s.loading}:${s.data.length}`).join("|");

  const cached = combinedCache.get(key);
  if (cached && cached.signature === signature) return cached.value;

  const value = {
    data: Object.fromEntries(tables.map((t, i) => [t, states[i].data])),
    loading: states.some((s) => s.loading),
    error: states.find((s) => s.error)?.error || null,
  };
  combinedCache.set(key, { signature, value });
  return value;
}

export function clearTableCache(table) {
  if (table) store.delete(table);
  else store.clear();
  combinedCache.clear();
  emit();
}
