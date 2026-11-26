/**
 * Modèles de phrases combinant plusieurs points de grammaire.
 *
 * Chaque modèle est une suite de « parties » :
 *  - { slot, g }  : un nom tiré d'une liste (SLOTS) + une particule (g)
 *  - { verb, ending } ou { verbSlot, ending } : un verbe conjugué par le moteur
 *  - { text }     : texte fixe
 *
 * Les listes de mots garantissent des phrases sensées (on mange de la
 * nourriture, on va dans un lieu) ; seuls les mots présents dans le
 * vocabulaire sont utilisés, pour réviser ce que l'on apprend.
 *
 * Un modèle n'est proposé que si toutes ses leçons existent dans les données
 * filtrées (niveau) : ajouter une leçon en base active les modèles qui en
 * dépendent.
 */

/* ───────────────── Particules et liaisons ───────────────── */

/** fixed : particule invariable ; alt : particule alternante (PARTICLES). */
export const G = {
  e: { fixed: "에", lesson: /^에$/, label: "에 (lieu)" },
  eTime: { fixed: "에", lesson: /^에\(temps\)$/, label: "에 (temps)" },
  eseo: { fixed: "에서", lesson: /^에서$/, label: "에서" },
  hago: { fixed: "하고", lesson: /^하고$/, label: "하고" },
  hante: { fixed: "한테", lesson: /^한테$/, label: "한테" },
  boda: { fixed: "보다", lesson: /^보다\(더\)$/, label: "보다" },
  eulReul: { alt: "eul-reul", label: "을/를" },
  iGa: { alt: "i-ga", label: "이/가" },
  eunNeun: { alt: "eun-neun", label: "은/는" },
  euro: { alt: "euro", label: "(으)로" },
  gwaWa: { alt: "gwa-wa", label: "과/와" },
  do: { fixed: "도", lesson: /^도$/, label: "도" },
  buteo: { fixed: "부터", lesson: /^부터…까지$/, label: "부터 … 까지" },
  kkaji: { fixed: "까지", lesson: /^부터…까지$/, label: "부터 … 까지" },
  hanteseo: { fixed: "한테서", lesson: /^한테서$/, label: "한테서" },
  bakke: { fixed: "밖에", lesson: /^밖에$/, label: "밖에" },
};

/** -고 d'enchaînement : même leçon que « -고 / -고 있어요 ». */
export const GO_SEQ = {
  custom: { base: "plain", suffix: "고" },
  lesson: /^고\/고있어요$/,
  label: "enchaînement -고",
};

/* ───────────────── Listes de mots ───────────────── */

const FRUITS =
  "사과 멜론 키위 참외 수박 오렌지 바나나 파인애플 망고 복숭아 체리 포도 딸기 귤 감 자두 레몬";

