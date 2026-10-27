import {
  translate,
  type Language,
  type LocalizedText,
  type Translation,
} from './i18n.ts';

interface TimelineStep {
  form: string;
  derivation?: string;
  spellings?: string[];
  meaning: string;
  description: string;
  attestationDate?: string;
  attestation?: string;
}

export interface TimelinePath {
  steps: TimelineStep[];
  branches?: TimelineBranch[];
}

interface TimelineBranch extends TimelinePath {
  connection?: 'shared-origin' | 'possible-origin';
}

export interface Entry {
  id: string;
  date: string;
  title: string;
  reading: string;
  text: string;
  tags: string[];
  words: string[];
  reflection: string;
  timeline?: TimelinePath & {
    earlierOrigin?: { form: string; description: string };
  };
  sources?: { label: string; url: string }[];
}

// Japanese forms, links, and graph structure are shared by both languages.
interface TimelineContent {
  steps: (Omit<
    TimelineStep,
    'meaning' | 'description' | 'attestation' | 'attestationDate'
  > & {
    meaning: Translation;
    description: Translation;
    attestation?: LocalizedText;
    attestationDate?: LocalizedText;
  })[];
  branches?: (TimelineContent & {
    connection?: TimelineBranch['connection'];
  })[];
}

interface EntryContent extends Omit<
  Entry,
  'text' | 'reflection' | 'timeline' | 'sources'
> {
  text: Translation;
  reflection: Translation;
  timeline?: TimelineContent & {
    earlierOrigin?: { form: LocalizedText; description: Translation };
  };
  sources?: { label: LocalizedText; url: string }[];
}

