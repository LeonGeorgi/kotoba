import { getLocalizedEntries } from './entries.ts';
import type { Language } from './i18n.ts';

export type Route =
  | { kind: 'home' }
  | { kind: 'browse' }
  | { kind: 'entry'; value: string }
  | { kind: 'tag' | 'word'; value: string }
  | { kind: 'not-found' };

export function getLanguage(hash: string): Language {
  return /^#?\/en(?:\/|$)/.test(hash) ? 'en' : 'de';
}

export function languageLink(hash: string, language: Language): string {
  const path = hash.replace(/^#/, '').replace(/^\/en(?=\/|$)/, '') || '/';
  return `#${language === 'en' ? '/en' : ''}${path}`;
}

export function parseRoute(hash: string): Route {
  const path = languageLink(hash, 'de').slice(1);
  if (path === '/') return { kind: 'home' };
  if (path === '/browse') return { kind: 'browse' };
  const match = /^\/(entry|tag|word)\/([^/]+)$/.exec(path);
  if (!match) return { kind: 'not-found' };
  try {
    return {
      kind: match[1] as 'entry' | 'tag' | 'word',
      value: decodeURIComponent(match[2]),
    };
  } catch {
    return { kind: 'not-found' };
  }
}

export function routeLink(
  kind: 'entry' | 'tag' | 'word',
  value: string,
  language: Language = 'de',
): string {
  return languageLink(`#/${kind}/${encodeURIComponent(value)}`, language);
}

export function getEntries(route: Route, language: Language = 'de') {
  return getLocalizedEntries(language)
    .filter((entry) => {
      if (route.kind === 'tag') return entry.tags.includes(route.value);
      if (route.kind === 'word') return entry.words.includes(route.value);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTopics(kind: 'tag' | 'word', language: Language = 'de') {
  const values = getLocalizedEntries(language).flatMap((entry) =>
    kind === 'tag' ? entry.tags : entry.words,
  );
  return [...new Set(values)].map((value) => ({
    value,
    count: values.filter((item) => item === value).length,
  }));
}

export function formatDate(
  date: string,
  short = false,
  language: Language = 'de',
): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'de-DE', {
    day: '2-digit',
    month: language === 'en' ? 'short' : '2-digit',
    ...(short ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