export const SLOTS = {
  food: `토스트 치킨 피자 삼계탕 만두 스파게티 짜장면 짬뽕 탕수육 햄버거 감자 계란 떡볶이 김밥 비빔밥 불고기 라면 빵 김치 밥 과자 케이크 ${FRUITS}`,
  drink: "커피 우유 물 주스 녹차 레몬차 콜라 차 맥주 와인",
  placeEat: "식당 커피숍 카페 집 기숙사",
  placeGo: "학교 도서관 식당 커피숍 은행 우체국 병원 회사 공원 시장 백화점 영화관 극장 박물관 쇼핑몰 바닷가 산 바다 카페 미용실",
  placeRead: "도서관 집 커피숍 카페 기숙사 교실",
  placeShop: "쇼핑몰 백화점 시장 가게 편의점",
  day: "월요일 화요일 수요일 목요일 금요일 토요일 일요일 주말 아침 저녁 점심",
  person: "친구 동생 남동생 여동생 언니 오빠 형 누나 동료 선배 아들 딸",
  gift: "선물 꽃 책 인형 반지 목걸이 귀걸이 시계 장갑 스카프 목도리 팔찌",
  book: "책 소설책 잡지 신문 웹툰 일기",
  transport: "버스 지하철 택시 기차 자전거",
  clothes: "셔츠 티셔츠 바지 원피스 치마 스웨터 코트 수영복 한복",
  shopItem: "티셔츠 셔츠 바지 치마 원피스 모자 양말 구두 운동화 가방 시계 반지 목걸이 스웨터 코트",
  sport: "수영하다 운동하다 등산하다 축구하다 농구하다 산책하다",
  weekday: "월요일 화요일 수요일 목요일 금요일 토요일 일요일",
  teacher: "선생님 선배 언니 오빠 형 누나 어머니 아버지 친구",
  city: "제주도 부산 서울 뉴욕 도쿄 상하이 시드니 파리 평창 멕시코 유럽 아시아 아프리카",
  sight: "경복궁 남이섬 한라산 해운대 불국사 한옥마을 설악산 광안리 국제시장 첨성대 롯데월드타워 태종대",
  subject: "국어 수학 과학 음악 미술 체육 역사 일본어 외국어 문법 사회 한국어",
  clinic: "내과 안과 치과 이비인후과 정형외과 피부과 병원",
  device: "스마트폰 노트북 휴대폰 카메라 이어폰 충전기",
  hobby: "산책하다 노래하다 게임하다 낚시하다 수영하다 운동하다 등산하다 요리하다",
  work: "일하다 야근하다 출근하다 공부하다 운동하다",
  study: "복습하다 예습하다 숙제하다 공부하다 연습하다",
  // Expressions à plusieurs mots : séparées par « | »
  weather: "비가 오다 | 눈이 오다 | 바람이 불다 | 안개가 끼다 | 천둥이 치다",
};

for (const key of Object.keys(SLOTS)) {
  const raw = SLOTS[key];
  SLOTS[key] = raw.includes("|")
    ? raw.split("|").map((s) => s.trim()).filter(Boolean)
    : raw.split(/\s+/);
}

/* ───────────────── Modèles ───────────────── */

/**
 * fr : traduction guide, {slot} remplacé par la glose française du mot.
 * verb.fr : la forme française du verbe telle qu'elle apparaît dans `fr`.
 */