const entryContent: EntryContent[] = [
  {
    id: 'hime',
    date: '2026-10-27',
    title: 'め / 姫 / 娘 / 女神',
    reading: 'me / hime / musume / megami',
    text: {
      de: '姫（ひめ）, 娘（むすめ）und 女神（めがみ）sehen ziemlich verschieden aus. Spricht man sie aus, steckt in allen dreien dasselbe alte め „Frau“ — mal am Ende, mal am Anfang. Die Kanji verstecken den Zusammenhang ein bisschen.',
      en: '姫（ひめ）, 娘（むすめ）, and 女神（めがみ）look quite different. Say them out loud, though, and they all have the same old め ‘woman’ tucked inside — sometimes at the end, sometimes at the beginning. The kanji make that connection a little harder to see.',
    },
    tags: ['Etymologie', 'Bedeutungswandel', 'Wortbildung'],
    words: ['め', '女', '姫', '日女', '媛', '娘', '女神'],
    reflection: {
      de: 'Besonders bei 娘 wäre mir die Zusammensetzung nicht gleich aufgefallen: ein Kanji für das ganze むすめ. 日女 macht dagegen eine Erklärung für ひめ sichtbar. Das ひ wird dabei in der 日本大百科全書 als ehrendes Element gedeutet — daher die alte höfliche Bezeichnung für Frauen.',
      en: '娘 is the one where I would have missed the word’s parts: one kanji for the whole of むすめ. 日女, on the other hand, makes one explanation of ひめ visible. 日本大百科全書 reads ひ as an honorific element here, giving us the old respectful term for women.',
    },
    timeline: {
      steps: [
        {
          form: 'め',
          spellings: ['女'],
          meaning: {
            de: 'Frau / weiblich',
            en: 'woman / female',
          },
          description: {
            de: 'め hieß früher einfach „Frau“. Als Teil anderer Wörter ist es bis heute erhalten geblieben — zum Beispiel in den drei Wörtern hier.',
            en: 'め used to be a word for ‘woman’. It has survived inside other words right up to today — including the three here.',
          },
        },
      ],
      branches: [
        {
          steps: [
            {
              form: 'ひめ',
              derivation: 'ひ ＋ め',
              spellings: ['姫', '媛', '日女'],
              meaning: {
                de: 'ehrende Bezeichnung für Frauen',
                en: 'honorific term for women',
              },
              description: {
                de: 'ひめ war zunächst eine ehrende Bezeichnung für Frauen und wurde auch an Namen angehängt. Die 日本大百科全書 erklärt es als ひ + め und schreibt dafür 日女.',
                en: 'ひめ started out as a respectful term for women and was also attached to names. 日本大百科全書 explains it as ひ + め, written 日女.',
              },
              attestation: {
                de: '日本国語大辞典 verweist auf das 和名抄 (um 934).',
                en: '日本国語大辞典 refers to 和名抄 (c. 934).',
              },
              attestationDate: {
                de: 'um 934',
                en: 'c. 934',
              },
            },
            {
              form: 'ひめ',
              spellings: ['姫'],
              meaning: {
                de: 'Tochter einer vornehmen Familie / Prinzessin',
                en: 'daughter of a noble family / princess',
              },
              description: {
                de: '„Prinzessin“ kommt erst später dazu. Seit der Heian-Zeit nennt man auch die Töchter vornehmer Familien ひめ.',
                en: '‘Princess’ comes along later. From the Heian period onward, daughters of noble families are also called ひめ.',
              },
              attestation: {
                de: '宇津保物語 (um 970–999)',
                en: '宇津保物語 (c. 970–999)',
              },
              attestationDate: {
                de: 'um 970–999',
                en: 'c. 970–999',
              },
            },
          ],
        },
        {
          steps: [
            {
              form: 'むすめ',
              derivation: 'むす ＋ め',
              spellings: ['娘'],
              meaning: {
                de: 'Tochter / junge Frau',
                en: 'daughter / young woman',
              },
              description: {
                de: 'In むすめ stecken むす „entstehen, geboren werden“ und wieder め „Frau“. Die Wörterbücher zerlegen es als 生す女; heute sieht man davon in 娘 nur noch ein einziges Kanji.',
                en: 'むすめ contains むす ‘come into being, be born’ and, again, め ‘woman’. Dictionaries break it down as 生す女; today, all of that is tucked into the single kanji 娘.',
              },
            },
          ],
        },
        {
          steps: [
            {
              form: 'めがみ',
              derivation: 'め ＋ かみ',
              spellings: ['女神'],
              meaning: {
                de: 'Göttin',
                en: 'goddess',
              },
              description: {
                de: 'Hier steht め vorne: め „Frau, weiblich“ + かみ „Gottheit“. Aus dem か wird in der Zusammensetzung ein が — das nennt sich Rendaku. Zusammen also めがみ „Göttin“.',
                en: 'Here め comes first: め ‘woman, female’ + かみ ‘deity’. The か becomes が in the compound — a change called rendaku. Put them together and you get めがみ ‘goddess’.',
              },
            },
          ],
        },
      ],
    },
    sources: [
      {
        label: '日本国語大辞典 · め（雌・女・牝・妻）',
        url: 'https://kotobank.jp/word/%E9%9B%8C-515270',
      },
      {
        label: '日本国語大辞典 / 大辞泉 / 日本大百科全書 · 姫',
        url: 'https://kotobank.jp/word/%E5%A7%AB-471988',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 娘',
        url: 'https://kotobank.jp/word/%E5%A8%98-530512',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 女神',
        url: 'https://kotobank.jp/word/%E5%A5%B3%E7%A5%9E-454455',
      },
    ],
  },
  {
    id: 'arata-atarashii-aratamete',
    date: '2026-10-05',
    title: '新しい / 改めて',
    reading: 'atarashii / aratamete',
    text: {
      de: 'In あたらしい haben た und ら die Plätze getauscht: Früher hieß das Wort あらたし, abgeleitet von あらた „neu“. Damals gab es schon ein anderes あたらし mit der Bedeutung „schade, zu schade“. Laut 大辞泉 kamen die Wörter durcheinander; für „neu“ setzte sich あたらし durch, später あたらしい.',
      en: 'The た and ら in あたらしい have swapped places: the word used to be あらたし, from あらた ‘new’. There was already another あたらし meaning ‘a shame, too good to waste’. According to 大辞泉, the words got mixed up; あたらし caught on for ‘new’, later becoming あたらしい.',
    },
    tags: ['Etymologie', 'Lautwandel', 'Wortbildung'],
    words: ['新しい', '新た', '改めて', '改める', '改まる', 'あらたし'],
    reflection: {
      de: 'Ganz dasselbe Wort waren die beiden あたらし wohl trotzdem nicht: Das 日本国語大辞典 weist auf unterschiedliche Akzente hin. In 改める und 改めて hört man noch das unverdrehte あらた — sinngemäß „neu machen“ und „von Neuem“. Dazu passt auch 改まる: Etwas wird neu oder ändert sich, während man mit 改める selbst etwas ändert.',
      en: 'The two あたらし still seem to have been separate words: 日本国語大辞典 points out their different pitch accents. 改める and 改めて keep the unswapped あらた — roughly ‘make new’ and ‘anew’. 改まる fits too: something becomes new or changes, while with 改める you change something yourself.',
    },
    timeline: {
      steps: [
        {
          form: 'あらた',
          spellings: ['新た'],
          meaning: {
            de: 'neu',
            en: 'new',
          },
          description: {
            de: 'あらた heißt „neu“. In 新たな始まり „ein neuer Anfang“ steht es noch heute fast genauso da.',
            en: 'あらた means ‘new’. You can still find it looking much the same in 新たな始まり ‘a new beginning’.',
          },
        },
      ],
      branches: [
        {
          steps: [
            {
              form: 'あらたし',
              meaning: {
                de: 'neu / am Anfang',
                en: 'new / at the beginning',
              },
              description: {
                de: 'Aus あらた wurde das Adjektiv あらたし. Gerade für das neue Jahr war das im alten Japan ein gebräuchliches Wort.',
                en: 'あらた gave us the adjective あらたし. In ancient Japan, it was often used when talking about the new year.',
              },
              attestation: {
                de: '8. Jahrhundert · 万葉集 4516',
                en: '8th century · 万葉集 4516',
              },
              attestationDate: {
                de: '8. Jh.',
                en: '8th c.',
              },
            },
            {
              form: 'あたらしい',
              derivation: 'あらたし → あたらし',
              spellings: ['新しい'],
              meaning: {
                de: 'neu / frisch',
                en: 'new / fresh',
              },
              description: {
                de: 'た und ら tauschen die Plätze: あらたし wird zu あたらし. Diese Form für „neu“ taucht schon in der frühen Heian-Zeit auf; heute sagen wir あたらしい.',
                en: 'た and ら swap places: あらたし becomes あたらし. This form for ‘new’ turns up in the early Heian period; today we say あたらしい.',
              },
              attestation: '905–914 · 古今和歌集 (あたらしき)',
              attestationDate: '905–914',
            },
          ],
        },
        {
          steps: [
            {
              form: 'あらためる',
              derivation: 'あらたむ',
              spellings: ['改む', '改める'],
              meaning: {
                de: 'erneuern / ändern / verbessern',
                en: 'renew / change / improve',
              },
              description: {
                de: 'Aus あらた entstand auch ein Verb: あらたむ, heute あらためる. Erst einmal geht es ums Neumachen; später kann man damit auch Fehler oder Gewohnheiten verbessern.',
                en: 'あらた also gave us a verb: あらたむ, now あらためる. It starts with making something new; later, it can also mean correcting mistakes or improving habits.',
              },
              attestation: {
                de: '795 · Gedicht in 類聚国史; „verbessern“ in 源氏物語 (1001–1014)',
                en: '795 · poem in 類聚国史; ‘improve’ in 源氏物語 (1001–1014)',
              },
              attestationDate: '795',
            },
            {
              form: 'あらためて',
              derivation: 'あらため ＋ て',
              spellings: ['改めて'],
              meaning: {
                de: 'erneut / von Neuem',
                en: 'again / anew',
              },
              description: {
                de: 'あらため + て wird zu „noch einmal, von Neuem“. Bei 改めて気づく wird einem etwas zum Beispiel erneut bewusst — oder man bemerkt es, als sähe man es zum ersten Mal.',
                en: 'あらため + て gives us ‘again, anew’. With 改めて気づく, for instance, you become aware of something afresh — or notice it as if seeing it for the first time.',
              },
            },
          ],
        },
      ],
    },
    sources: [
      {
        label: '大辞泉 · 新たし',
        url: 'https://kotobank.jp/word/%E6%96%B0%E3%81%9F%E3%81%97-427954',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 新しい',
        url: 'https://kotobank.jp/word/%E6%96%B0%E3%81%97%E3%81%84-425335',
      },
      {
        label: '日本国語大辞典 · 改める',
        url: 'https://kotobank.jp/word/%E6%94%B9%E3%82%81%E3%82%8B-427965',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 改めて',
        url: 'https://kotobank.jp/word/%E6%94%B9%E3%82%81%E3%81%A6-427964',
      },
      {
        label: '日本国語大辞典 · 改まる',
        url: 'https://kotobank.jp/word/%E6%94%B9%E3%81%BE%E3%82%8B-427961',
      },
    ],
  },
  {
    id: 'arawa-arawasu',
    date: '2026-10-09',
    title: '表す / 現す / 顕す / 著す',
    reading: 'arawasu',
    text: {
      de: 'あらわ heißt „offen sichtbar, unverhüllt“. Mit あらわす macht man also etwas sichtbar — zum Beispiel einen Gedanken oder ein Gefühl. Je nachdem, worum es geht, schreibt man dasselbe Wort als 表す, 現す, 顕す oder 著す.',
      en: 'あらわ means ‘openly visible, uncovered’. With あらわす, you make something visible — a thought or a feeling, for example. Depending on what you mean, the same spoken word is written 表す, 現す, 顕す, or 著す.',
    },
    tags: ['Etymologie', 'Bedeutungswandel', 'Wortbildung'],
    words: [
      'あら',
      'あらわ',
      '表す',
      '現す',
      '顕す',
      '著す',
      '現れる',
      '表れる',
      '顕れる',
      'あり',
      'ある',
    ],
    reflection: {
      de: 'Sogar „ein Buch verfassen“ steckt in dieser Wortfamilie: 著す. Dazu passt 現れる „erscheinen“: Hier macht niemand etwas sichtbar, sondern etwas kommt selbst zum Vorschein. Die älteren Schreibungen あらはす und あらはる sehen mit ihrem は noch etwas anders aus.',
      en: 'Even ‘write a book’ belongs to this word family: 著す. 現れる ‘appear’ fits alongside it: here, something comes into view rather than someone making it visible. The older spellings あらはす and あらはる look a little different with their は.',
    },
    timeline: {
      earlierOrigin: {
        form: {
          de: 'Noch weiter zurück: あら / ar-?',
          en: 'Further back: あら / ar-?',
        },
        description: {
          de: 'Hinter あらわ könnte noch あら stecken. Das 日本国語大辞典 sieht mögliche Verbindungen zu あら „naturbelassen“, „neu“ und „sichtbar“. Noch weiter geht das 岩波古語辞典: Es bringt あり „existieren“, das alte ある „geboren werden“ und あらはれ „erscheinen“ mit einer Wurzel ar- „Geburt, Erscheinen“ zusammen (zitiert bei Moriya 2025, S. 9). Eine Spur also — aber wie aus あら genau あらは geworden sein soll, bleibt offen.',
          en: 'There may be an older あら behind あらわ. 日本国語大辞典 sees possible links with あら ‘in its natural state’, ‘new’, and ‘visible’. 岩波古語辞典 goes further, connecting あり ‘exist’, the old ある ‘be born’, and あらはれ ‘appear’ with a root ar- ‘birth, appearance’ (quoted in Moriya 2025, p. 9). A lead, then — but exactly how あら might have become あらは is still an open question.',
        },
      },
      steps: [
        {
          form: 'あらわ',
          derivation: 'あらは',
          spellings: ['露', '顕'],
          meaning: {
            de: 'offen sichtbar / unverhüllt',
            en: 'openly visible / uncovered',
          },
          description: {
            de: 'Was あらわ ist, liegt offen da: sichtbar, unverhüllt. Früher schrieb man あらは. Woher das Wort noch weiter zurück kommt, ist weniger klar; das 日本国語大辞典 vermutet einen Zusammenhang mit あら.',
            en: 'Something that is あらわ is out in the open: visible, uncovered. It used to be written あらは. Its deeper history is less clear; 日本国語大辞典 suggests a connection with あら.',
          },
          attestationDate: '720',
          attestation: '日本書紀 · あらはに',
        },
      ],
      branches: [
        {
          steps: [
            {
              form: 'あらわす',
              derivation: 'あらはす',
              spellings: ['表す', '現す', '顕す', '著す'],
              meaning: {
                de: 'offenkundig machen / ausdrücken',
                en: 'make apparent / express',
              },
              description: {
                de: 'Mit あらわす bringt man etwas nach außen. Das kann ein Gefühl sein, etwas bisher Verborgenes oder auch ein Text, den man verfasst. Die verschiedenen Kanji sortieren diese Bedeutungen auseinander.',
                en: 'With あらわす, you bring something out into the open. It might be a feeling, something previously hidden, or even a text you write. The different kanji sort these meanings apart.',
              },
              attestationDate: {
                de: '8. Jh.',
                en: '8th c.',
              },
              attestation: '万葉集 854 · あらはさず',
            },
          ],
        },
        {
          connection: 'shared-origin',
          steps: [
            {
              form: 'あらわれる',
              derivation: 'あらはる',
              spellings: ['現れる', '表れる', '顕れる'],
              meaning: {
                de: 'erscheinen / sichtbar werden',
                en: 'appear / become visible',
              },
              description: {
                de: 'Hier kommt etwas zum Vorschein oder wird bekannt. Die ältere Form heißt あらはる, heute sagt man あらわれる. Auch dieses Wort verteilt seine Bedeutungen auf mehrere Kanji.',
                en: 'Here, something comes into view or becomes known. The older form is あらはる; today we say あらわれる. This word’s meanings are spread across several kanji too.',
              },
            },
          ],
        },
      ],
    },
    sources: [
      {
        label: {
          de: '日本国語大辞典 · 荒 (語誌 zur あら-Wortfamilie)',
          en: '日本国語大辞典 · 荒 (語誌 on the あら word family)',
        },
        url: 'https://kotobank.jp/word/荒-427727',
      },
      {
        label: '日本国語大辞典 · 露わ',
        url: 'https://kotobank.jp/word/露わ-199515',
      },
      {
        label: '日本国語大辞典 · 表す',
        url: 'https://kotobank.jp/word/表す-613374',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 現れる',
        url: 'https://kotobank.jp/word/現れる-428142',
      },
      {
        label: {
          de: 'Moriya 2025 · ar- und あり (S. 9, Zitat aus 岩波古語辞典)',
          en: 'Moriya 2025 · ar- and あり (p. 9, quoting 岩波古語辞典)',
        },
        url: 'https://ls-japan.org/wp-content/uploads/2025/11/lsj171-moriya.pdf#page=9',
      },
    ],
  },
  {
    id: 'ato',
    date: '2026-10-05',
    title: '後 / 跡 / あと',
    reading: 'ato',
    text: {
      de: 'あと kann „Spur“ heißen, aber auch „hinter“ oder „danach“. Angefangen hat es laut 日本国語大辞典 bei あ „Fuß“ + と „Ort, Stelle“ — also da, wo ein Fuß aufgesetzt wurde. Aus der Fußstelle wird eine Spur, und von dort geht es weiter zu dem, was räumlich oder zeitlich dahinter liegt.',
      en: 'あと can mean ‘trace’, but also ‘behind’ or ‘after’. According to 日本国語大辞典, it started with あ ‘foot’ + と ‘place, spot’ — the place where a foot was put down. That spot becomes a trace, which in turn leads to what lies behind it in space or time.',
    },
    tags: ['Etymologie', 'Bedeutungswandel'],
    words: ['後', '跡', 'あと'],
    reflection: {
      de: 'Mit 跡 und 後 sieht das schnell nach zwei verschiedenen Wörtern aus. Spricht man sie aus, bleibt einfach あと. Im 万葉集 findet man es noch für den Fuß oder den Bereich um die Füße; in den 仏足石歌 um 753 dann für den Fußabdruck.',
      en: 'Written 跡 and 後, these can easily look like two different words. Say them out loud and both are simply あと. In 万葉集, it can still mean the foot or the area around the feet; in 仏足石歌, around 753, it is used for a footprint.',
    },
    timeline: {
      steps: [
        {
          form: 'あと',
          derivation: 'あ ＋ と',
          meaning: {
            de: 'Fuß / Fußstelle',
            en: 'foot / place of a foot',
          },
          description: {
            de: 'あ „Fuß“ und と „Ort, Stelle“: So zerlegt das 日本国語大辞典 das Wort. Im alten Japan konnte あと auch den Fuß selbst oder den Bereich um die Füße meinen.',
            en: 'あ ‘foot’ and と ‘place, spot’: that is how 日本国語大辞典 breaks the word down. In ancient Japan, あと could also mean the foot itself or the area around the feet.',
          },
          attestation: {
            de: 'Altjapanisch · u. a. im 万葉集',
            en: 'Old Japanese · including 万葉集',
          },
          attestationDate: {
            de: '8. Jh.',
            en: '8th c.',
          },
        },
        {
          form: 'あと',
          spellings: ['跡'],
          meaning: {
            de: 'Fußabdruck',
            en: 'footprint',
          },
          description: {
            de: 'Da stand eben noch ein Fuß — jetzt sieht man seinen Abdruck. Auch das ist ein あと.',
            en: 'A foot was just there — now you can see the print it left. That is an あと too.',
          },
          attestation: {
            de: 'Um 753 · 仏足石歌',
            en: 'Around 753 · 仏足石歌',
          },
          attestationDate: {
            de: 'um 753',
            en: 'c. 753',
          },
        },
        {
          form: 'あと',
          spellings: ['跡'],
          meaning: {
            de: 'Spur / Überrest',
            en: 'trace / remains',
          },
          description: {
            de: 'Es bleibt nicht beim Fußabdruck. Auch ein Boot kann eine Spur hinterlassen, und von einem vergangenen Geschehen kann etwas übrig bleiben.',
            en: 'It does not stop at footprints. A boat can leave a trace too, and something can remain from a past event.',
          },
          attestation: {
            de: '8. Jahrhundert · 万葉集',
            en: '8th century · 万葉集',
          },
          attestationDate: {
            de: '8. Jh.',
            en: '8th c.',
          },
        },
        {
          form: 'あと',
          spellings: ['後'],
          meaning: {
            de: 'hinter / hinten',
            en: 'behind / at the back',
          },
          description: {
            de: 'Eine Spur liegt hinter jemandem, der weitergeht. Aus „Spur“ wird laut Wörterbuch auch das räumliche „hinter, hinten“ — dafür schreibt man 後.',
            en: 'A trace lies behind someone who has moved on. According to the dictionary, ‘trace’ also gives us the spatial sense ‘behind, at the back’ — written 後.',
          },
          attestation: '1001–1014 · 源氏物語',
          attestationDate: '1001–1014',
        },
        {
          form: 'あと',
          spellings: ['後'],
          meaning: {
            de: 'danach / später',
            en: 'after / later',
          },
          description: {
            de: 'Von „hinter“ ist es auch zeitlich nicht weit zu „danach“. In 雨の後 „nach dem Regen“ geht es dann um die Zeit nach einem Ereignis.',
            en: '‘Behind’ also makes sense in time as ‘after’. In 雨の後 ‘after the rain’, it is the time following an event.',
          },
          attestation: {
            de: 'Um 1204 · 隆信集 (für „nach einem Ereignis“)',
            en: 'Around 1204 · 隆信集 (for ‘after an event’)',
          },
          attestationDate: {
            de: 'um 1204',
            en: 'c. 1204',
          },
        },
      ],
    },
    sources: [
      {
        label: '日本国語大辞典 / 大辞泉 · 跡',
        url: 'https://kotobank.jp/word/%E8%B7%A1-425811',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 後',
        url: 'https://kotobank.jp/word/%E5%BE%8C-425801',
      },
    ],
  },
  {
    id: 'shiru-shirusu-shirushi',
    date: '2026-10-03',
    title: '知る / 記す / 印 / 著しい',
    reading: 'shiru / shirusu / shirushi / ichijirushii',
    text: {
      de: 'Wer etwas aufschreibt, macht es für andere erkennbar: 記す „aufschreiben, kennzeichnen“ gehört laut 全訳古語辞典 zu 知る „wissen, erkennen“ und 知らす „wissen lassen“. Aus der Verbform しるし wird dann das Wort für ein „Zeichen“, etwa 印. Auch das alte 著し（しるし）„klar erkennbar“ gehört nach diesem Wörterbuch zur selben Familie — und führt mit ein paar weiteren Schritten zu 著しい „auffällig“.',
      en: 'Writing something down makes it recognizable to others: according to 全訳古語辞典, 記す ‘write down, mark’ belongs with 知る ‘know, recognize’ and 知らす ‘make known’. The verb form しるし then becomes a word for ‘sign’, written 印 among other ways. The old 著し（しるし）‘clearly recognizable’ belongs to the same family, says the dictionary — and a few more steps lead to 著しい ‘striking’.',
    },
    tags: ['Etymologie', 'Wortbildung', 'Lautwandel'],
    words: ['知る', '記す', '印', 'しるし', '知らす', '著し', '著しい'],
    reflection: {
      de: 'Bei 著しい kommt noch das verstärkende いち- dazu. Unterwegs begegnen einem いちしろし, いちしるし und die stimmhafte Form いちじるし; bis zum heutigen いちじるしい ändert sich auch die Adjektivendung. 印 „Zeichen“ und 著し „klar erkennbar“ sind dabei verwandte Wörter. Das heißt aber nicht, dass das Adjektiv aus dem Nomen entstanden ist.',
      en: '著しい also picks up the intensifying いち-. Along the way, we meet いちしろし, いちしるし, and the voiced form いちじるし; the adjective ending changes too before we reach today’s いちじるしい. 印 ‘sign’ and 著し ‘clearly recognizable’ are related words. That does not mean the adjective came from the noun.',
    },
    timeline: {
      steps: [
        {
          form: 'しる',
          spellings: ['知る'],
          meaning: {
            de: 'wissen / erkennen',
            en: 'know / recognize',
          },
          description: {
            de: 'しる heißt „wissen, erkennen“, しらす „wissen lassen“. Bei diesen beiden Verben setzt das 全訳古語辞典 die Wortgeschichte an.',
            en: 'しる means ‘know, recognize’; しらす means ‘make known’. 全訳古語辞典 starts the word’s history with these two verbs.',
          },
        },
      ],
      branches: [
        {
          steps: [
            {
              form: 'しるす',
              derivation: 'しる / しらす',
              spellings: ['記す'],
              meaning: {
                de: 'kennzeichnen / aufschreiben',
                en: 'mark / write down',
              },
              description: {
                de: 'Etwas markieren oder aufschreiben macht es erkennbar. Dazu passt, dass das Wörterbuch しるす auf しる und しらす zurückführt.',
                en: 'Marking something or writing it down makes it recognizable. That fits with the dictionary tracing しるす back to しる and しらす.',
              },
            },
            {
              form: 'しるし',
              spellings: ['印'],
              meaning: {
                de: 'Zeichen / Merkmal',
                en: 'sign / feature',
              },
              description: {
                de: 'Eine Form von しるす lautet しるし. Daraus wird ein eigenes Wort für „Zeichen, Merkmal“; 印 ist eine seiner Schreibweisen.',
                en: 'One form of しるす is しるし. That becomes a word in its own right for ‘sign, feature’; 印 is one of its spellings.',
              },
              attestation: {
                de: 'Als „Zeichen“ bereits im 万葉集 (8. Jahrhundert)',
                en: 'Already used for ‘sign’ in 万葉集 (8th century)',
              },
              attestationDate: {
                de: '8. Jh.',
                en: '8th c.',
              },
            },
          ],
        },
        {
          connection: 'shared-origin',
          steps: [
            {
              form: 'しるし',
              spellings: ['著し'],
              meaning: {
                de: 'klar erkennbar',
                en: 'clearly recognizable',
              },
              description: {
                de: 'しるし kann auch ein Adjektiv sein: „klar erkennbar, hervortretend“, geschrieben 著し. Laut 全訳古語辞典 teilt es den Ursprung des Nomens しるし. Die gestrichelte Linie verbindet also Verwandte; sie steht nicht für eine direkte Ableitung.',
                en: 'しるし can also be an adjective: ‘clearly recognizable, prominent’, written 著し. According to 全訳古語辞典, it shares an origin with the noun しるし. The dashed line connects relatives; it does not show a direct derivation.',
              },
              attestation: '720 · 日本書紀 (歌謡)',
              attestationDate: '720',
            },
            {
              form: 'いちじるしい',
              derivation: 'いち ＋ しるし → いちしるし → いちじるし',
              spellings: ['著しい'],
              meaning: {
                de: 'auffällig / deutlich',
                en: 'striking / conspicuous',
              },
              description: {
                de: 'Mit dem verstärkenden いち- wird aus しるし ein いちしるし; daneben ist auch いちしろし belegt. Später wird das s stimmhaft: いちじるし. Bis zum heutigen いちじるしい ändert sich dann noch die Adjektivendung.',
                en: 'Add the intensifying いち- to しるし and you get いちしるし; いちしろし is also attested. Later, the s becomes voiced: いちじるし. The adjective ending changes as well before we arrive at today’s いちじるしい.',
              },
            },
          ],
        },
      ],
    },
    sources: [
      {
        label: '全訳古語辞典 (東京書籍) · しるし',
        url: 'https://jlogos.com/ausp/word.html?id=5085848',
      },
      {
        label: '日本国語大辞典 · 印',
        url: 'https://kotobank.jp/word/%E5%8D%B0-32766',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 著し',
        url: 'https://kotobank.jp/word/%E8%91%97%E3%81%97-433433',
      },
      {
        label: '日本国語大辞典 / 大辞泉 · 著しい',
        url: 'https://kotobank.jp/word/%E8%91%97%E3%81%97%E3%81%84-433434',
      },
    ],
  },
];

