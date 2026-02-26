import {
  formatDateLabel,
  isYesLike,
  parseDateValue,
  toId,
  toNumberValue,
  toSourceLinks,
  toStringValue,
} from './parsing';
import type {
  AggregatedRun,
  AggregatedVerifiedRow,
  DataRow,
  LeaderboardScope,
  VerifiedRawRow,
  VerifiedSortBy,
} from './types';

const APPROACH_ORDER = ['General model', 'Specialized model', 'Agentic framework'];

const METADATA_COLUMNS = new Set([
  'Model',
  'Approach type',
  'Max steps',
  'Institution',
  'Date',
  'PaperLink',
  'PaperAuthors',
  'PaperLinks',
  'Success rate',
]);

interface GroupBucket {
  model: string;
  institution: string;
  approachType: string;
  maxSteps: string;
  date: Date | null;
  dateRaw: unknown;
  sources: ReturnType<typeof toSourceLinks>;
  successRates: number[];
  hasAdditionalA11yTree: boolean;
  hasAdditionalTool: boolean;
  hasMultipleRollout: boolean;
  hasRetryStrategy: boolean;
  runs: AggregatedRun[];
}

function findColumn(columns: string[], names: string[]): string | null {
  const byLower = new Map(columns.map((column) => [column.trim().toLowerCase(), column]));
  for (const name of names) {
    const matched = byLower.get(name);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function collectCategoryColumns(rows: VerifiedRawRow[]): {
  categoryColumns: string[];
  additionalA11yColumn: string | null;
  additionalToolColumn: string | null;
  multipleRolloutColumn: string | null;
  retryColumn: string | null;
} {
  const columns = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columns.add(key);
    }
  }

  const allColumns = [...columns];

  const additionalA11yColumn = findColumn(allColumns, ['additional a11y tree used']);
  const additionalToolColumn = findColumn(allColumns, [
    'additional coding-based action',
    'additional tool used',
  ]);
  const multipleRolloutColumn = findColumn(allColumns, ['multiple rollout']);
  const retryColumn = findColumn(allColumns, [
    'retry / self-verification',
    'retry/self-verification',
    'retry',
    'self-verification',
  ]);

  const excludedColumns = new Set([...METADATA_COLUMNS]);
  if (additionalA11yColumn) {
    excludedColumns.add(additionalA11yColumn);
  }
  if (additionalToolColumn) {
    excludedColumns.add(additionalToolColumn);
  }
  if (multipleRolloutColumn) {
    excludedColumns.add(multipleRolloutColumn);
  }
  if (retryColumn) {
    excludedColumns.add(retryColumn);
  }

  const categoryColumns = allColumns.filter((column) => !excludedColumns.has(column));

  return {
    categoryColumns,
    additionalA11yColumn,
    additionalToolColumn,
    multipleRolloutColumn,
    retryColumn,
  };
}

