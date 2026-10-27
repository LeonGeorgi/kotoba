import { useEffect, useRef, useSyncExternalStore } from 'react';
import { getLocalizedEntries, type Entry } from './entries';
import { copy, tagLabel, type Language } from './i18n';
import { MeaningGraph } from './MeaningGraph';
import { Furigana } from './JapaneseText';
import {
  formatDate,
  getEntries,
  getTopics,
  getLanguage,
  languageLink,
  parseRoute,
  routeLink,
  type Route,
} from './notebook';

function subscribeToHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function TopicLinks({
  kind,
  values,
  language,
}: {
  kind: 'tag' | 'word';
  values: string[];
  language: Language;
}) {
  return (
    <div className={`topic-links ${kind}-links`}>
      {values.map((value) => (
        <a
          key={value}
          href={routeLink(kind, value, language)}
          lang={kind === 'word' ? 'ja' : undefined}
        >
          {kind === 'tag' ? `#${tagLabel(value, language)}` : value}
        </a>
      ))}
    </div>
  );
}

function EntryCard({ entry, language }: { entry: Entry; language: Language }) {
  return (
    <article className="entry-card">
      <div className="entry-heading">
        <h2 lang="ja">
          <a href={routeLink('entry', entry.id, language)}>
            <Furigana text={entry.title} />
          </a>
        </h2>
        <time dateTime={entry.date}>
          {formatDate(entry.date, false, language)}
        </time>
      </div>
      <p className="reading">{entry.reading}</p>
      {entry.timeline ? (
        <MeaningGraph timeline={entry.timeline} language={language} compact />
      ) : (
        <p className="entry-text">{entry.text}</p>
      )}
      <TopicLinks kind="tag" values={entry.tags} language={language} />
    </article>
  );
}

function EntryList({ route, language }: { route: Route; language: Language }) {
  const labels = copy[language];
  const filtered = route.kind === 'tag' || route.kind === 'word';
  const notes = getEntries(route, language);
  return (
    <>
      {filtered ? (
        <div className="filter-heading">
          <h1 lang={route.kind === 'word' ? 'ja' : undefined}>
            {route.kind === 'tag' ? (
              `#${tagLabel(route.value, language)}`
            ) : (
              <Furigana text={route.value} />
            )}
          </h1>
          <a href={languageLink('#/', language)}>{labels.allNotes}</a>
        </div>
      ) : (
        <h1 className="intro">{labels.intro}</h1>
      )}
      {notes.length ? (
        notes.map((entry) => (
          <EntryCard key={entry.id} entry={entry} language={language} />
        ))
      ) : (
        <p>{route.kind === 'tag' ? labels.noTagNotes : labels.noWordNotes}</p>
      )}
    </>
  );
}

