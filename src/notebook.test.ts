import assert from 'node:assert/strict';
import test from 'node:test';
import { entries, getLocalizedEntries, type TimelinePath } from './entries.ts';
import { buildMeaningGraph } from './graphLayout.ts';
import { addFurigana } from './furigana.ts';
import { tagLabel } from './i18n.ts';
import {
  formatDate,
  getEntries,
  getTopics,
  getLanguage,
  languageLink,
  parseRoute,
  routeLink,
} from './notebook.ts';

test('Japanese word links round-trip and invalid routes fail safely', () => {
  assert.deepEqual(parseRoute(routeLink('word', '後 / あと')), {
    kind: 'word',
    value: '後 / あと',
  });
  assert.deepEqual(parseRoute(''), { kind: 'home' });
  assert.deepEqual(parseRoute('#/browse'), { kind: 'browse' });
  assert.deepEqual(parseRoute('#/word/%E0%A4%A'), { kind: 'not-found' });
  assert.deepEqual(parseRoute('#/something/else'), { kind: 'not-found' });
});

test('notes are chronological and filters only include matching notes', () => {
  const notes = getEntries({ kind: 'home' });
  assert.deepEqual(
    notes.map((note) => note.date),
    [...notes.map((note) => note.date)].sort().reverse(),
  );
  assert.deepEqual(
    getEntries({ kind: 'word', value: '跡' }).map((note) => note.id),
    ['ato'],
  );
  assert.equal(getEntries({ kind: 'tag', value: 'Etymologie' }).length, 5);
  assert.equal(getEntries({ kind: 'word', value: 'unwritten' }).length, 0);
  assert.deepEqual(
    getEntries({ kind: 'word', value: '著しい' }).map((note) => note.id),
    ['shiru-shirusu-shirushi'],
  );
  assert.ok(
    getEntries({ kind: 'tag', value: 'Wortbildung' }).every((note) =>
      note.tags.includes('Wortbildung'),
    ),
  );
});

test('topic counts and entry IDs support consistent links', () => {
  assert.equal(new Set(entries.map((note) => note.id)).size, entries.length);
  for (const { value, count } of getTopics('tag')) {
    assert.equal(count, getEntries({ kind: 'tag', value }).length);
  }
  for (const entry of entries) {
    assert.deepEqual(parseRoute(routeLink('entry', entry.id)), {
      kind: 'entry',
      value: entry.id,
    });
  }
});

test('calendar dates are independent of the browser timezone', () => {
  assert.equal(formatDate('2026-10-05'), '05.10.2026');
  assert.equal(formatDate('2026-10-05', true), '05.10.');
  assert.equal(formatDate('2026-10-05', false, 'en'), '05 Oct 2026');
  assert.equal(formatDate('2026-10-05', true, 'en'), '05 Oct');
});

test('language links preserve the current note, filter, and Japanese URLs', () => {
  const routes = [
    '#/',
    '#/browse',
    routeLink('entry', 'hime'),
    routeLink('tag', 'Bedeutungswandel'),
    routeLink('word', '後 / あと'),
  ];
  for (const hash of routes) {
    const englishLink = languageLink(hash, 'en');
    assert.equal(getLanguage(englishLink), 'en');
    assert.deepEqual(parseRoute(englishLink), parseRoute(hash));
    assert.equal(languageLink(englishLink, 'de'), hash);
    assert.equal(languageLink(englishLink, 'en'), englishLink);
  }
  assert.equal(languageLink('', 'en'), '#/en/');
  assert.deepEqual(parseRoute('#/en'), { kind: 'home' });
  assert.equal(getLanguage('#/entry/en'), 'de');
  assert.deepEqual(parseRoute('#/en/word/%E0%A4%A'), { kind: 'not-found' });
  assert.deepEqual(parseRoute('#/en/something/else'), { kind: 'not-found' });
  assert.deepEqual(parseRoute(routeLink('entry', 'ato', 'en')), {
    kind: 'entry',
    value: 'ato',
  });
});

test('translated tags keep stable filters and note counts in both languages', () => {
  assert.equal(tagLabel('Bedeutungswandel', 'en'), 'Semantic change');
  assert.equal(tagLabel('Bedeutungswandel', 'de'), 'Bedeutungswandel');
  for (const kind of ['tag', 'word'] as const) {
    assert.deepEqual(getTopics(kind, 'en'), getTopics(kind, 'de'));
    for (const { value, count } of getTopics(kind, 'en')) {
      const notes = getEntries({ kind, value }, 'en');
      assert.equal(notes.length, count);
      assert.deepEqual(
        notes.map((note) => note.id),
        getEntries({ kind, value }, 'de').map((note) => note.id),
      );
    }
  }
});

test('all English notes translate the prose and preserve the word histories', () => {
  const englishNotes = getLocalizedEntries('en');
  assert.equal(englishNotes.length, entries.length);
  for (const original of entries) {
    const translated = englishNotes.find((note) => note.id === original.id)!;
    assert.ok(translated);
    assert.equal(translated.title, original.title);
    assert.equal(translated.date, original.date);
    assert.deepEqual(translated.words, original.words);
    assert.deepEqual(
      translated.sources?.map((source) => source.url),
      original.sources?.map((source) => source.url),
    );
    assert.notEqual(translated.text, original.text);
    assert.notEqual(translated.reflection, original.reflection);
    if (!original.timeline) continue;
    const originalGraph = buildMeaningGraph(original.timeline);
    const translatedGraph = buildMeaningGraph(translated.timeline!);
    assert.equal(translatedGraph.columns, originalGraph.columns);
    assert.deepEqual(translatedGraph.edges, originalGraph.edges);
    assert.equal(translatedGraph.nodes.length, originalGraph.nodes.length);
    originalGraph.nodes.forEach((node, index) => {
      const step = translatedGraph.nodes[index].step;
      assert.equal(step.form, node.step.form);
      assert.equal(step.derivation, node.step.derivation);
      assert.deepEqual(step.spellings, node.step.spellings);
      assert.notEqual(step.meaning, node.step.meaning);
      assert.notEqual(step.description, node.step.description);
      assert.equal(Boolean(step.attestation), Boolean(node.step.attestation));
      assert.equal(
        Boolean(step.attestationDate),
        Boolean(node.step.attestationDate),
      );
    });
    if (original.timeline.earlierOrigin) {
      assert.notEqual(
        translated.timeline?.earlierOrigin?.description,
        original.timeline.earlierOrigin.description,
      );
    }
  }
});