function toAverage(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function toStandardDeviation(numbers: number[], average: number): number {
  if (numbers.length <= 1) {
    return 0;
  }

  const variance =
    numbers.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / numbers.length;
  return Math.sqrt(variance);
}

export function aggregateVerifiedRows(rows: VerifiedRawRow[]): AggregatedVerifiedRow[] {
  const validRows = rows.filter((row) => toNumberValue(row['Success rate']) !== null);
  const {
    categoryColumns,
    additionalA11yColumn,
    additionalToolColumn,
    multipleRolloutColumn,
    retryColumn,
  } = collectCategoryColumns(validRows);

  const groups = new Map<string, GroupBucket>();

  for (const row of validRows) {
    const model = toStringValue(row.Model);
    const maxSteps = toStringValue(row['Max steps']);
    const groupKey = `${model}|${maxSteps}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        model,
        institution: toStringValue(row.Institution),
        approachType: toStringValue(row['Approach type']),
        maxSteps,
        date: parseDateValue(row.Date),
        dateRaw: row.Date,
        sources: toSourceLinks(row),
        successRates: [],
        hasAdditionalA11yTree: false,
        hasAdditionalTool: false,
        hasMultipleRollout: false,
        hasRetryStrategy: false,
        runs: [],
      });
    }

    const bucket = groups.get(groupKey)!;

    const parsedDate = parseDateValue(row.Date);
    if (parsedDate && (!bucket.date || parsedDate > bucket.date)) {
      bucket.date = parsedDate;
      bucket.dateRaw = row.Date;
      bucket.sources = toSourceLinks(row);
    }

    if (!bucket.institution) {
      bucket.institution = toStringValue(row.Institution);
    }

    if (!bucket.approachType) {
      bucket.approachType = toStringValue(row['Approach type']);
    }

    const score = toNumberValue(row['Success rate']);
    if (score !== null) {
      bucket.successRates.push(score);
    }

    if (additionalA11yColumn && isYesLike(row[additionalA11yColumn])) {
      bucket.hasAdditionalA11yTree = true;
    }

    if (additionalToolColumn && isYesLike(row[additionalToolColumn])) {
      bucket.hasAdditionalTool = true;
    }

    if (multipleRolloutColumn && isYesLike(row[multipleRolloutColumn])) {
      bucket.hasMultipleRollout = true;
    }

    if (retryColumn && isYesLike(row[retryColumn])) {
      bucket.hasRetryStrategy = true;
    }

    const categoryValues: Record<string, string> = {};
    for (const column of categoryColumns) {
      categoryValues[column] = toStringValue(row[column]);
    }
    bucket.runs.push({ categoryValues });
  }

  return [...groups.values()].map((bucket) => {
    const successRateAvg = toAverage(bucket.successRates);
    const successRateStd = toStandardDeviation(bucket.successRates, successRateAvg);

    const isFoundationE2E =
      (bucket.approachType === 'General model' || bucket.approachType === 'Specialized model') &&
      !bucket.hasAdditionalA11yTree &&
      !bucket.hasAdditionalTool;

    return {
      id: toId(bucket.model, bucket.maxSteps),
      model: bucket.model,
      institution: bucket.institution,
      approachType: bucket.approachType,
      maxSteps: bucket.maxSteps,
      date: bucket.date,
      dateLabel: formatDateLabel(bucket.date, bucket.dateRaw),
      sources: bucket.sources,
      successRateAvg,
      successRateStd,
      runCount: bucket.successRates.length,
      hasAdditionalA11yTree: bucket.hasAdditionalA11yTree,
      hasAdditionalTool: bucket.hasAdditionalTool,
      hasMultipleRollout: bucket.hasMultipleRollout,
      hasRetryStrategy: bucket.hasRetryStrategy,
      isFoundationE2E,
      categoryColumns,
      runs: bucket.runs,
    };
  });
}

export function getScopedRows(
  rows: AggregatedVerifiedRow[],
  scope: LeaderboardScope,
): AggregatedVerifiedRow[] {
  if (scope === 'foundation') {
    return rows.filter((row) => row.isFoundationE2E);
  }

  return rows;
}

export function getApproachTypes(rows: AggregatedVerifiedRow[]): string[] {
  const unique = new Set(rows.map((row) => row.approachType).filter(Boolean));
  return [...unique].sort((a, b) => {
    const indexA = APPROACH_ORDER.indexOf(a);
    const indexB = APPROACH_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  });
}

export function getMaxSteps(rows: AggregatedVerifiedRow[]): string[] {
  return [...new Set(rows.map((row) => row.maxSteps).filter(Boolean))].sort(
    (a, b) => Number(a) - Number(b),
  );
}

export function applyVerifiedFilters(params: {
  rows: AggregatedVerifiedRow[];
  selectedApproaches: string[];
  maxSteps: string;
  includeA11y: boolean;
  includeTool: boolean;
  includeMultiRollout: boolean;
  includeRetry: boolean;
  scope: LeaderboardScope;
}): AggregatedVerifiedRow[] {
  const {
    rows,
    selectedApproaches,
    maxSteps,
    includeA11y,
    includeTool,
    includeMultiRollout,
    includeRetry,
    scope,
  } = params;

  let filtered = rows;

  if (selectedApproaches.length === 0) {
    return [];
  }

  filtered = filtered.filter((row) => selectedApproaches.includes(row.approachType));

  if (maxSteps) {
    filtered = filtered.filter((row) => row.maxSteps === maxSteps);
  }

  if (scope === 'all') {
    if (!includeA11y) {
      filtered = filtered.filter((row) => !row.hasAdditionalA11yTree);
    }

    if (!includeTool) {
      filtered = filtered.filter((row) => !row.hasAdditionalTool);
    }

    if (!includeMultiRollout) {
      filtered = filtered.filter((row) => !row.hasMultipleRollout);
    }

    if (!includeRetry) {
      filtered = filtered.filter((row) => !row.hasRetryStrategy);
    }
  }

  return filtered;
}

export function sortVerifiedRows(
  rows: AggregatedVerifiedRow[],
  sortBy: VerifiedSortBy,
): AggregatedVerifiedRow[] {
  const sorted = [...rows];

  if (sortBy === 'score') {
    sorted.sort((a, b) => b.successRateAvg - a.successRateAvg);
    return sorted;
  }

  if (sortBy === 'date') {
    sorted.sort((a, b) => {
      const timeA = a.date ? a.date.getTime() : 0;
      const timeB = b.date ? b.date.getTime() : 0;
      return timeB - timeA;
    });
    return sorted;
  }

  sorted.sort((a, b) => a.model.localeCompare(b.model));
  return sorted;
}

export function selfReportedScore(row: DataRow): string {
  const score = toNumberValue(row.Score ?? row['Success rate']);
  if (score === null) {
    return toStringValue(row.Score ?? row['Success rate']);
  }

  return `${score}`;
}