function Browse({ language }: { language: Language }) {
  const labels = copy[language];
  return (
    <div className="browse-page">
      <h1>{labels.browse}</h1>
      {(['tag', 'word'] as const).map((kind) => (
        <section key={kind}>
          <h2>{kind === 'tag' ? labels.tags : labels.words}</h2>
          <ul className={`browse-topics ${kind}-topics`}>
            {getTopics(kind, language).map(({ value, count }) => (
              <li key={value}>
                <a
                  href={routeLink(kind, value, language)}
                  lang={kind === 'word' ? 'ja' : undefined}
                >
                  {kind === 'tag' ? `#${tagLabel(value, language)}` : value}
                </a>
                <span
                  className="topic-count"
                  aria-label={`${count} ${count === 1 ? labels.note : labels.notesPlural}`}
                >
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Detail({ entry, language }: { entry: Entry; language: Language }) {
  const labels = copy[language];
  const related = getEntries({ kind: 'home' }, language)
    .filter(
      (note) =>
        note.id !== entry.id &&
        (note.tags.some((tag) => entry.tags.includes(tag)) ||
          note.words.some((word) => entry.words.includes(word))),
    )
    .slice(0, 2);
  return (
    <article className="detail">
      <a className="back-link" href={languageLink('#/', language)}>
        ← {labels.allNotes}
      </a>
      <div className="entry-heading">
        <h1 lang="ja">
          <Furigana text={entry.title} />
        </h1>
        <time dateTime={entry.date}>
          {formatDate(entry.date, false, language)}
        </time>
      </div>
      <p className="reading">{entry.reading}</p>
      <p className="entry-text">{entry.text}</p>
      {entry.timeline && (
        <MeaningGraph timeline={entry.timeline} language={language} />
      )}
      <p>{entry.reflection}</p>
      {entry.sources && entry.sources.length > 0 && (
        <div className="source-link">
          {labels.sources}
          <ul>
            {entry.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <dl className="detail-topics">
        {entry.tags.length > 0 && (
          <>
            <dt>{labels.tags}</dt>
            <dd>
              <TopicLinks kind="tag" values={entry.tags} language={language} />
            </dd>
          </>
        )}
        {entry.words.length > 0 && (
          <>
            <dt>{labels.words}</dt>
            <dd>
              <TopicLinks
                kind="word"
                values={entry.words}
                language={language}
              />
            </dd>
          </>
        )}
      </dl>
      {related.length > 0 && (
        <section className="related">
          <h2>{labels.related}</h2>
          <ul>
            {related.map((note) => (
              <li key={note.id}>
                <a href={routeLink('entry', note.id, language)} lang="ja">
                  {note.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export default function App() {
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
  );
  const route = parseRoute(hash);
  const language = getLanguage(hash);
  const labels = copy[language];
  const otherLanguage = language === 'de' ? 'en' : 'de';
  const entry =
    route.kind === 'entry'
      ? getLocalizedEntries(language).find((note) => note.id === route.value)
      : undefined;
  const isMissing =
    route.kind === 'not-found' || (route.kind === 'entry' && !entry);
  const mainRef = useRef<HTMLElement>(null);
  const previousHash = useRef(hash);
  const title =
    entry?.title ??
    (route.kind === 'browse'
      ? labels.browse
      : route.kind === 'tag'
        ? tagLabel(route.value, language)
        : route.kind === 'word'
          ? route.value
          : isMissing
            ? labels.notFoundTitle
            : labels.title);

  useEffect(() => {
    document.title = `${title} — Kotoba`;
    document.documentElement.lang = language;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', labels.description);
    if (previousHash.current !== hash) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
      previousHash.current = hash;
    }
  }, [hash, title, language, labels.description]);

  return (
    <div className="site-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        {labels.skip}
      </a>
      <header className="site-header">
        <a
          className="brand"
          href={languageLink('#/', language)}
          aria-label={labels.home}
        >
          kotoba
        </a>
        <nav aria-label={labels.navigation}>
          <a
            href={languageLink('#/', language)}
            aria-current={
              route.kind === 'home' ||
              route.kind === 'tag' ||
              route.kind === 'word'
                ? 'page'
                : undefined
            }
          >
            {labels.notes}
          </a>
          <a
            href={languageLink('#/browse', language)}
            aria-current={route.kind === 'browse' ? 'page' : undefined}
          >
            {labels.browse}
          </a>
          <a
            className="language-switch"
            href={languageLink(hash, otherLanguage)}
            lang={otherLanguage}
            hrefLang={otherLanguage}
            aria-label={labels.switchLanguage}
          >
            {otherLanguage === 'en' ? 'English' : 'Deutsch'}
          </a>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        {isMissing ? (
          <div className="empty-state">
            <h1>{labels.notFound}</h1>
            <a href={languageLink('#/', language)}>{labels.allNotes}</a>
          </div>
        ) : route.kind === 'browse' ? (
          <Browse language={language} />
        ) : entry ? (
          <Detail entry={entry} language={language} />
        ) : (
          <EntryList route={route} language={language} />
        )}
      </main>
    </div>
  );
}
