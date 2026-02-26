import type { DataRow, SourceLink } from './types';

export function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return String(value).trim();
}

export function toNumberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function isYesLike(value: unknown): boolean {
  const normalized = toStringValue(value).toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === '1' || normalized === 'y';
}

export function parseDateValue(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelDate = new Date((value - 25569) * 86400 * 1000);
    if (Number.isFinite(excelDate.getTime())) {
      return excelDate;
    }
  }

  const text = toStringValue(value);
  if (text.length === 0 || text === 'NaT') {
    return null;
  }

  const directDate = new Date(text);
  if (Number.isFinite(directDate.getTime())) {
    return directDate;
  }

  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?)/);
  if (!isoMatch) {
    return null;
  }

  const isoDate = new Date(isoMatch[1]);
  return Number.isFinite(isoDate.getTime()) ? isoDate : null;
}

export function formatDateLabel(date: Date | null, rawValue: unknown): string {
  if (date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return toStringValue(rawValue);
}

export function toSourceLinks(row: DataRow): SourceLink[] {
  const paperLinks = row.PaperLinks;
  if (Array.isArray(paperLinks)) {
    const links = paperLinks
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const candidate = entry as { label?: unknown; url?: unknown };
        const label = toStringValue(candidate.label);
        const url = toStringValue(candidate.url);

        if (!label || !url) {
          return null;
        }

        return { label, url };
      })
      .filter((entry): entry is SourceLink => entry !== null);

    if (links.length > 0) {
      return links;
    }
  }

  const paperUrl = toStringValue(row.PaperLink);
  if (!paperUrl) {
    return [];
  }

  const paperLabel = toStringValue(row.PaperAuthors) || 'Paper Link';
  return [{ label: paperLabel, url: paperUrl }];
}

export function toId(...parts: string[]): string {
  return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '-');
}
