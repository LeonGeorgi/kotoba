# Kotoba

A small personal notebook about Japanese. Built with React, TypeScript, and Vite; all content lives in the app, with no backend.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run format:check
npm run lint
npm test
npm run build
```

`build` checks TypeScript and creates the production site in `dist`. Use `npm run preview` to preview that build.

## Publish

The site is hosted at [leongeorgi.github.io/kotoba](https://leongeorgi.github.io/kotoba/). The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually from GitHub Actions. It installs dependencies with `npm ci`, checks formatting, runs lint and tests, builds the site, and deploys `dist` to GitHub Pages.

The workflow uses Node.js 24 and builds with `--base /kotoba/` so assets load correctly under the repository's Pages URL. Local development and ordinary builds keep Vite's default base. To preview the Pages build locally:

```sh
npm run build -- --base /kotoba/
npm run preview
```

Open the `/kotoba/` path on the preview server. The repository's Pages publishing source is **GitHub Actions**; no extra deployment branch or secrets are needed.

## Add a note

Add an entry to `src/entries.ts` with a unique, stable `id`, a date in `YYYY-MM-DD` format, a Japanese title, reading, and 1–3 short sentences in `text`. Tags and referenced words can be empty arrays. A short reflection appears on the detail page; `sources` is an optional list of references.

Write `text`, `reflection`, graph meanings, and graph descriptions as `{ de: '…', en: '…' }`. Other reader-facing fields, such as attestation dates and source labels, also accept this form when they need translation; Japanese titles, word forms, and source names stay shared. The graph structure and source URLs are defined once. Add English labels for new tags in `src/i18n.ts`; the German tag values remain stable identifiers in links and filters.

German uses the existing hash links (`#/`, `#/entry/hime`); English adds an `/en` prefix (`#/en/`, `#/en/entry/hime`). The header language link keeps the current note or filter, and all internal navigation preserves the selected language. Direct links and reloads select the language from the URL. UI text, document language, page titles, descriptions, and dates follow that language. No translation library or backend is needed.

Dates determine the newest-first order. Tags, word indexes, counts, and nearby notes are derived from the entries. The notes describe dictionary-supported etymologies, with references on their detail pages.

Japanese headings and graph nodes are rendered with native HTML ruby for furigana. Body text, source links, and word navigation stay unannotated. Add each new word or source title used in headings or nodes and its full kana reading to `src/furigana.ts`; readings are specific to the words used in the notes. Longer matches take precedence, and trailing okurigana stay outside the ruby. The entry data and word URLs remain plain text. Tests check that every kanji in the current headings and graph nodes has a reading.

An optional `timeline` describes meaning changes or word formation. `MeaningGraph` renders it as dots with labels to their right and orthogonal SVG connections from top to bottom on both the homepage and detail page. Entry lists use the `compact` variant: forms and meanings sit side by side and wrap when needed. Only the detail page has expandable nodes with explanations and text references. Each step has a Japanese `form` written in kana, translated `meaning` and `description` fields, and an optional `attestation`. Keep `form` to the word itself; an optional `derivation` holds its components or earlier forms and appears in smaller text directly below it, on both lists and detail pages. Optional `spellings` list the corresponding kanji writings in smaller text below the label. Nodes follow word forms and meaning changes; a different kanji alone does not create a new node. An optional `attestationDate` supplies the short year or period label shown to the left of the dot; leave it out when no dated evidence is available. Attestation dates are not dates of origin. Optional `branches`, each with its own `steps` and optional nested `branches`, form parallel paths from the final shared step. Nested family nodes span their descendant columns. Graphs stay within the text column, reserving date gutters only in columns with dated nodes; horizontal scrolling and its hint appear when the available space is too narrow. Optional `earlierOrigin` supplies a collapsed explanation above the graph. No graph library is needed; a CSS grid places nodes and a resize observer keeps the connections attached as nodes expand or text wraps.

Native hash links provide detail pages, browsing, and browser back/forward without adding a router. The built site can be served by any static host without route rewrites. Set Vite's `base` in `vite.config.ts` if deploying under a subdirectory.

Set a branch's `connection` to `shared-origin` when the dictionary establishes a common origin rather than direct derivation. Only its first connection is dashed and labeled “verwandt”; subsequent steps keep their normal derivation lines.

Use `possible-origin` for a hypothesized relationship: its first connection is dashed and explicitly labeled “möglicherweise verwandt”. This differs from the dictionary-established relationship marked by `shared-origin`.
