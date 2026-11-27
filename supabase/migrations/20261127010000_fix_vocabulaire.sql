-- ============================================================
-- Corrections de la table `vocabulaire`
--
-- Rejouable sans risque : chaque UPDATE vérifie l'ancienne valeur
-- (`and hangul = '…'`), donc une 2ᵉ exécution ne change rien.
-- Les `id` ne changent pas : la progression (vocab:<id>) est conservée.
--
-- Les mots présents dans deux chapitres avec le même sens (의사, 여권…)
-- sont volontairement gardés : chacun appartient à son chapitre. L'app
-- évite déjà qu'ils apparaissent ensemble dans un même exercice.
-- ============================================================

begin;

/* ── 1. Homonymes : un contexte entre parenthèses les distingue ──
   Même convention que « (파일을) 저장하다 ». Le contexte est facultatif
   à la saisie (« 쓰다 » est accepté) et ignoré par la conjugaison. */

-- 쓰다 : écrire / utiliser / porter / amer
update public.vocabulaire set hangul = '(글을) 쓰다'                                    where id = 42   and hangul = '쓰다';
update public.vocabulaire set hangul = '(물건을) 쓰다'                                  where id = 206  and hangul = '쓰다';
update public.vocabulaire set hangul = '(모자를) 쓰다'                                  where id = 576  and hangul = '쓰다';
update public.vocabulaire set hangul = '(맛이) 쓰다'                                    where id = 693  and hangul = '쓰다';

-- 뒤 : derrière (lieu) / après (temps)
update public.vocabulaire set hangul = '(장소) 뒤', fr = 'derrière (lieu)'               where id = 52   and hangul = '뒤';
update public.vocabulaire set hangul = '(시간) 뒤', fr = 'après (dans le temps)'         where id = 174  and hangul = '뒤';

-- 하다 : faire / porter un accessoire
update public.vocabulaire set hangul = '(목걸이를) 하다', fr = 'porter (un accessoire)'  where id = 577  and hangul = '하다';

-- 묻다 : être taché / demander (conjugaisons différentes : 묻어요 / 물어요)
update public.vocabulaire set hangul = '(얼룩이) 묻다', fr = 'être taché(e) (une tache reste)' where id = 181 and hangul = '묻다';
update public.vocabulaire set hangul = '(길을) 묻다', fr = 'demander (une question, son chemin)' where id = 403 and hangul = '묻다';

-- 굽다 : griller (ㅂ irrégulier : 구워요) — pas d'homonyme en base, mais le
-- contexte permet à l'app de le conjuguer (« se courber » serait 굽어요)
update public.vocabulaire set hangul = '(고기를) 굽다'                                  where id = 908  and hangul = '굽다';

-- 보이다 : être visible / montrer
update public.vocabulaire set hangul = '(눈에) 보이다', fr = 'être visible / se voir'    where id = 246  and hangul = '보이다';
update public.vocabulaire set hangul = '(사진을) 보이다', fr = 'montrer'                 where id = 810  and hangul = '보이다';

-- 만 : dix mille / seulement (particule)
update public.vocabulaire set hangul = '(숫자) 만'                                      where id = 286  and hangul = '만';
update public.vocabulaire set hangul = '(조사) 만', fr = 'seulement (particule)'         where id = 359  and hangul = '만';

-- 내다 : rendre un devoir / payer
update public.vocabulaire set hangul = '(숙제를) 내다', fr = 'rendre / soumettre (un devoir)' where id = 385 and hangul = '내다';
update public.vocabulaire set hangul = '(돈을) 내다'                                    where id = 1137 and hangul = '내다';

-- 새 : oiseau / nouveau
update public.vocabulaire set hangul = '(동물) 새'                                      where id = 446  and hangul = '새';
update public.vocabulaire set hangul = '(관형사) 새'                                    where id = 604  and hangul = '새';

-- 세우다 : établir un plan / arrêter un véhicule
update public.vocabulaire set hangul = '(계획을) 세우다'                                where id = 1025 and hangul = '세우다';
update public.vocabulaire set hangul = '(차를) 세우다'                                  where id = 1248 and hangul = '세우다';

/* ── 2. Types incorrects ── */

-- Formules toutes faites, pas des verbes à conjuguer
update public.vocabulaire set type = 'expression' where id in (275, 276, 320, 343) and type = '동사';
-- 다행이다 : nom + copule, pas un adjectif
update public.vocabulaire set type = 'expression' where id = 1263 and type = '형용사';
-- Groupes verbaux classés « expression » alors que leur doublon est 동사
update public.vocabulaire set type = '동사' where id in (683, 841, 1192) and type = 'expression';
-- 낭만적 : forme en -적 (nom / déterminant), l'adjectif est 낭만적이다
update public.vocabulaire set type = '명사' where id = 1048 and type = '형용사';
-- 주문하기 : forme nominale (le verbe 주문하다 existe déjà, id 589)
update public.vocabulaire set type = '명사', fr = 'commande (le fait de commander)'
  where id = 945 and hangul = '주문하기';
-- Type manquant
update public.vocabulaire set type = '명사' where id = 1528 and type is null;

/* ── 3. « 눈이/비가 … » : deux mots distincts ── */

update public.vocabulaire set hangul = '눈이 내리다', fr = 'neiger'
  where id = 486 and hangul = '눈이/비가 내리다';
insert into public.vocabulaire (hangul, fr, level, theme, type, chapitre, partie)
  select '비가 내리다', 'pleuvoir', level, theme, type, chapitre, partie
  from public.vocabulaire
  where id = 486
    and not exists (select 1 from public.vocabulaire where hangul = '비가 내리다');

update public.vocabulaire set hangul = '눈이 그치다', fr = 'la neige s''arrête'
  where id = 501 and hangul = '눈이/비가 그치다';
insert into public.vocabulaire (hangul, fr, level, theme, type, chapitre, partie)
  select '비가 그치다', 'la pluie s''arrête', level, theme, type, chapitre, partie
  from public.vocabulaire
  where id = 501
    and not exists (select 1 from public.vocabulaire where hangul = '비가 그치다');

commit;

/* ── Contrôle : il ne doit plus rester d'homonymes ni de type vide ── */
select hangul, string_agg(id::text || ' : ' || fr, '  |  ' order by id) as sens
from public.vocabulaire
where hangul in ('쓰다', '뒤', '하다', '묻다', '보이다', '만', '내다', '새', '세우다')
group by hangul
having count(*) > 1
union all
select '(type vide)', string_agg(id::text, ', ')
from public.vocabulaire
where type is null
having count(*) > 0;
