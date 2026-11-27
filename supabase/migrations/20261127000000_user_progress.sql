-- ============================================================
-- Progression persistante par utilisateur (schéma normalisé)
--
--   auth.users            comptes (géré par Supabase Auth)
--   user_progress_items   1 ligne par utilisateur × élément révisé
--                         (mot « vocab:12 », leçon « verbes:3 », exercice…)
--   user_stats            1 ligne par utilisateur : série de jours
--   user_history          1 ligne par utilisateur × jour : activité
--
-- Les écritures passent par la fonction sync_progress(), qui ne garde
-- jamais une donnée plus ancienne que celle déjà en base (plusieurs
-- appareils peuvent donc synchroniser sans s'écraser).
-- ============================================================

/* ── Éléments révisés ── */
create table if not exists public.user_progress_items (
  user_id   uuid        not null default auth.uid()
                        references auth.users (id) on delete cascade,
  item_key  text        not null check (item_key ~ '^[a-z_]+:.+$'),
  box       smallint    not null default 1 check (box between 1 and 5),
  seen      integer     not null default 0 check (seen >= 0),
  correct   integer     not null default 0 check (correct >= 0),
  wrong     integer     not null default 0 check (wrong >= 0),
  last_seen timestamptz,
  primary key (user_id, item_key)
);

create index if not exists user_progress_items_due_idx
  on public.user_progress_items (user_id, box, last_seen);

/* ── Série de jours ── */
create table if not exists public.user_stats (
  user_id        uuid        primary key default auth.uid()
                             references auth.users (id) on delete cascade,
  streak_current integer     not null default 0 check (streak_current >= 0),
  streak_best    integer     not null default 0 check (streak_best >= 0),
  last_day       date,
  updated_at     timestamptz not null default now()
);

/* ── Activité quotidienne ── */
create table if not exists public.user_history (
  user_id uuid    not null default auth.uid()
                  references auth.users (id) on delete cascade,
  day     date    not null,
  count   integer not null default 0 check (count >= 0),
  score   integer not null default 0 check (score >= 0),
  primary key (user_id, day)
);

/* ── Sécurité : chacun ne voit et ne modifie que ses lignes ── */
alter table public.user_progress_items enable row level security;
alter table public.user_stats          enable row level security;
alter table public.user_history        enable row level security;

drop policy if exists "own_rows" on public.user_progress_items;
create policy "own_rows" on public.user_progress_items
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_rows" on public.user_stats;
create policy "own_rows" on public.user_stats
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_rows" on public.user_history;
create policy "own_rows" on public.user_history
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

/* ── Synchronisation ──
   p_items   : [{ key, box, seen, correct, wrong, lastSeen (ms) }, …]
   p_stats   : { current, best, lastDay } ou null
   p_history : [{ day, count, score }, …]
   SECURITY INVOKER : la fonction s'exécute avec les droits (et la RLS)
   de l'utilisateur connecté. */
create or replace function public.sync_progress(
  p_items   jsonb default '[]'::jsonb,
  p_stats   jsonb default null,
  p_history jsonb default '[]'::jsonb
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'non connecté';
  end if;

  -- Un élément n'est remplacé que par une version vue plus récemment
  insert into user_progress_items as t
    (user_id, item_key, box, seen, correct, wrong, last_seen)
  select
    auth.uid(),
    i->>'key',
    least(greatest(coalesce((i->>'box')::int, 1), 1), 5),
    coalesce((i->>'seen')::int, 0),
    coalesce((i->>'correct')::int, 0),
    coalesce((i->>'wrong')::int, 0),
    -- millisecondes exactes (pas d'arrondi flottant)
    case when i->>'lastSeen' is not null
      then timestamptz 'epoch' + (i->>'lastSeen')::bigint * interval '1 millisecond' end
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as i
  where i->>'key' is not null
  on conflict (user_id, item_key) do update set
    box       = excluded.box,
    seen      = excluded.seen,
    correct   = excluded.correct,
    wrong     = excluded.wrong,
    last_seen = excluded.last_seen
  where t.last_seen is null
     or excluded.last_seen >= t.last_seen;

  -- Série : la plus récente gagne, le record ne baisse jamais
  if p_stats is not null then
    insert into user_stats as t (user_id, streak_current, streak_best, last_day, updated_at)
    values (
      auth.uid(),
      coalesce((p_stats->>'current')::int, 0),
      coalesce((p_stats->>'best')::int, 0),
      (p_stats->>'lastDay')::date,
      now()
    )
    on conflict (user_id) do update set
      streak_current = case
        when t.last_day is null or excluded.last_day >= t.last_day
          then excluded.streak_current else t.streak_current end,
      last_day = greatest(t.last_day, excluded.last_day),
      streak_best = greatest(t.streak_best, excluded.streak_best, excluded.streak_current),
      updated_at = now();
  end if;

  -- Activité : par jour, on garde la valeur la plus complète
  insert into user_history as t (user_id, day, count, score)
  select auth.uid(), (h->>'day')::date,
         coalesce((h->>'count')::int, 0), coalesce((h->>'score')::int, 0)
  from jsonb_array_elements(coalesce(p_history, '[]'::jsonb)) as h
  where h->>'day' is not null
  on conflict (user_id, day) do update set
    count = excluded.count,
    score = excluded.score
  where excluded.count > t.count;
end;
$$;

revoke all on function public.sync_progress(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.sync_progress(jsonb, jsonb, jsonb) to authenticated;

-- Rendre les nouvelles tables visibles tout de suite par l'API
notify pgrst, 'reload schema';
