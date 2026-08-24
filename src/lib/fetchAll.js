import { supabase } from "../supabaseClient";

const PAGE_SIZE = 1000;

/**
 * Récupère TOUTES les lignes d'une table Supabase.
 * Sans pagination explicite, Supabase plafonne silencieusement à 1000 lignes.
 *
 * @param {string} table
 * @param {{ orderBy?: string[] }} options colonnes de tri, ascendant
 * @returns {Promise<object[]>}
 */
export async function fetchAll(table, { orderBy = ["id"] } = {}) {
  const rows = [];
  let from = 0;

  for (;;) {
    let query = supabase.from(table).select("*");
    for (const column of orderBy) {
      query = query.order(column, { ascending: true });
    }

    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
