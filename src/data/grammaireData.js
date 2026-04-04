export const grammairesSections = [
  {
    title: "🧩 Particules de sujet & objet",
    cards: [
      {
        title: "이 / 가",
        level: 1,
        tag: "Sujet",
        tagColor: "blue",
        formula: "Nom + 이 (consonne) / 가 (voyelle)",
        desc: "Marque le sujet grammatical de la phrase.",
        examples: [
          { kor: "학생이 와요", fr: "L'étudiant vient" },
          { kor: "친구가 있어요", fr: "J'ai un ami" },
        ],
      },
      {
        title: "은 / 는",
        level: 1,
        tag: "Thème / Contraste",
        tagColor: "purple",
        formula: "Nom + 은 (consonne) / 는 (voyelle)",
        desc: "Marque le thème de la phrase ou introduit un contraste.",
        examples: [
          { kor: "저는 학생이에요", fr: "Moi, je suis étudiant" },
          { kor: "커피는 좋아요", fr: "Le café, j'aime ça" },
        ],
      },
      {
        title: "을 / 를",
        level: 1,
        tag: "Objet direct",
        tagColor: "green",
        formula: "Nom + 을 (consonne) / 를 (voyelle)",
        desc: "Marque l'objet direct du verbe.",
        examples: [
          { kor: "밥을 먹어요", fr: "Je mange du riz" },
          { kor: "책을 읽어요", fr: "Je lis un livre" },
        ],
      },
    ],
  },

  {
    title: "📍 Particules de lieu",
    cards: [
      {
        title: "에",
        level: 1,
        tag: "Lieu / Direction",
        tagColor: "blue",
        formula: "Nom + 에",
        desc: "Lieu d'existence (있다/없다) ou direction d'un mouvement. Ne marque pas une action.",
        examples: [
          { kor: "학교에 가요", fr: "Je vais à l'école" },
          { kor: "집에 있어요", fr: "Je suis à la maison" },
        ],
      },
      {
        title: "에서",
        level: 1,
        tag: "Lieu d'action / Origine",
        tagColor: "green",
        formula: "Nom + 에서",
        desc: "Lieu où se déroule une action, ou point de départ (venir de, descendre de).",
        examples: [
          { kor: "카페에서 공부해요", fr: "J'étudie au café" },
          { kor: "서울에서 왔어요", fr: "Je viens de Séoul" },
          { kor: "버스에서 내렸어요", fr: "Je suis descendu du bus" },
        ],
        note: "💡 에 = localisation statique | 에서 = action qui se déroule là / point de départ",
        noteType: "tip",
      },
      {
        title: "(으)로",
        level: 1,
        tag: "Direction / Moyen / Outil",
        tagColor: "orange",
        formula: "Nom + 로 (voyelle/ㄹ) / 으로 (consonne)",
        desc: "Triple usage : direction vers un lieu, moyen de transport, outil ou mode de paiement.",
        examples: [
          { kor: "오른쪽으로 가세요", fr: "Allez à droite (direction)" },
          { kor: "지하철로 가요", fr: "Je prends le métro (moyen)" },
          { kor: "카드로 계산해요", fr: "Je paye par carte (outil)" },
          { kor: "젓가락으로 먹어요", fr: "Je mange avec des baguettes" },
        ],
      },
    ],
  },

  {
    title: "👤 Particules de personne",
    cards: [
      {
        title: "한테",
        level: 1,
        tag: "À (personne)",
        tagColor: "blue",
        formula: "Personne + 한테",
        desc: '"À" pour indiquer une destination vers une personne (≠ 에 pour les lieux).',
        examples: [
          { kor: "친구한테 전화해요", fr: "J'appelle mon ami" },
          { kor: "선생님한테 말했어요", fr: "J'en ai parlé au professeur" },
        ],
      },
      {
        title: "한테서",
        level: 1,
        tag: "De la part de",
        tagColor: "purple",
        formula: "Personne + 한테서",
        desc: "\"De la part de quelqu'un\" — indique l'origine d'une action ou d'un objet reçu.",
        examples: [
          { kor: "친구한테서 받았어요", fr: "Je l'ai reçu de mon ami" },
          { kor: "선생님한테서 들었어요", fr: "Je l'ai entendu du professeur" },
        ],
      },
    ],
  },

  {
    title: "🔗 Particules de liaison",
    cards: [
      {
        title: "과 / 와",
        level: 1,
        tag: "Et (avec nom)",
        tagColor: "blue",
        formula: "Nom + 과 (consonne) / 와 (voyelle)",
        desc: "Relie deux noms (et, avec). Plutôt utilisé à l'écrit.",
        examples: [
          { kor: "사과와 바나나", fr: "Des pommes et des bananes" },
          { kor: "친구와 가요", fr: "Je vais avec un ami" },
        ],
      },
      {
        title: "하고",
        level: 1,
        tag: "Et / Avec (oral)",
        tagColor: "purple",
        formula: "Nom + 하고",
        desc: "Équivalent oral de 과/와, plus courant à la parole.",
        examples: [
          { kor: "커피하고 빵이요", fr: "Du café et du pain" },
          { kor: "친구하고 놀았어요", fr: "J'ai joué avec des amis" },
        ],
      },
      {
        title: "도",
        level: 1,
        tag: "Aussi / Même",
        tagColor: "green",
        formula: "Nom + 도",
        desc: 'Remplace 은/는, 이/가 ou 을/를 pour dire "aussi".',
        examples: [
          { kor: "저도 좋아요", fr: "Moi aussi, j'aime ça" },
          { kor: "한국어도 배워요", fr: "J'apprends aussi le coréen" },
        ],
      },
    ],
  },

  {
    title: "⏱️ Particules de temps",
    cards: [
      {
        title: "에 (temps)",
        level: 1,
        tag: "Moment précis",
        tagColor: "orange",
        formula: "Temps + 에",
        desc: "Indique un moment précis. Ne s'utilise pas avec 오늘, 어제, 내일, 지금.",
        examples: [
          { kor: "3시에 만나요", fr: "On se retrouve à 15h" },
          { kor: "월요일에 가요", fr: "J'y vais lundi" },
        ],
        note: "⚠️ Pas de 에 avec 오늘 (aujourd'hui), 내일 (demain), 어제 (hier), 지금 (maintenant)",
        noteType: "warning",
      },
      {
        title: "부터 … 까지",
        level: 1,
        tag: "De … à … (temps)",
        tagColor: "orange",
        formula: "Début + 부터 … Fin + 까지",
        desc: '"De … à …" pour indiquer une plage temporelle.',
        examples: [
          { kor: "1시부터 3시까지 공부해요", fr: "J'étudie de 1h à 3h" },
          {
            kor: "월요일부터 금요일까지 일해요",
            fr: "Je travaille du lundi au vendredi",
          },
        ],
      },
      {
        title: "에서 … 까지",
        level: 1,
        tag: "De … à … (lieu)",
        tagColor: "blue",
        formula: "Lieu 1 + 에서 … Lieu 2 + 까지",
        desc: '"De … à …" pour indiquer une plage géographique.',
        examples: [
          { kor: "서울에서 부산까지 가요", fr: "Je vais de Séoul à Busan" },
          {
            kor: "집에서 학교까지 30분이에요",
            fr: "C'est à 30 min de chez moi à l'école",
          },
        ],
      },
      {
        title: "Nom + 중",
        level: 1,
        tag: "Au milieu de",
        tagColor: "purple",
        formula: "Nom (action) + 중이에요",
        desc: '"En train de / au milieu de". Indique qu\'on est en plein dans une activité.',
        examples: [
          { kor: "회의 중이에요", fr: "Je suis en réunion" },
          { kor: "공부 중이에요", fr: "Je suis en train d'étudier" },
        ],
      },
    ],
  },

  {
    title: "📊 Comparaison & Quantité",
    cards: [
      {
        title: "보다 (더)",
        level: 1,
        tag: "Plus que",
        tagColor: "blue",
        formula: "A + 보다 (더) + Adjectif",
        desc: '"Plus que" pour comparer deux éléments. 더 est optionnel mais renforce la comparaison.',
        examples: [
          {
            kor: "고향이 한국보다 더 더워요",
            fr: "Mon pays natal est plus chaud que la Corée",
          },
          { kor: "이게 저것보다 싸요", fr: "Ceci est moins cher que cela" },
        ],
      },
      {
        title: "훨씬 (더)",
        level: 1,
        tag: "Bien plus",
        tagColor: "orange",
        formula: "A + 보다 + 훨씬 (더) + Adjectif",
        desc: '"Beaucoup plus / vraiment plus". Renforce fortement une comparaison avec 보다.',
        examples: [
          {
            kor: "이게 저것보다 훨씬 더 좋아요",
            fr: "Ceci est bien meilleur que cela",
          },
        ],
      },
      {
        title: "제일 / 가장",
        level: 1,
        tag: "Le plus (superlatif)",
        tagColor: "green",
        formula: "제일 / 가장 + Adjectif",
        desc: '"Le plus" — superlatif absolu. À utiliser avec une forme positive.',
        examples: [
          { kor: "제일 좋아요", fr: "C'est ce que je préfère" },
          { kor: "가장 맛있어요", fr: "C'est le plus délicieux" },
        ],
      },
      {
        title: "중에서",
        level: 1,
        tag: "Parmi",
        tagColor: "blue",
        formula: "Groupe + 중에서",
        desc: '"Parmi" un groupe d\'objets ou de personnes.',
        examples: [
          {
            kor: "과일 중에서 사과를 제일 좋아해요",
            fr: "Parmi les fruits, je préfère les pommes",
          },
          {
            kor: "셋 중에서 어느 게 좋아요?",
            fr: "Lequel tu préfères parmi les trois ?",
          },
        ],
      },
    ],
  },

  {
    title: "🔀 Adverbes utiles",
    cards: [
      {
        title: "별로",
        level: 1,
        tag: "Pas vraiment",
        tagColor: "orange",
        formula: "별로 + Verbe négatif",
        desc: '"Pas vraiment / pas trop". Toujours suivi d\'une forme négative.',
        examples: [
          { kor: "별로 안 좋아요", fr: "Ce n'est pas vraiment bien" },
          {
            kor: "별로 안 먹고 싶어요",
            fr: "Je n'ai pas vraiment envie de manger",
          },
        ],
      },
      {
        title: "거의 / 전혀",
        level: 1,
        tag: "Quasiment / Pas du tout",
        tagColor: "red",
        formula: "거의 / 전혀 + Verbe négatif",
        desc: "거의 = quasiment pas | 전혀 = absolument pas. Les deux se combinent avec une forme négative.",
        examples: [
          { kor: "거의 안 먹어요", fr: "Je ne mange quasiment pas" },
          { kor: "전혀 몰라요", fr: "Je ne sais absolument pas" },
        ],
      },
      {
        title: "아직",
        level: 1,
        tag: "Pas encore",
        tagColor: "purple",
        formula: "아직 + 안 + Verbe | 아직 + 못 + Verbe",
        desc: '"Pas encore". Toujours avec une forme négative.',
        examples: [
          { kor: "아직 안 먹었어요", fr: "Je n'ai pas encore mangé" },
          { kor: "아직 못 갔어요", fr: "Je n'ai pas encore pu y aller" },
        ],
      },
    ],
  },

  {
    title: "🗣️ Conjonctions & Mots de liaison",
    cards: [
      {
        title: "그래서 / 그런데",
        level: 1,
        tag: "Donc / Mais",
        tagColor: "orange",
        formula: "Phrase 1. 그래서 / 그런데 + Phrase 2",
        desc: '그래서 = "donc / c\'est pourquoi" | 그런데 = "mais / cependant". Commencent une nouvelle phrase.',
        examples: [
          {
            kor: "바빠요. 그래서 못 가요.",
            fr: "Je suis occupé. Donc je ne peux pas y aller.",
          },
          {
            kor: "맛있어요. 그런데 비싸요.",
            fr: "C'est bon. Mais c'est cher.",
          },
        ],
      },
    ],
  },

  {
    title: "🔢 Compteurs & Classificateurs",
    cards: [
      {
        title: "Compteurs logiques",
        level: 1,
        tag: "Classificateurs",
        tagColor: "blue",
        formula: "Nombre natif + Compteur",
        desc: "Compteurs à utiliser selon le type d'objet compté. Chiffres natifs coréens (하나, 둘, 셋…).",
        examples: [
          { kor: "사과 두 개", fr: "2 pommes — 개 : objets généraux" },
          { kor: "사람 세 명", fr: "3 personnes — 명 : personnes" },
          { kor: "커피 한 잔", fr: "1 café — 잔 : verres / tasses" },
          { kor: "맥주 한 병", fr: "1 bière — 병 : bouteilles" },
          { kor: "책 두 권", fr: "2 livres — 권 : livres" },
        ],
      },
      {
        title: "Heures & Minutes",
        level: 1,
        tag: "Heure",
        tagColor: "green",
        formula: "Heures (natif) + 시 | Minutes (sino) + 분",
        desc: "Heures : chiffres natifs coréens (한 시, 두 시…). Minutes : chiffres sino-coréens (일 분, 이 분…). 30 min = 반.",
        examples: [
          { kor: "두 시 삼십 분 / 두 시 반", fr: "2h30" },
          { kor: "열두 시", fr: "12h" },
        ],
      },
    ],
  },

  {
    title: "🔄 Structures level 2",
    cards: [
      {
        title: "이/가 아니라",
        level: 2,
        tag: "Correction / Mais plutôt",
        tagColor: "red",
        formula: "Nom A + 이/가 아니라 + Nom B",
        desc: '"Je ne suis pas A mais B" — corrige ou remplace une information en une seule phrase.',
        examples: [
          {
            kor: "한국 사람이 아니라 프랑스 사람이에요",
            fr: "Je ne suis pas coréen mais français",
          },
          {
            kor: "커피가 아니라 차예요",
            fr: "Ce n'est pas du café mais du thé",
          },
        ],
      },
      {
        title: "이/가 되다",
        level: 2,
        tag: "Devenir (nom)",
        tagColor: "green",
        formula: "Nom + 이/가 되다",
        desc: "\"Devenir\" — indique un changement d'état ou de statut. S'utilise avec un nom.",
        examples: [
          { kor: "가수가 됐어요", fr: "Je suis devenu chanteur" },
          { kor: "봄이 됐어요", fr: "C'est devenu le printemps" },
        ],
        note: "💡 이/가 되다 : nom → devenir | -아지다/어지다 : adjectif → changement progressif",
        noteType: "tip",
      },
      {
        title: "-(으)로 (transformation)",
        level: 2,
        tag: "Transformation A → B",
        tagColor: "orange",
        formula: "Résultat + (으)로 + 바꾸다/변하다…",
        desc: "Indique une transformation ou un changement de A en B.",
        examples: [
          {
            kor: "이 돈을 한국 돈으로 바꿔 주세요",
            fr: "Changez cet argent en monnaie coréenne",
          },
          { kor: "물이 얼음으로 변해요", fr: "L'eau se transforme en glace" },
        ],
      },
    ],
  },
];