export const TEMPLATES = [
  {
    id: "want-eat",
    fr: "Je veux manger {food} à {placeEat}.",
    parts: [
      { slot: "placeEat", g: G.eseo },
      { slot: "food", g: G.eulReul },
      { verb: "먹다", ending: "go-sipeoyo" },
    ],
  },
  {
    id: "went-day",
    fr: "{day}, je suis allé(e) à {placeGo}.",
    parts: [
      { slot: "day", g: G.eTime },
      { slot: "placeGo", g: G.e },
      { verb: "가다", ending: "past" },
    ],
  },
  {
    id: "drank-with",
    fr: "J'ai bu {drink} à {placeEat} avec {person}.",
    parts: [
      { slot: "person", g: G.hago },
      { slot: "placeEat", g: G.eseo },
      { slot: "drink", g: G.eulReul },
      { verb: "마시다", ending: "past" },
    ],
  },
  {
    id: "will-go-by",
    fr: "J'irai à {placeGo} en {transport}.",
    parts: [
      { slot: "transport", g: G.euro },
      { slot: "placeGo", g: G.e },
      { verb: "가다", ending: "future" },
    ],
  },
  {
    id: "gave-gift",
    fr: "J'ai donné {gift} à {person}.",
    parts: [
      { slot: "person", g: G.hante },
      { slot: "gift", g: G.eulReul },
      { verb: "주다", ending: "past" },
    ],
  },
  {
    id: "will-wear",
    fr: "{day}, je porterai {clothes}.",
    parts: [
      { slot: "day", g: G.eTime },
      { slot: "clothes", g: G.eulReul },
      { verb: "입다", ending: "future" },
    ],
  },
  {
    id: "read-while-drinking",
    fr: "À {placeRead}, je bois {drink} en lisant {book}.",
    parts: [
      { slot: "placeRead", g: G.eseo },
      { slot: "book", g: G.eulReul },
      { verb: "읽다", ending: "myeonseo" },
      { slot: "drink", g: G.eulReul },
      { verb: "마시다", ending: "present" },
    ],
  },
  {
    id: "compare-food",
    fr: "{food} est plus délicieux que {food2}.",
    parts: [
      { slot: "food", g: G.eunNeun },
      { slot: "food", g: G.boda, as: "food2" },
      { verb: "맛있다", pos: "adj", ending: "present" },
    ],
  },
  {
    id: "person-at-place",
    fr: "{person} est à {placeGo}.",
    parts: [
      { slot: "person", g: G.iGa },
      { slot: "placeGo", g: G.e },
      { verb: "있다", ending: "present" },
    ],
  },
  {
    id: "ate-before-going",
    fr: "Avant d'aller à {placeGo}, j'ai mangé {food}.",
    parts: [
      { slot: "placeGo", g: G.e },
      { verb: "가다", ending: "gi-jeone" },
      { slot: "food", g: G.eulReul },
      { verb: "먹다", ending: "past" },
    ],
  },
  {
    id: "can-sport-with",
    fr: "{day}, je peux {sport} avec {person}.",
    parts: [
      { slot: "day", g: G.eTime },
      { slot: "person", g: G.hago },
      { verbSlot: "sport", ending: "su-itda" },
    ],
  },
  {
    id: "want-buy",
    fr: "Je veux acheter {shopItem} à {placeShop}.",
    parts: [
      { slot: "placeShop", g: G.eseo },
      { slot: "shopItem", g: G.eulReul },
      { verb: "사다", ending: "go-sipeoyo" },
    ],
  },
  {
    id: "take-and-go",
    fr: "Je prends {transport} et je vais à {placeGo}.",
    parts: [
      { slot: "transport", g: G.eulReul },
      { verb: "타다", ending: GO_SEQ },
      { slot: "placeGo", g: G.e },
      { verb: "가다", ending: "present" },
    ],
  },
  {
    id: "please-call",
    fr: "Appelle {person}, s'il te plaît.",
    parts: [
      { slot: "person", g: G.hante },
      { verb: "전화하다", ending: "a-juseyo" },
    ],
  },
  {
    id: "if-rain-read",
    fr: "S'il pleut, je lirai {book} à {placeRead}.",
    parts: [
      { text: "비가" },
      { verb: "오다", ending: "myeon" },
      { slot: "placeRead", g: G.eseo },
      { slot: "book", g: G.eulReul },
      { verb: "읽다", ending: "future" },
    ],
  },
  /* ── Niveaux 2-3 : cause, permission, obligation, expérience… ── */
  {
    id: "weather-stayed",
    fr: "Temps : {weather}. Du coup, je suis resté(e) à {placeRead}.",
    parts: [
      { verbSlot: "weather", ending: "aseo" },
      { slot: "placeRead", g: G.e },
      { verb: "있다", ending: "past" },
    ],
  },
  {
    id: "will-study",
    fr: "J'étudierai {subject} à {placeRead}.",
    parts: [
      { slot: "placeRead", g: G.eseo },
      { slot: "subject", g: G.eulReul },
      { verb: "공부하다", ending: "future" },
    ],
  },
  {
    id: "dont-eat",
    fr: "Ne mange pas {food} à {placeRead}.",
    parts: [
      { slot: "placeRead", g: G.eseo },
      { slot: "food", g: G.eulReul },
      { verb: "먹다", ending: "ji-maseyo" },
    ],
  },
  {
    id: "may-use",
    fr: "Est-ce que je peux utiliser {device} à {placeRead} ?",
    parts: [
      { slot: "placeRead", g: G.eseo },
      { slot: "device", g: G.eulReul },
      { verb: "쓰다", ending: "eodo-doeda" },
    ],
  },
  {
    id: "been-to-city",
    fr: "Je suis déjà allé(e) à {city}.",
    parts: [
      { slot: "city", g: G.e },
      { verb: "가다", ending: "eun-jeok" },
    ],
  },
  {
    id: "plan-sight",
    fr: "Je compte aller à {sight} en {transport}.",
    parts: [
      { slot: "transport", g: G.euro },
      { slot: "sight", g: G.e },
      { verb: "가다", ending: "ryeogo-hada" },
    ],
  },
  {
    id: "must-clinic",
    fr: "{day}, je dois aller à {clinic}.",
    parts: [
      { slot: "day", g: G.eTime },
      { slot: "clinic", g: G.e },
      { verb: "가다", ending: "aya-doeda" },
    ],
  },
  {
    id: "from-to",
    fr: "Du {weekday} au {weekday2}, je fais ceci : {work}.",
    parts: [
      { slot: "weekday", g: G.buteo },
      { slot: "weekday", g: G.kkaji, as: "weekday2", after: "weekday" },
      { verbSlot: "work", ending: "present" },
    ],
  },
  {
    id: "also-likes",
    fr: "{person} aime aussi {food}.",
    parts: [
      { slot: "person", g: G.do },
      { slot: "food", g: G.eulReul },
      { verb: "좋아하다", ending: "present" },
    ],
  },
  {
    id: "only-drink",
    fr: "À {placeEat}, il n'y a que {drink}.",
    parts: [
      { slot: "placeEat", g: G.e },
      { slot: "drink", g: G.bakke },
      { verb: "없다", ending: "present" },
    ],
  },
  {
    id: "free-time-hobby",
    fr: "Quand j'ai du temps, je fais ceci : {hobby}.",
    parts: [
      { text: "시간이" },
      { verb: "있다", ending: "ltte" },
      { verbSlot: "hobby", ending: "present" },
    ],
  },
  {
    id: "cheap-buy",
    fr: "{shopItem} n'est pas cher, alors achète-le à {placeShop}.",
    parts: [
      { slot: "shopItem", g: G.iGa },
      { verb: "싸다", pos: "adj", ending: "nikka" },
      { slot: "placeShop", g: G.eseo },
      { verb: "사다", ending: "seyo" },
    ],
  },
  {
    id: "after-eat-study",
    fr: "Après avoir mangé {food}, je ferai ceci à {placeRead} : {study}.",
    parts: [
      { slot: "food", g: G.eulReul },
      { verb: "먹다", ending: "eun-daeume" },
      { slot: "placeRead", g: G.eseo },
      { verbSlot: "study", ending: "future" },
    ],
  },
  {
    id: "formal-take",
    fr: "(style formel) À {city}, je prends {transport}.",
    parts: [
      { slot: "city", g: G.eseo },
      { slot: "transport", g: G.eulReul },
      { verb: "타다", ending: "seumnida" },
    ],
  },
  {
    id: "lets-eat",
    fr: "(style formel) Mangeons {food} ensemble à {placeEat}.",
    parts: [
      { slot: "placeEat", g: G.eseo },
      { text: "같이" },
      { slot: "food", g: G.eulReul },
      { verb: "먹다", ending: "bsida" },
    ],
  },
  {
    id: "promise-call",
    fr: "{day}, j'appellerai {person} (promesse).",
    parts: [
      { slot: "day", g: G.eTime },
      { slot: "person", g: G.hante },
      { verb: "전화하다", ending: "lgeyo" },
    ],
  },
  {
    id: "ordered-and",
    fr: "J'ai commandé {food} et {drink}.",
    parts: [
      { slot: "food", g: G.gwaWa },
      { slot: "drink", g: G.eulReul },
      { verb: "주문하다", ending: "past" },
    ],
  },
  {
    id: "decided-trip",
    fr: "J'ai décidé de partir en voyage à {city}.",
    parts: [
      { slot: "city", g: G.euro },
      { text: "여행을" },
      { verb: "가다", ending: "gi-ro-haesseoyo" },
    ],
  },
  {
    id: "learned-from",
    fr: "J'ai appris {subject} auprès de {teacher}.",
    parts: [
      { slot: "teacher", g: G.hanteseo },
      { slot: "subject", g: G.eulReul },
      { verb: "배우다", ending: "past" },
    ],
  },
];
