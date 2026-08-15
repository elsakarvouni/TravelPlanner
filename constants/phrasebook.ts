export type Phrase = {
  greek: string;
  local: string;
};

export type LanguagePhrasebook = {
  languageName: string;
  phrases: Phrase[];
};

// μικρό βοηθητικό ώστε να μη γράφω κάθε φορά { greek: ..., local: ... } για τις ίδιες 8 βασικές φράσεις σε κάθε γλώσσα
function makePhrases(
  hello: string,
  thanks: string,
  please: string,
  yes: string,
  no: string,
  whereIs: string,
  howMuch: string,
  help: string
): Phrase[] {
  return [
    { greek: 'Γεια σου', local: hello },
    { greek: 'Ευχαριστώ', local: thanks },
    { greek: 'Παρακαλώ', local: please },
    { greek: 'Ναι', local: yes },
    { greek: 'Όχι', local: no },
    { greek: 'Πού είναι...;', local: whereIs },
    { greek: 'Πόσο κάνει;', local: howMuch },
    { greek: 'Βοήθεια!', local: help },
  ];
}

// λίστα με βασικές φράσεις ανά γλώσσα - key = κωδικός γλώσσας (ISO 639-3, π.χ. eng, ita, ell), βρίσκεται μέσω
// του country-languages mapping σε άλλο αρχείο. Απλά φράσεις-επιβίωσης για τουρίστες, όχι πλήρες λεξικό
export const PHRASEBOOK: Record<string, LanguagePhrasebook> = {
  eng: {
    languageName: 'Αγγλικά',
    phrases: makePhrases('Hello', 'Thank you', 'Please', 'Yes', 'No', 'Where is...?', 'How much is this?', 'Help!'),
  },
  ita: {
    languageName: 'Ιταλικά',
    phrases: makePhrases('Ciao', 'Grazie', 'Per favore', 'Sì', 'No', "Dov'è...?", 'Quanto costa?', 'Aiuto!'),
  },
  fra: {
    languageName: 'Γαλλικά',
    phrases: makePhrases(
      'Bonjour',
      'Merci',
      "S'il vous plaît",
      'Oui',
      'Non',
      'Où est...?',
      'Combien ça coûte?',
      'Au secours!'
    ),
  },
  spa: {
    languageName: 'Ισπανικά',
    phrases: makePhrases(
      'Hola',
      'Gracias',
      'Por favor',
      'Sí',
      'No',
      '¿Dónde está...?',
      '¿Cuánto cuesta?',
      '¡Ayuda!'
    ),
  },
  por: {
    languageName: 'Πορτογαλικά',
    phrases: makePhrases('Olá', 'Obrigado', 'Por favor', 'Sim', 'Não', 'Onde fica...?', 'Quanto custa?', 'Socorro!'),
  },
  deu: {
    languageName: 'Γερμανικά',
    phrases: makePhrases('Hallo', 'Danke', 'Bitte', 'Ja', 'Nein', 'Wo ist...?', 'Wie viel kostet das?', 'Hilfe!'),
  },
  nld: {
    languageName: 'Ολλανδικά',
    phrases: makePhrases(
      'Hallo',
      'Dank je wel',
      'Alstublieft',
      'Ja',
      'Nee',
      'Waar is...?',
      'Hoeveel kost dit?',
      'Help!'
    ),
  },
  tur: {
    languageName: 'Τουρκικά',
    phrases: makePhrases(
      'Merhaba',
      'Teşekkür ederim',
      'Lütfen',
      'Evet',
      'Hayır',
      '...nerede?',
      'Bu ne kadar?',
      'İmdat!'
    ),
  },
  ell: {
    languageName: 'Ελληνικά',
    phrases: makePhrases(
      'Γεια σας',
      'Ευχαριστώ',
      'Παρακαλώ',
      'Ναι',
      'Όχι',
      'Πού είναι...;',
      'Πόσο κάνει;',
      'Βοήθεια!'
    ),
  },
  rus: {
    languageName: 'Ρωσικά',
    phrases: makePhrases(
      'Привет',
      'Спасибо',
      'Пожалуйста',
      'Да',
      'Нет',
      'Где...?',
      'Сколько это стоит?',
      'Помогите!'
    ),
  },
  pol: {
    languageName: 'Πολωνικά',
    phrases: makePhrases(
      'Cześć',
      'Dziękuję',
      'Proszę',
      'Tak',
      'Nie',
      'Gdzie jest...?',
      'Ile to kosztuje?',
      'Pomocy!'
    ),
  },
  ces: {
    languageName: 'Τσεχικά',
    phrases: makePhrases('Ahoj', 'Děkuji', 'Prosím', 'Ano', 'Ne', 'Kde je...?', 'Kolik to stojí?', 'Pomoc!'),
  },
  hun: {
    languageName: 'Ουγγρικά',
    phrases: makePhrases(
      'Szia',
      'Köszönöm',
      'Kérem',
      'Igen',
      'Nem',
      'Hol van...?',
      'Mennyibe kerül?',
      'Segítség!'
    ),
  },
  ron: {
    languageName: 'Ρουμανικά',
    phrases: makePhrases('Bună', 'Mulțumesc', 'Vă rog', 'Da', 'Nu', 'Unde este...?', 'Cât costă?', 'Ajutor!'),
  },
  bul: {
    languageName: 'Βουλγαρικά',
    phrases: makePhrases(
      'Здравей',
      'Благодаря',
      'Моля',
      'Да',
      'Не',
      'Къде е...?',
      'Колко струва?',
      'Помощ!'
    ),
  },
  hrv: {
    languageName: 'Κροατικά',
    phrases: makePhrases('Bok', 'Hvala', 'Molim', 'Da', 'Ne', 'Gdje je...?', 'Koliko to košta?', 'Upomoć!'),
  },
  swe: {
    languageName: 'Σουηδικά',
    phrases: makePhrases(
      'Hej',
      'Tack',
      'Snälla',
      'Ja',
      'Nej',
      'Var är...?',
      'Hur mycket kostar det?',
      'Hjälp!'
    ),
  },
  nob: {
    languageName: 'Νορβηγικά',
    phrases: makePhrases(
      'Hei',
      'Takk',
      'Vær så snill',
      'Ja',
      'Nei',
      'Hvor er...?',
      'Hvor mye koster dette?',
      'Hjelp!'
    ),
  },
  dan: {
    languageName: 'Δανικά',
    phrases: makePhrases(
      'Hej',
      'Tak',
      'Vær venlig',
      'Ja',
      'Nej',
      'Hvor er...?',
      'Hvor meget koster det?',
      'Hjælp!'
    ),
  },
  fin: {
    languageName: 'Φινλανδικά',
    phrases: makePhrases(
      'Hei',
      'Kiitos',
      'Ole hyvä',
      'Kyllä',
      'Ei',
      'Missä on...?',
      'Paljonko tämä maksaa?',
      'Apua!'
    ),
  },
  isl: {
    languageName: 'Ισλανδικά',
    phrases: makePhrases(
      'Halló',
      'Takk',
      'Vinsamlegast',
      'Já',
      'Nei',
      'Hvar er...?',
      'Hvað kostar þetta?',
      'Hjálp!'
    ),
  },
  sqi: {
    languageName: 'Αλβανικά',
    phrases: makePhrases(
      'Përshëndetje',
      'Faleminderit',
      'Ju lutem',
      'Po',
      'Jo',
      'Ku është...?',
      'Sa kushton?',
      'Ndihmë!'
    ),
  },
  srp: {
    languageName: 'Σερβικά',
    phrases: makePhrases('Zdravo', 'Hvala', 'Molim', 'Da', 'Ne', 'Gde je...?', 'Koliko košta?', 'Upomoć!'),
  },
  ukr: {
    languageName: 'Ουκρανικά',
    phrases: makePhrases(
      'Привіт',
      'Дякую',
      'Будь ласка',
      'Так',
      'Ні',
      'Де...?',
      'Скільки це коштує?',
      'Допоможіть!'
    ),
  },
  ara: {
    languageName: 'Αραβικά',
    phrases: makePhrases('مرحبا', 'شكرا', 'من فضلك', 'نعم', 'لا', '...أين؟', 'كم يكلف هذا؟', 'النجدة!'),
  },
  heb: {
    languageName: 'Εβραϊκά',
    phrases: makePhrases('שלום', 'תודה', 'בבקשה', 'כן', 'לא', 'איפה...?', 'כמה זה עולה?', 'הצילו!'),
  },
  jpn: {
    languageName: 'Ιαπωνικά',
    phrases: makePhrases(
      'こんにちは',
      'ありがとう',
      'お願いします',
      'はい',
      'いいえ',
      '...はどこですか?',
      'いくらですか?',
      '助けて!'
    ),
  },
  zho: {
    languageName: 'Κινέζικα',
    phrases: makePhrases('你好', '谢谢', '请', '是', '不是', '...在哪里?', '多少钱?', '救命!'),
  },
  kor: {
    languageName: 'Κορεατικά',
    phrases: makePhrases(
      '안녕하세요',
      '감사합니다',
      '부탁합니다',
      '네',
      '아니요',
      '...어디예요?',
      '얼마예요?',
      '도와주세요!'
    ),
  },
  tha: {
    languageName: 'Ταϊλανδικά',
    phrases: makePhrases(
      'สวัสดี',
      'ขอบคุณ',
      'กรุณา',
      'ใช่',
      'ไม่ใช่',
      '...อยู่ที่ไหน?',
      'นี่ราคาเท่าไหร่?',
      'ช่วยด้วย!'
    ),
  },
  vie: {
    languageName: 'Βιετναμέζικα',
    phrases: makePhrases(
      'Xin chào',
      'Cảm ơn',
      'Làm ơn',
      'Vâng',
      'Không',
      '...ở đâu?',
      'Cái này giá bao nhiêu?',
      'Cứu tôi!'
    ),
  },
  ind: {
    languageName: 'Ινδονησιακά',
    phrases: makePhrases(
      'Halo',
      'Terima kasih',
      'Tolong',
      'Ya',
      'Tidak',
      'Di mana...?',
      'Berapa harganya?',
      'Tolong!'
    ),
  },
  hin: {
    languageName: 'Χίντι',
    phrases: makePhrases(
      'नमस्ते',
      'धन्यवाद',
      'कृपया',
      'हाँ',
      'नहीं',
      '...कहाँ है?',
      'यह कितने का है?',
      'मदद करो!'
    ),
  },
  swa: {
    languageName: 'Σουαχίλι',
    phrases: makePhrases(
      'Habari',
      'Asante',
      'Tafadhali',
      'Ndiyo',
      'Hapana',
      '...iko wapi?',
      'Hii ni bei gani?',
      'Msaada!'
    ),
  },
};
