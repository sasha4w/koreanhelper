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
        desc: "-고 relie deux actions (et). -고 있어요 = action en cours (progressif).",
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
        desc: "Deux actions simultanées avec le même sujet. L'action principale vient en fin de phrase.",
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
        tag: "Cause / Séquence immédiate",
        formula: "Radical + 아서 / 어서",
        desc: "Double sens : cause (donc) ou enchaînement immédiat (action 1 puis action 2 liées). Différent de -고 qui est une simple liste.",
        examples: [
          { kor: "배가 고파서 먹었어요", fr: "J'avais faim donc j'ai mangé" },
          {
            kor: "서울에 가서 친구를 만났어요",
            fr: "Je suis allé à Séoul et j'ai rencontré un ami",
          },
          {
            kor: "일어나서 세수해요",
            fr: "Je me lève puis je me lave le visage",
          },
        ],
        note: "💡 -아서/어서 : lien fort entre les 2 actions | -고 : simple liste ou succession",
        noteType: "tip",
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
        title: "-(으)ㄴ데 / 는데",
        level: 1,
        tag: "Contraste / Contexte",
        formula: "Verbe: 는데 | Adjectif: (으)ㄴ데",
        desc: "Contraste ou transition pour donner du contexte. Évite de faire deux phrases séparées.",
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
    title: "🚶 Déplacement & But",
    cards: [
      {
        title: "-(으)러 가다 / 오다",
        level: 1,
        tag: "But du déplacement",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + (으)러 가다 / 오다",
        desc: "Aller ou venir quelque part dans le but de faire quelque chose.",
        examples: [
          { kor: "먹으러 가요", fr: "Je vais (pour) manger" },
          {
            kor: "공부하러 도서관에 가요",
            fr: "Je vais à la bibliothèque pour étudier",
          },
        ],
      },
    ],
  },

  {
    title: "❌ Négation",
    cards: [
      {
        title: "안 + Verbe",
        level: 1,
        tag: "Négation (choix)",
        tagColor: "red",
        formulaColor: "red",
        formula: "안 + Verbe",
        desc: "Négation volontaire : on choisit de ne pas faire. Placé directement devant le verbe.",
        examples: [
          { kor: "안 가요", fr: "Je n'y vais pas" },
          { kor: "안 먹어요", fr: "Je ne mange pas" },
        ],
      },
      {
        title: "못 + Verbe",
        level: 1,
        tag: "Négation (incapacité)",
        tagColor: "red",
        formulaColor: "red",
        formula: "못 + Verbe",
        desc: "Incapacité : on ne peut pas faire, faute de compétence ou de possibilité.",
        examples: [
          { kor: "수영 못해요", fr: "Je ne sais pas nager" },
          { kor: "오늘 못 가요", fr: "Je ne peux pas venir aujourd'hui" },
        ],
        note: "💡 안 = choix de ne pas faire | 못 = incapacité réelle",
        noteType: "tip",
      },
    ],
  },

  {
    title: "📐 Capacité & Compétence",
    cards: [
      {
        title: "-(으)ㄹ 수 있다 / 없다",
        level: 1,
        tag: "Pouvoir (circonstances)",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "(으)ㄹ 수 있어요 / 없어요",
        desc: "Capacité ou possibilité selon la situation ou les circonstances.",
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
        formulaColor: "green",
        formula: "(으)ㄹ 줄 알아요 ↔ (으)ㄹ 줄 몰라요",
        desc: "Compétence apprise (≠ 수 있다 qui dépend des circonstances).",
        examples: [
          { kor: "수영할 줄 알아요", fr: "Je sais nager" },
          { kor: "운전할 줄 몰라요", fr: "Je ne sais pas conduire" },
        ],
      },
      {
        title: "잘하다 / 잘 못하다 / 못하다",
        level: 1,
        tag: "Niveau de compétence",
        formula: "Nom + 를/을 + 잘하다 / 잘 못하다 / 못하다",
        desc: "Gradation de compétence : très bien / pas trop / pas du tout.",
        examples: [
          { kor: "한국어를 잘해요", fr: "Je suis bon en coréen" },
          { kor: "노래를 잘 못해요", fr: "Je ne chante pas très bien" },
          { kor: "수학을 못해요", fr: "Je suis nul en maths" },
        ],
      },
    ],
  },

  {
    title: "🎯 Demande, Ordre & Interdiction",
    cards: [
      {
        title: "-(으)세요",
        level: 1,
        tag: "Impératif poli",
        tagColor: "green",
        formulaColor: "green",
        formula: "Radical + (으)세yo",
        desc: "Ordre ou conseil poli. Consonne → 으세요 ; voyelle/ㄹ → 세요.",
        examples: [
          { kor: "앉으세요", fr: "Veuillez vous asseoir" },
          { kor: "이쪽으로 오세요", fr: "Venez par ici" },
        ],
      },
      {
        title: "-지 마세요",
        level: 1,
        tag: "Interdiction polie",
        tagColor: "red",
        formulaColor: "red",
        formula: "Radical + 지 마세요",
        desc: 'Forme négative de l\'impératif poli : "Ne faites pas…".',
        examples: [
          { kor: "여기서 담배 피우지 마세요", fr: "Ne fumez pas ici" },
          { kor: "늦지 마세요", fr: "Ne soyez pas en retard" },
        ],
      },
      {
        title: "-아/어 주세요",
        level: 1,
        tag: "Demande d'action",
        tagColor: "green",
        formulaColor: "green",
        formula: "Radical + 아/어 주세요",
        desc: "Demander à quelqu'un de faire quelque chose pour soi.",
        examples: [
          { kor: "도와주세요", fr: "Aidez-moi, s'il vous plaît" },
          {
            kor: "천천히 말해 주세요",
            fr: "Parlez lentement, s'il vous plaît",
          },
        ],
      },
      {
        title: "-아/어 드릴게요",
        level: 1,
        tag: "Offre de service",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 아/어 드릴게요",
        desc: "Proposer de faire quelque chose pour quelqu'un (forme honorifique de 줄게요).",
        examples: [
          { kor: "제가 도와드릴게요", fr: "Je vais vous aider" },
          { kor: "가방 들어드릴게요", fr: "Je vais porter votre sac" },
        ],
      },
    ],
  },

  {
    title: "🔤 Formes adjectivales (관형형)",
    cards: [
      {
        title: "관형형 -(으)ㄴ",
        level: 1,
        tag: "Participe passé",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Radical + (으)ㄴ + Nom",
        desc: "Transforme un verbe au passé en adjectif épithète placé devant le nom.",
        examples: [
          { kor: "먹은 음식", fr: "La nourriture que j'ai mangée" },
          { kor: "본 영화", fr: "Le film que j'ai vu" },
        ],
      },
      {
        title: "관형형 -는",
        level: 1,
        tag: "Participe présent",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Radical + 는 + Nom",
        desc: "Transforme un verbe au présent en adjectif épithète placé devant le nom.",
        examples: [
          { kor: "읽는 책", fr: "Le livre que je lis" },
          { kor: "먹는 음식", fr: "La nourriture que je mange" },
        ],
      },
      {
        title: "관형형 -(으)ㄹ",
        level: 2,
        tag: "Participe futur",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Radical + (으)ㄹ + Nom",
        desc: '"Participe futur" : quelque chose qu\'on va faire ou qui est à faire.',
        examples: [
          { kor: "할 일이 많아요", fr: "Il y a beaucoup de choses à faire" },
          { kor: "먹을 것을 샀어요", fr: "J'ai acheté de quoi manger" },
        ],
      },
    ],
  },

  {
    title: "✨ Autres terminaisons importantes",
    cards: [
      {
        title: "-고 싶어요",
        level: 1,
        tag: "Désir",
        formula: "Radical + 고 싶어요",
        desc: "Exprime un désir personnel.",
        examples: [
          { kor: "한국에 가고 싶어요", fr: "Je veux aller en Corée" },
          { kor: "자고 싶어요", fr: "Je veux dormir" },
        ],
      },
      {
        title: "-아야 / 어야 되다",
        level: 1,
        tag: "Obligation",
        formulaColor: "red",
        formula: "Radical + 아야 / 어야 돼요 / 해요",
        desc: "Obligation ou devoir. 돼요 et 해요 sont interchangeables.",
        examples: [
          { kor: "지금 가야 돼요", fr: "Je dois y aller maintenant" },
          { kor: "약을 먹어야 해요", fr: "Il faut prendre un médicament" },
        ],
      },
      {
        title: "-아/어 보다",
        level: 1,
        tag: "Essayer de",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 아/어 보다",
        desc: "Essayer de faire quelque chose ou exprimer une expérience vécue.",
        examples: [
          { kor: "김치를 먹어 봤어요", fr: "J'ai (essayé de) mangé du kimchi" },
          { kor: "한번 해 봐요", fr: "Essayez une fois" },
        ],
      },
      {
        title: "-지요? (죠?)",
        level: 1,
        tag: "N'est-ce pas ?",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 지요? (= 죠?)",
        desc: "Demande une confirmation de quelque chose qu'on suppose vrai.",
        examples: [
          { kor: "한국 사람이지요?", fr: "Vous êtes coréen, n'est-ce pas ?" },
          { kor: "맛있죠?", fr: "C'est bon, non ?" },
        ],
      },
      {
        title: "V + -게",
        level: 1,
        tag: "Adverbialisation",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Radical adjectival + 게",
        desc: "Transforme un adjectif en adverbe de manière.",
        examples: [
          { kor: "크게 말해요", fr: "Parlez fort" },
          { kor: "맛있게 드세요!", fr: "Bon appétit !" },
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
        formulaColor: "red",
        formula: "잘못 + Verbe",
        desc: "Faire quelque chose par erreur, se tromper.",
        examples: [
          { kor: "잘못했어요", fr: "C'est ma faute / J'ai mal agi" },
          { kor: "잘못 눌렀어요", fr: "J'ai appuyé sur le mauvais bouton" },
          { kor: "잘못 탔어요", fr: "J'ai pris le mauvais bus/métro" },
        ],
      },
    ],
  },

  {
    title: "🎩 Forme honorifique",
    cards: [
      {
        title: "-습니다 / -ㅂ니다",
        level: 2,
        tag: "Formel poli",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Consonne + 습니다 | Voyelle + ㅂ니다",
        desc: "Forme plus formelle et plus polie que -아요/어요. Utilisée en contexte professionnel, discours ou présentation. Question : -습니까? / -ㅂ니까? Ordre : -(으)십시오.",
        examples: [
          { kor: "안녕하십니까?", fr: "Bonjour (très formel)" },
          { kor: "잘 먹겠습니다", fr: "Bon appétit (je vais bien manger)" },
          { kor: "앉으십시오", fr: "Veuillez vous asseoir (très formel)" },
        ],
      },
    ],
  },

  {
    title: "🕐 Contexte temporel",
    cards: [
      {
        title: "-(으)ㄹ 때",
        level: 1,
        tag: "Quand (temporel)",
        tagColor: "orange",
        formulaColor: "orange",
        formula: "Radical + (으)ㄹ 때",
        desc: '"Quand je + V" — situe une action dans un contexte temporel.',
        examples: [
          {
            kor: "한국에 갈 때 뭘 사요?",
            fr: "Qu'est-ce que tu achètes quand tu vas en Corée ?",
          },
          {
            kor: "심심할 때 영화를 봐요",
            fr: "Quand je m'ennuie, je regarde un film",
          },
        ],
      },
      {
        title: "-(으)았/었을 때",
        level: 2,
        tag: "Quand (passé)",
        tagColor: "orange",
        formulaColor: "orange",
        formula: "Radical + 았/었을 때",
        desc: '"Quand je faisais / quand c\'était" — le contexte temporel au passé.',
        examples: [
          {
            kor: "어렸을 때 피아노를 배웠어요",
            fr: "Quand j'étais petit, j'apprenais le piano",
          },
          {
            kor: "한국에 살았을 때 행복했어요",
            fr: "Quand je vivais en Corée, j'étais heureux",
          },
        ],
      },
      {
        title: "V-기 전에",
        level: 2,
        tag: "Avant de",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 기 전에",
        desc: '"Avant de + Verbe" — indique qu\'une action se fait avant une autre.',
        examples: [
          {
            kor: "자기 전에 이를 닦아요",
            fr: "Je me brosse les dents avant de dormir",
          },
          {
            kor: "먹기 전에 손을 씻어요",
            fr: "Je me lave les mains avant de manger",
          },
        ],
      },
      {
        title: "-(으)ㄴ 다음에",
        level: 2,
        tag: "Après avoir fait",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + (으)ㄴ 다음에",
        desc: '"Après avoir fait..." — indique qu\'une action suit une autre.',
        examples: [
          {
            kor: "밥을 먹은 다음에 커피를 마셔요",
            fr: "Après avoir mangé, je bois un café",
          },
          {
            kor: "숙제를 한 다음에 놀아요",
            fr: "Après avoir fait mes devoirs, je joue",
          },
        ],
        note: "💡 기 전에 ↔ (으)ㄴ 다음에 : avant de ↔ après avoir fait",
        noteType: "tip",
      },
      {
        title: "-는 동안",
        level: 2,
        tag: "Pendant que",
        tagColor: "orange",
        formulaColor: "orange",
        formula: "Radical + 는 동안 | Nom + 동안",
        desc: '"Pendant que je + V" ou "pendant [durée/nom]". Deux actions simultanées sur une durée.',
        examples: [
          {
            kor: "수업하는 동안 조용히 해요",
            fr: "Soyez silencieux pendant le cours",
          },
          {
            kor: "방학 동안 여행했어요",
            fr: "J'ai voyagé pendant les vacances",
          },
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
        formulaColor: "orange",
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
    title: "🔗 Connecteurs level 2",
    cards: [
      {
        title: "-(으)려면",
        level: 2,
        tag: "But / Condition",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + (으)려면",
        desc: '"Si tu veux faire A, tu dois faire B" — exprime un projet ou un but avec sa condition.',
        examples: [
          {
            kor: "옷을 싸게 사려면 어디에 가야 해요?",
            fr: "Si je veux acheter des vêtements pas chers, où dois-je aller ?",
          },
          {
            kor: "한국어를 잘하려면 매일 공부해야 해요",
            fr: "Pour être bon en coréen, il faut étudier tous les jours",
          },
        ],
      },
      {
        title: "-(으)니까",
        level: 2,
        tag: "Cause (ordre/proposition)",
        tagColor: "orange",
        formulaColor: "orange",
        formula: "Radical + (으)니까",
        desc: '"Parce que / donc" — similaire à -아서/어서 mais s\'utilise quand la 2e phrase est un ordre, une proposition ou une suggestion.',
        examples: [
          {
            kor: "추우니까 코트를 입으세요",
            fr: "Il fait froid, mettez un manteau",
          },
          { kor: "맛있으니까 드셔 보세요", fr: "C'est bon, goûtez donc" },
        ],
        note: "💡 -아서/어서 : cause neutre | -(으)니까 : cause + ordre/conseil/proposition",
        noteType: "tip",
      },
      {
        title: "-V-지 말고",
        level: 2,
        tag: "Ne fais pas ça, fais plutôt",
        tagColor: "red",
        formulaColor: "red",
        formula: "Radical + 지 말고 + Action alternative",
        desc: '"Ne fais pas ça, fais plutôt ça" — oppose deux actions en redirigeant.',
        examples: [
          {
            kor: "택시 타지 말고 걸어가요",
            fr: "Ne prends pas le taxi, allons à pied",
          },
          { kor: "울지 말고 말해요", fr: "Ne pleure pas, parle" },
        ],
      },
    ],
  },

  {
    title: "🔐 Permission & Interdiction",
    cards: [
      {
        title: "-아도/어도 되다",
        level: 2,
        tag: "Permission",
        tagColor: "green",
        formulaColor: "green",
        formula: "Radical + 아도/어도 돼요",
        desc: '"Tu peux / c\'est permis de..." — accorder ou demander une permission.',
        examples: [
          { kor: "여기 앉아도 돼요?", fr: "Je peux m'asseoir ici ?" },
          { kor: "먹어도 돼요", fr: "Tu peux manger" },
        ],
      },
      {
        title: "-(으)면 안 되다",
        level: 2,
        tag: "Interdiction",
        tagColor: "red",
        formulaColor: "red",
        formula: "Radical + (으)면 안 돼요",
        desc: '"Il ne faut pas / c\'est interdit de..." — exprimer une interdiction.',
        examples: [
          {
            kor: "시험 볼 때 말하면 안 돼요",
            fr: "Il ne faut pas parler pendant l'examen",
          },
          {
            kor: "여기서 사진 찍으면 안 돼요",
            fr: "Il est interdit de prendre des photos ici",
          },
        ],
        note: "💡 -아도/어도 돼요 : c'est permis ↔ -(으)면 안 돼요 : c'est interdit",
        noteType: "tip",
      },
    ],
  },

  {
    title: "💬 Supposition & Apparence",
    cards: [
      {
        title: "-(으)ㄴ/는/(으)ㄹ 것 같다",
        level: 2,
        tag: "Je pense que",
        tagColor: "blue",
        formulaColor: "purple",
        formula:
          "(으)ㄴ 것 같아요 (passé) | 는 것 같아요 (présent) | (으)ㄹ 것 같아요 (futur)",
        desc: '"Je pense que / il me semble que" — supposition ou opinion atténuée.',
        examples: [
          { kor: "비가 올 것 같아요", fr: "Je pense qu'il va pleuvoir" },
          {
            kor: "그 사람이 한국 사람인 것 같아요",
            fr: "Il me semble que cette personne est coréenne",
          },
          { kor: "맛있을 것 같아요", fr: "Ça a l'air d'être bon" },
        ],
      },
      {
        title: "-아/어 보이다",
        level: 2,
        tag: "Avoir l'air",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Adjectif + 아/어 보여요",
        desc: "\"Avoir l'air / sembler\" — impression visuelle basée sur l'apparence. Se fixe sur un adjectif.",
        examples: [
          { kor: "피곤해 보여요", fr: "Tu as l'air fatigué" },
          { kor: "맛있어 보여요", fr: "Ça a l'air délicieux" },
        ],
        note: "💡 -아/어 보이다 : impression visuelle | -(으)ㄹ 것 같다 : supposition plus générale",
        noteType: "tip",
      },
    ],
  },

  {
    title: "😮 Réaction & Conseil",
    cards: [
      {
        title: "-네요",
        level: 2,
        tag: "Exclamation / Émotion",
        tagColor: "orange",
        formulaColor: "orange",
        formula: "Radical + 네요",
        desc: "Exprime une réaction émotionnelle, une surprise ou une emphase. Pas pour les faits purement rationnels.",
        examples: [
          { kor: "정말 맛있네요!", fr: "C'est vraiment délicieux !" },
          { kor: "많이 컸네요!", fr: "Comme tu as grandi !" },
        ],
      },
      {
        title: "-(ㄴ/는)데요",
        level: 2,
        tag: "Contradiction / Attente / Surprise",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Verbe + 는데요 | Adjectif/Passé + (으)ㄴ데요",
        desc: "3 usages : exprimer une contradiction implicite, attendre une réaction de l'interlocuteur, ou souligner quelque chose de surprenant.",
        examples: [
          {
            kor: "저는 괜찮은데요...",
            fr: "Moi ça va pourtant... (contradiction)",
          },
          {
            kor: "정말 잘하는데요!",
            fr: "Vous êtes vraiment doué ! (surprise)",
          },
        ],
      },
      {
        title: "-는 게 어때요?",
        level: 2,
        tag: "Conseil / Suggestion",
        tagColor: "green",
        formulaColor: "green",
        formula: "Radical + 는 게 어때요?",
        desc: 'Proposer ou donner un conseil. "Et si tu faisais... ? / Pourquoi ne pas...".',
        examples: [
          { kor: "쉬는 게 어때요?", fr: "Et si tu te reposais ?" },
          {
            kor: "의사한테 가는 게 어때요?",
            fr: "Pourquoi ne pas aller chez le médecin ?",
          },
        ],
      },
      {
        title: "V-지 않아요?",
        level: 2,
        tag: "Suggestion / Confirmation",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 지 않아요?",
        desc: '"Tu ne trouves pas que... ? / N\'est-ce pas que..." — forme de suggestion ou demande de confirmation.',
        examples: [
          {
            kor: "여기가 더 좋지 않아요?",
            fr: "Tu ne trouves pas que c'est mieux ici ?",
          },
          { kor: "좀 이상하지 않아요?", fr: "C'est pas un peu bizarre ?" },
        ],
      },
      {
        title: "-아/어 드릴까요?",
        level: 2,
        tag: "Proposer son aide",
        tagColor: "blue",
        formulaColor: "purple",
        formula: "Radical + 아/어 드릴까요?",
        desc: "Proposer de rendre service à quelqu'un de manière polie.",
        examples: [
          { kor: "도와드릴까요?", fr: "Puis-je vous aider ?" },
          {
            kor: "창문 닫아드릴까요?",
            fr: "Voulez-vous que je ferme la fenêtre ?",
          },
        ],
      },
    ],
  },

  {
    title: "🔄 Changement d'état",
    cards: [
      {
        title: "-아지다 / -어지다",
        level: 2,
        tag: "Devenir (adjectif)",
        tagColor: "green",
        formulaColor: "green",
        formula: "Adjectif + 아지다 / 어지다",
        desc: "Exprime un changement progressif d'état. Se fixe sur un adjectif.",
        examples: [
          { kor: "날씨가 따뜻해졌어요", fr: "Le temps est devenu chaud" },
          {
            kor: "한국어가 점점 좋아져요",
            fr: "Mon coréen s'améliore progressivement",
          },
        ],
        note: "💡 -아지다/어지다 : adjectif → changement d'état | 이/가 되다 : nom → devenir (voir grammaire)",
        noteType: "tip",
      },
    ],
  },

  {
    title: "🗣️ Style indirect",
    cards: [
      {
        title: "-(ㄴ/는)대요 / -(이)래요",
        level: 2,
        tag: "Rapporter la parole",
        tagColor: "purple",
        formulaColor: "purple",
        formula: "Verbe + (ㄴ/는)대요 | Nom + (이)래요",
        desc: "Reporter ce que quelqu'un a dit ou ce qu'on a lu. Forme contractée du style indirect.",
        examples: [
          { kor: "내일 비가 온대요", fr: "Il paraît qu'il va pleuvoir demain" },
          {
            kor: "그 사람이 학생이래요",
            fr: "Il paraît que cette personne est étudiante",
          },
        ],
      },
    ],
  },
];
