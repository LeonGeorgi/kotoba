import { useEffect, useMemo, useRef, useState } from 'react';
import { buildMeaningGraph, type Timeline } from './graphLayout';
import { Furigana } from './JapaneseText';
import { copy, type Language } from './i18n';

export function MeaningGraph({
  timeline,
  compact = false,
  language,
}: {
  timeline: Timeline;
  compact?: boolean;
  language: Language;
}) {
  const labels = copy[language];
  const graph = useMemo(() => buildMeaningGraph(timeline), [timeline]);
  const datedColumns = new Set(
    graph.nodes
      .filter((node) => node.step.attestationDate)
      .map((node) => node.column ?? 0),
  );
  const NodeContainer = compact ? 'div' : 'details';
  const NodeLabel = compact ? 'div' : 'summary';
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [drawing, setDrawing] = useState<{
    width: number;
    height: number;
    paths: string[];
  }>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scrollContainer = canvas.parentElement!;

    // Keep connections attached to the dots as text wraps or details open.
    const elements = new Map(
      [...canvas.querySelectorAll<HTMLElement>('[data-graph-node]')].map(
        (element) => [element.dataset.graphNode, element],
      ),
    );
    const observer = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      const scrollStyle = getComputedStyle(scrollContainer);
      const availableWidth =
        scrollContainer.clientWidth -
        parseFloat(scrollStyle.paddingLeft) -
        parseFloat(scrollStyle.paddingRight);
      setIsOverflowing(bounds.width > availableWidth + 1);
      const paths = graph.edges.map((edge) => {
        const source = elements.get(edge.from)!;
        const target = elements.get(edge.to)!;
        const sourceDot = source
          .querySelector('.graph-dot')!
          .getBoundingClientRect();
        const targetDot = target
          .querySelector('.graph-dot')!
          .getBoundingClientRect();
        const startX = sourceDot.left + sourceDot.width / 2 - bounds.left;
        const startY = sourceDot.top + sourceDot.height / 2 - bounds.top;
        const endX = targetDot.left + targetDot.width / 2 - bounds.left;
        const endY = targetDot.top + targetDot.height / 2 - bounds.top;
        const middleY =
          (source.getBoundingClientRect().bottom - bounds.top + endY) / 2;
        return `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`;
      });
      setDrawing({ width: bounds.width, height: bounds.height, paths });
    });
    observer.observe(canvas);
    observer.observe(scrollContainer);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [graph]);

  return (
    <figure className={`meaning-graph${compact ? ' graph-compact' : ''}`}>
      {timeline.earlierOrigin && (
        <details className="graph-origin">
          <summary>{timeline.earlierOrigin.form}</summary>
          <p>
            <Furigana text={timeline.earlierOrigin.description} />
          </p>
        </details>
      )}
      {isOverflowing && (
        <p className="graph-scroll-hint">{labels.graphScroll}</p>
      )}
      <div
        className="graph-scroll"
        role="region"
        aria-label={labels.graphLabel}
        tabIndex={0}
      >
        <div
          className="graph-canvas"
          ref={canvasRef}
          style={{
            gridTemplateColumns:
              graph.columns === 1
                ? 'minmax(0, 1fr)'
                : Array.from(
                    { length: graph.columns },
                    (_, column) =>
                      `minmax(${datedColumns.has(column) ? 240 : 160}px, 1fr)`,
                  ).join(' '),
            minWidth:
              graph.columns > 1
                ? graph.columns * 160 +
                  datedColumns.size * 80 +
                  (graph.columns - 1) * 20
                : undefined,
          }}
        >
          {drawing && (
            <svg
              className="graph-edges"
              width={drawing.width}
              height={drawing.height}
              aria-hidden="true"
              focusable="false"
            >
              {drawing.paths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  strokeDasharray={
                    graph.edges[index].relation ? '4 4' : undefined
                  }
                />
              ))}
            </svg>
          )}
          {graph.nodes.map((node) => {
            const parent = graph.edges.find((edge) => edge.to === node.id);
            const parentNode = graph.nodes.find(
              (item) => item.id === parent?.from,
            );
            return (
              <NodeContainer
                key={node.id}
                className={`graph-node${datedColumns.has(node.column ?? 0) ? ' graph-dated' : ''}`}
                data-graph-node={node.id}
                style={{
                  gridRow: node.row + 1,
                  gridColumn:
                    node.column === null
                      ? '1 / -1'
                      : `${node.column + 1} / span ${node.columnSpan}`,
                }}
              >
                <NodeLabel className="graph-label">
                  {node.step.attestationDate && (
                    <span className="graph-date">
                      <span className="sr-only">{labels.attested}</span>
                      {node.step.attestationDate}
                    </span>
                  )}
                  <span className="graph-dot" aria-hidden="true" />
                  <span className="graph-word" lang="ja">
                    <span className="graph-form">
                      <Furigana text={node.step.form} />
                    </span>
                    {node.step.derivation && (
                      <span className="graph-derivation">
                        <span className="sr-only">{labels.derivation}</span>
                        <Furigana text={node.step.derivation} />
                      </span>
                    )}
                  </span>
                  <span className="graph-meaning">
                    <Furigana text={node.step.meaning} />
                    {parent?.relation === 'shared-origin' &&
                      ` · ${labels.sharedOrigin}`}
                    {parent?.relation === 'possible-origin' &&
                      ` · ${labels.possibleOrigin}`}
                  </span>
                  {node.step.spellings && node.step.spellings.length > 0 && (
                    <span className="graph-spellings" lang="ja">
                      <span className="sr-only">{labels.spellings}</span>
                      {node.step.spellings.map((spelling, index) => (
                        <span key={spelling}>
                          {index > 0 && ' / '}
                          <span className="graph-spelling">
                            <Furigana text={spelling} />
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                  {parentNode && (
                    <span className="sr-only">
                      {parent?.relation === 'possible-origin'
                        ? labels.possibleHistory
                        : parent?.relation === 'shared-origin'
                          ? labels.sharedHistory
                          : labels.derivedFrom}
                      {parentNode.step.form}.
                    </span>
                  )}
                </NodeLabel>
                {!compact && (
                  <>
                    <p className="graph-description">
                      <Furigana text={node.step.description} />
                    </p>
                    {node.step.attestation && (
                      <p className="graph-attestation">
                        <Furigana text={node.step.attestation} />
                      </p>
                    )}
                  </>
                )}
              </NodeContainer>
            );
          })}
        </div>
      </div>
      {graph.edges.some((edge) => edge.relation === 'possible-origin') && (
        <figcaption className="graph-legend">{labels.graphLegend}</figcaption>
      )}
    </figure>
  );
}
