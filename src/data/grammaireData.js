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
        desc: "Lieu d'existence (있다/없다) ou direction d'un mouvement.",
        examples: [
          { kor: "학교에 가요", fr: "Je vais à l'école" },
          { kor: "집에 있어요", fr: "Je suis à la maison" },
        ],
      },
      {
        title: "에서",
        level: 1,
        tag: "Lieu d'action",
        tagColor: "green",
        formula: "Nom + 에서",
        desc: "Lieu où se déroule une action, ou point de départ.",
        examples: [
          { kor: "카페에서 공부해요", fr: "J'étudie au café" },
          { kor: "서울에서 왔어요", fr: "Je viens de Séoul" },
        ],
      },
      {
        title: "로 / 으로",
        level: 1,
        tag: "Direction / Moyen",
        tagColor: "orange",
        formula: "Nom + 로 (voyelle/ㄹ) / 으로 (consonne)",
        desc: "Direction vers, moyen de transport ou outil utilisé.",
        examples: [
          { kor: "버스로 가요", fr: "Je vais en bus" },
          { kor: "오른쪽으로 가세요", fr: "Allez à droite" },
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
        desc: "Relie deux noms (et, avec). Plutôt à l'écrit.",
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
        desc: "Remplace 은/는, 이/가 ou 을/를 pour dire « aussi ».",
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
        desc: "Indique un moment précis. Ne s'utilise pas avec 오늘, 어제, 내일.",
        examples: [
          { kor: "3시에 만나요", fr: "On se retrouve à 15h" },
          { kor: "월요일에 가요", fr: "J'y vais lundi" },
        ],
        note: "⚠️ Pas de 에 avec 오늘 (aujourd'hui), 내일 (demain), 어제 (hier)",
        noteType: "warning",
      },
    ],
  },
];
