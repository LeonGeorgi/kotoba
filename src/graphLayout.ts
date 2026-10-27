import type { Entry, TimelinePath } from './entries';

export type Timeline = NonNullable<Entry['timeline']>;

export interface GraphNode {
  id: string;
  step: Timeline['steps'][number];
  row: number;
  column: number | null;
  columnSpan: number;
}

export function buildMeaningGraph(timeline: Timeline) {
  const nodes: GraphNode[] = [];
  const edges: {
    from: string;
    to: string;
    relation?: 'shared-origin' | 'possible-origin';
  }[] = [];
  const branchesOf = (path: TimelinePath) =>
    path.branches?.filter((branch) => branch.steps.length) ?? [];
  const countColumns = (path: TimelinePath): number =>
    Math.max(
      1,
      branchesOf(path).reduce(
        (count, branch) => count + countColumns(branch),
        0,
      ),
    );

  function addPath(
    path: TimelinePath,
    prefix: string,
    row: number,
    column: number,
    parentId?: string,
    connection?: 'shared-origin' | 'possible-origin',
  ) {
    const columnSpan = countColumns(path);
    let previousId = parentId;
    path.steps.forEach((step, index) => {
      const id = `${prefix}-${index}`;
      nodes.push({
        id,
        step,
        row: row + index,
        column: prefix === 'root' ? null : column,
        columnSpan,
      });
      if (previousId) {
        const edge = { from: previousId, to: id };
        edges.push(
          index === 0 && connection ? { ...edge, relation: connection } : edge,
        );
      }
      previousId = id;
    });
    let nextColumn = column;
    branchesOf(path).forEach((branch, index) => {
      const branchPrefix =
        prefix === 'root' ? `branch-${index}` : `${prefix}-branch-${index}`;
      addPath(
        branch,
        branchPrefix,
        row + path.steps.length,
        nextColumn,
        previousId,
        branch.connection,
      );
      nextColumn += countColumns(branch);
    });
  }

  addPath(timeline, 'root', 0, 0);

  return { nodes, edges, columns: countColumns(timeline) };
}