function localizePath(path: TimelineContent, language: Language): TimelinePath {
  return {
    steps: path.steps.map((step) => ({
      ...step,
      meaning: translate(step.meaning, language),
      description: translate(step.description, language),
      attestation:
        step.attestation === undefined
          ? undefined
          : translate(step.attestation, language),
      attestationDate:
        step.attestationDate === undefined
          ? undefined
          : translate(step.attestationDate, language),
    })),
    branches: path.branches?.map((branch) => ({
      ...localizePath(branch, language),
      connection: branch.connection,
    })),
  };
}

function localizeEntries(language: Language): Entry[] {
  return entryContent.map((entry) => ({
    ...entry,
    text: translate(entry.text, language),
    reflection: translate(entry.reflection, language),
    timeline: entry.timeline
      ? {
          ...localizePath(entry.timeline, language),
          earlierOrigin: entry.timeline.earlierOrigin
            ? {
                form: translate(entry.timeline.earlierOrigin.form, language),
                description: translate(
                  entry.timeline.earlierOrigin.description,
                  language,
                ),
              }
            : undefined,
        }
      : undefined,
    sources: entry.sources?.map((source) => ({
      ...source,
      label: translate(source.label, language),
    })),
  }));
}

const entriesByLanguage = {
  de: localizeEntries('de'),
  en: localizeEntries('en'),
};

export const entries = entriesByLanguage.de;

export function getLocalizedEntries(language: Language): Entry[] {
  return entriesByLanguage[language];
}