test('arata and arawasu have separate notes, graphs, and word filters', () => {
  for (const language of ['de', 'en'] as const) {
    const arata = getEntries({ kind: 'word', value: '改めて' }, language);
    const arawasu = getEntries({ kind: 'word', value: '表す' }, language);
    assert.deepEqual(
      arata.map((note) => note.id),
      ['arata-atarashii-aratamete'],
    );
    assert.deepEqual(
      arawasu.map((note) => note.id),
      ['arawa-arawasu'],
    );
    assert.ok(!arata[0].words.includes('表す'));
    assert.ok(!arawasu[0].words.includes('改めて'));

    const arataGraph = buildMeaningGraph(arata[0].timeline!);
    assert.equal(arataGraph.columns, 2);
    assert.equal(arataGraph.nodes[0].step.form, 'あらた');
    assert.deepEqual(arataGraph.edges, [
      { from: 'root-0', to: 'branch-0-0' },
      { from: 'branch-0-0', to: 'branch-0-1' },
      { from: 'root-0', to: 'branch-1-0' },
      { from: 'branch-1-0', to: 'branch-1-1' },
    ]);

    const arawasuGraph = buildMeaningGraph(arawasu[0].timeline!);
    assert.equal(arawasuGraph.columns, 2);
    assert.equal(arawasuGraph.nodes[0].step.form, 'あらわ');
    assert.deepEqual(arawasuGraph.edges, [
      { from: 'root-0', to: 'branch-0-0' },
      { from: 'root-0', to: 'branch-1-0', relation: 'shared-origin' },
    ]);
    assert.ok(arawasu[0].timeline?.earlierOrigin);
  }
});

test('a linear word history remains a single connected path', () => {
  const entry = entries.find((note) => note.id === 'ato')!;
  const graph = buildMeaningGraph(entry.timeline!);
  assert.equal(graph.columns, 1);
  assert.equal(graph.edges.length, graph.nodes.length - 1);
  graph.edges.forEach((edge, index) => {
    assert.equal(edge.from, graph.nodes[index].id);
    assert.equal(edge.to, graph.nodes[index + 1].id);
  });
});

test('shared origin is distinct from derivation within the adjective branch', () => {
  const entry = entries.find((note) => note.id === 'shiru-shirusu-shirushi')!;
  const graph = buildMeaningGraph(entry.timeline!);
  assert.deepEqual(graph.edges, [
    { from: 'root-0', to: 'branch-0-0' },
    { from: 'branch-0-0', to: 'branch-0-1' },
    { from: 'root-0', to: 'branch-1-0', relation: 'shared-origin' },
    { from: 'branch-1-0', to: 'branch-1-1' },
  ]);
  assert.equal(
    graph.nodes.find((node) => node.id === 'branch-1-1')?.step.form,
    'いちじるしい',
  );
});

test('furigana uses whole-word readings and leaves okurigana outside ruby', () => {
  assert.deepEqual(addFurigana('新しい'), [
    { text: '新', reading: 'あたら' },
    { text: 'しい' },
  ]);
  assert.deepEqual(addFurigana('新たし'), [
    { text: '新', reading: 'あら' },
    { text: 'たし' },
  ]);
  assert.deepEqual(addFurigana('改む'), [
    { text: '改', reading: 'あらた' },
    { text: 'む' },
  ]);
  assert.deepEqual(addFurigana('著しい'), [
    { text: '著', reading: 'いちじる' },
    { text: 'しい' },
  ]);
  assert.deepEqual(
    addFurigana('著し / 印')
      .filter((part) => part.reading)
      .map((part) => part.reading),
    ['しる', 'しるし'],
  );
  assert.deepEqual(addFurigana('印刷'), [{ text: '印刷' }]);
  assert.deepEqual(addFurigana('あらたし / German text'), [
    { text: 'あらたし / German text' },
  ]);
});

test('all kanji in headings and graph nodes have readings without changing the text', () => {
  function collectSteps(path: TimelinePath): TimelinePath['steps'] {
    return [...path.steps, ...(path.branches?.flatMap(collectSteps) ?? [])];
  }
  for (const entry of [...entries, ...getLocalizedEntries('en')]) {
    const steps = entry.timeline ? collectSteps(entry.timeline) : [];
    const texts = [
      entry.title,
      ...entry.words,
      entry.timeline?.earlierOrigin?.description ?? '',
      ...steps.flatMap((step) => [
        step.form,
        step.derivation ?? '',
        ...(step.spellings ?? []),
        step.meaning,
        step.description,
        step.attestation ?? '',
      ]),
    ];
    for (const text of texts) {
      const parts = addFurigana(text);
      assert.equal(parts.map((part) => part.text).join(''), text);
      for (const part of parts) {
        if (!part.reading) assert.doesNotMatch(part.text, /\p{Script=Han}/u);
      }
    }
  }
});
