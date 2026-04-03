export const verbesSections = [
  {
    title: "⏱️ Temps — présent · passé · futur",
    cards: [
      {
        title: "아요 / 어요",
        level: 1,
        tag: "Présent poli",
        formula: "Radical + 아요 / 어요",
        desc: "Forme de base du présent poli. Voyelle 아/오 → 아요 ; autres voyelles → 어요.",
        examples: [
          { kor: "먹어요", fr: "Je mange" },
          { kor: "가요", fr: "Je vais" },
          { kor: "마셔요", fr: "Je bois" },
        ],
      },
      {
        title: "았어요 / 었어요",
        level: 1,
        tag: "Passé poli",
        formula: "Radical + 았어요 / 었어요",
        desc: "Passé simple poli. 아/오 → 았어요 ; sinon → 었어요.",
        examples: [
          { kor: "먹었어요", fr: "J'ai mangé" },
          { kor: "갔어요", fr: "Je suis allé(e)" },
          { kor: "했어요", fr: "J'ai fait (하다 irrégulier)" },
        ],
      },
      {
        title: "(으)ㄹ 거예요",
        level: 1,
        tag: "Futur / Intention",
        formula: "Radical + (으)ㄹ 거예요",
        desc: "Futur ou intention. Consonne finale → 을 거예요 ; voyelle/ㄹ → ㄹ 거예요.",
        examples: [
          { kor: "먹을 거예요", fr: "Je vais manger" },
          { kor: "갈 거예요", fr: "Je vais y aller" },
        ],
      },
    ],
  },

  {
    title: "🔗 Connecteurs verbaux",
    cards: [
      {
        title: "-고 / -고 있어요",
        level: 1,
        tag: "Coordination / Progressif",
        formula: "Radical + 고 | Radical + 고 있어요",
        desc: "-고 relie deux actions. -고 있어요 = action en cours.",
        examples: [
          { kor: "밥을 먹고 커피를 마셔요", fr: "Je mange et bois du café" },
          { kor: "지금 공부하고 있어요", fr: "Je suis en train d'étudier" },
        ],
      },
      {
        title: "-(으)면서",
        level: 1,
        tag: "Simultanéité",
        formula: "Radical + (으)면서",
        desc: "Deux actions simultanées avec le même sujet.",
        examples: [
          {
            kor: "음악을 들으면서 공부해요",
            fr: "J'étudie en écoutant de la musique",
          },
          { kor: "걸으면서 이야기해요", fr: "On parle en marchant" },
        ],
      },
      {
        title: "-아서 / 어서",
        level: 1,
        tag: "Cause / Séquence",
        formula: "Radical + 아서 / 어서",
        desc: "Cause ou séquence liée. La deuxième action découle de la première.",
        examples: [
          { kor: "배가 고파서 먹었어요", fr: "J'avais faim donc j'ai mangé" },
          {
            kor: "서울에 가서 친구를 만났어요",
            fr: "Je suis allé à Séoul et j'ai rencontré un ami",
          },
        ],
      },
      {
        title: "-(으)면",
        level: 1,
        tag: "Condition",
        formula: "Radical + (으)면",
        desc: "Si / quand. Voyelle ou ㄹ → 면 ; consonne → 으면.",
        examples: [
          { kor: "시간이 있으면 가요", fr: "Si j'ai le temps, j'y vais" },
          {
            kor: "비가 오면 집에 있어요",
            fr: "Quand il pleut, je reste chez moi",
          },
        ],
      },
      {
        title: "-ㄴ데 / 는데",
        level: 1,
        tag: "Contraste / Contexte",
        formula: "Verbe: 는데 | Adjectif: (으)ㄴ데",
        desc: "Contraste ou transition pour donner du contexte.",
        examples: [
          { kor: "비싼데 맛있어요", fr: "C'est cher mais c'est bon" },
          {
            kor: "가고 싶은데 시간이 없어요",
            fr: "Je veux y aller mais je n'ai pas le temps",
          },
        ],
      },
      {
        title: "-거나",
        level: 1,
        tag: "Alternative",
        formula: "Radical + 거나",
        desc: "Alternative entre deux actions : ou bien… ou bien…",
        examples: [
          {
            kor: "집에 있거나 카페에 가요",
            fr: "Je reste chez moi ou je vais au café",
          },
          {
            kor: "커피를 마시거나 차를 마셔요",
            fr: "Je bois du café ou du thé",
          },
        ],
      },
    ],
  },

  {
    title: "📐 Capacité & Compétence",
    cards: [
      {
        title: "-(으)ㄹ 수 있다",
        level: 1,
        tag: "Pouvoir (circonstances)",
        tagColor: "blue",
        formula: "(으)ㄹ 수 있어요 / 없어요",
        desc: "Capacité ou possibilité selon la situation.",
        examples: [
          { kor: "한국어를 말할 수 있어요", fr: "Je peux parler coréen" },
          { kor: "지금 갈 수 없어요", fr: "Je ne peux pas y aller" },
        ],
      },
      {
        title: "-(으)ㄹ 줄 알다 / 모르다",
        level: 1,
        tag: "Savoir faire",
        tagColor: "green",
        formula: "(으)ㄹ 줄 알아요 ↔ (으)ㄹ 줄 몰라요",
        desc: "Compétence apprise.",
        examples: [
          { kor: "수영할 줄 알아요", fr: "Je sais nager" },
          { kor: "운전할 줄 몰라요", fr: "Je ne sais pas conduire" },
        ],
      },
      {
        title: "잘하다 ↔ 못하다",
        level: 1,
        tag: "Bien / Mal faire",
        formula: "Nom + 를/을 + 잘하다 / 못하다",
        desc: "Être bon ou mauvais dans quelque chose.",
        examples: [
          { kor: "한국어를 잘해요", fr: "Je suis bon en coréen" },
          { kor: "노래를 못해요", fr: "Je chante mal" },
        ],
      },
    ],
  },

  {
    title: "❌ Expressions avec 잘못",
    cards: [
      {
        title: "잘못 + Verbe",
        level: 1,
        tag: "Erreur / Faute",
        tagColor: "red",
        formula: "잘못 + Verbe",
        desc: "Faire quelque chose par erreur.",
        examples: [
          { kor: "잘못했어요", fr: "C'est ma faute" },
          { kor: "잘못 눌렀어요", fr: "J'ai appuyé sur le mauvais bouton" },
          { kor: "제 잘못이에요", fr: "C'est ma faute" },
        ],
      },
    ],
  },

  {
    title: "📅 Fréquence",
    cards: [
      {
        title: "(명사)에 (숫자)번",
        level: 1,
        tag: "Fréquence",
        tagColor: "orange",
        formula: "Période + 에 + Nombre + 번",
        desc: "Combien de fois par unité de temps.",
        examples: [
          { kor: "일주일에 세 번", fr: "3 fois par semaine" },
          { kor: "하루에 두 번", fr: "2 fois par jour" },
          { kor: "한 달에 한 번", fr: "1 fois par mois" },
        ],
      },
    ],
  },

  {
    title: "🗣️ Autres terminaisons importantes",
    cards: [
      {
        title: "-고 싶어요",
        level: 1,
        tag: "Désir",
        formula: "Radical + 고 싶어요",
        desc: "Exprime un désir personnel.",
        examples: [{ kor: "한국에 가고 싶어요", fr: "Je veux aller en Corée" }],
      },
      {
        title: "-아야/어야 되다",
        level: 1,
        tag: "Obligation",
        formula: "Radical + 아야/어야 되다",
        desc: "Obligation ou devoir.",
        examples: [{ kor: "지금 가야 돼요", fr: "Je dois y aller maintenant" }],
      },
      {
        title: "-(으)세요",
        level: 1,
        tag: "Impératif poli",
        formula: "Radical + (으)세요",
        examples: [{ kor: "앉으세요", fr: "Veuillez vous asseoir" }],
      },
    ],
  },
];
