export type Language = 'de' | 'en';
export type Translation = Record<Language, string>;
export type LocalizedText = string | Translation;

export function translate(text: LocalizedText, language: Language): string {
  return typeof text === 'string' ? text : text[language];
}

export const copy = {
  de: {
    intro: 'Notizen zum Japanischen.',
    title: 'Notizen zum Japanischen',
    description:
      'Ein kleines Notizbuch mit Entdeckungen, Verbindungen und Beobachtungen zur japanischen Sprache.',
    notes: 'Notizen',
    browse: 'Stöbern',
    allNotes: 'Alle Notizen',
    tags: 'Tags',
    words: 'Wörter',
    note: 'Notiz',
    notesPlural: 'Notizen',
    noTagNotes: 'Keine Notizen zu diesem Tag.',
    noWordNotes: 'Keine Notizen zu diesem Wort.',
    sources: 'Quellen:',
    related: 'Verwandte Notizen',
    notFound: 'Notiz nicht gefunden.',
    notFoundTitle: 'Seite nicht gefunden',
    skip: 'Zum Inhalt springen',
    home: 'Kotoba-Startseite',
    navigation: 'Hauptnavigation',
    switchLanguage: 'Switch to English',
    graphScroll: 'Weitere Äste: nach rechts scrollen →',
    graphLabel: 'Graph der Wortentwicklung, von oben nach unten',
    attested: 'Belegt: ',
    spellings: 'Schreibweisen: ',
    derivation: 'Herleitung / ältere Formen: ',
    sharedOrigin: 'verwandt',
    possibleOrigin: 'möglicherweise verwandt',
    sharedHistory: 'Gemeinsame Wortgeschichte mit ',
    possibleHistory: 'Möglicherweise gemeinsame Wortgeschichte mit ',
    derivedFrom: 'Ausgehend von ',
    graphLegend:
      'Gestrichelt: Verwandtschaft; „möglicherweise“: vermutete Verbindung. Kanji: Schreibweisen der Wortformen.',
  },
  en: {
    intro: 'Notes on Japanese.',
    title: 'Notes on Japanese',
    description:
      'A small notebook of discoveries, connections, and observations about the Japanese language.',
    notes: 'Notes',
    browse: 'Browse',
    allNotes: 'All notes',
    tags: 'Tags',
    words: 'Words',
    note: 'note',
    notesPlural: 'notes',
    noTagNotes: 'No notes with this tag.',
    noWordNotes: 'No notes about this word.',
    sources: 'Sources:',
    related: 'Related notes',
    notFound: 'Note not found.',
    notFoundTitle: 'Page not found',
    skip: 'Skip to content',
    home: 'Kotoba home',
    navigation: 'Main navigation',
    switchLanguage: 'Zu Deutsch wechseln',
    graphScroll: 'More branches: scroll right →',
    graphLabel: 'Word history graph, from top to bottom',
    attested: 'Attested: ',
    spellings: 'Spellings: ',
    derivation: 'Formation / earlier forms: ',
    sharedOrigin: 'related',
    possibleOrigin: 'possibly related',
    sharedHistory: 'Shared word history with ',
    possibleHistory: 'Possibly shared word history with ',
    derivedFrom: 'From ',
    graphLegend:
      'Dashed: related words; “possibly”: a proposed connection. Kanji: spellings of the word forms.',
  },
} satisfies Record<Language, Record<string, string>>;

const tagTranslations: Record<string, string> = {
  Etymologie: 'Etymology',
  Bedeutungswandel: 'Semantic change',
  Wortbildung: 'Word formation',
  Lautwandel: 'Sound change',
};

export function tagLabel(tag: string, language: Language): string {
  return language === 'en' ? (tagTranslations[tag] ?? tag) : tag;
}
