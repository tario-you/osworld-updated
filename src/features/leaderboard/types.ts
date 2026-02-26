export type LeaderboardScope = 'all' | 'foundation';

export type VerifiedSortBy = 'score' | 'date' | 'model';

export type SelfReportedTab =
  | 'Verified'
  | 'Screenshot'
  | 'A11y tree'
  | 'Screenshot + A11y tree'
  | 'Set-of-Mark';

export interface SourceLink {
  label: string;
  url: string;
}

export type DataRow = Record<string, unknown>;

export interface VerifiedRawRow extends DataRow {
  Model?: string;
  Institution?: string;
  Date?: unknown;
  PaperLink?: string;
  PaperAuthors?: string;
  PaperLinks?: SourceLink[];
  'Approach type'?: string;
  'Max steps'?: number | string;
  'Success rate'?: number | string;
}

export interface AggregatedRun {
  categoryValues: Record<string, string>;
}

export interface AggregatedVerifiedRow {
  id: string;
  model: string;
  institution: string;
  approachType: string;
  maxSteps: string;
  date: Date | null;
  dateLabel: string;
  sources: SourceLink[];
  successRateAvg: number;
  successRateStd: number;
  runCount: number;
  hasAdditionalA11yTree: boolean;
  hasAdditionalTool: boolean;
  hasMultipleRollout: boolean;
  hasRetryStrategy: boolean;
  isFoundationE2E: boolean;
  categoryColumns: string[];
  runs: AggregatedRun[];
}

export type SelfReportedRowsByTab = Partial<Record<SelfReportedTab, DataRow[]>>;
