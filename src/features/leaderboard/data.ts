import { read, utils } from 'xlsx';
import {
  INJECTED_VERIFIED_ENTRIES,
  SELF_REPORTED_RESULTS_URL,
  SHEET_NAME_BY_TAB,
  VERIFIED_RESULTS_URL,
} from './constants';
import type {
  DataRow,
  SelfReportedRowsByTab,
  SelfReportedTab,
  VerifiedRawRow,
} from './types';

function parseWorkbookRows(buffer: ArrayBuffer, sheetName: string): DataRow[] {
  const workbook = read(new Uint8Array(buffer), { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }

  return utils.sheet_to_json(sheet) as DataRow[];
}

function parseFirstSheetRows(buffer: ArrayBuffer): DataRow[] {
  const workbook = read(new Uint8Array(buffer), { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheet];
  if (!sheet) {
    return [];
  }

  return utils.sheet_to_json(sheet) as DataRow[];
}

async function fetchWorkbookBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch workbook (${response.status})`);
  }

  return response.arrayBuffer();
}

function mergeInjectedEntries(rows: VerifiedRawRow[]): VerifiedRawRow[] {
  const dedupe = new Set(
    rows.map(
      (row) =>
        `${String(row.Model ?? '')}|${String(row['Max steps'] ?? '')}|${String(row.Date ?? '')}`,
    ),
  );

  const merged = [...rows];
  for (const entry of INJECTED_VERIFIED_ENTRIES) {
    const key = `${String(entry.Model ?? '')}|${String(entry['Max steps'] ?? '')}|${String(entry.Date ?? '')}`;
    if (!dedupe.has(key)) {
      merged.push(entry);
    }
  }

  return merged;
}

export async function fetchVerifiedRows(): Promise<VerifiedRawRow[]> {
  const buffer = await fetchWorkbookBuffer(VERIFIED_RESULTS_URL);
  const rows = parseFirstSheetRows(buffer) as VerifiedRawRow[];
  return mergeInjectedEntries(rows);
}

export async function fetchSelfReportedRowsByTab(): Promise<SelfReportedRowsByTab> {
  const buffer = await fetchWorkbookBuffer(SELF_REPORTED_RESULTS_URL);

  const rowsByTab: SelfReportedRowsByTab = {};
  for (const [tab, sheetName] of Object.entries(SHEET_NAME_BY_TAB) as [
    Exclude<SelfReportedTab, 'Verified'>,
    string,
  ][]) {
    rowsByTab[tab] = parseWorkbookRows(buffer, sheetName);
  }

  return rowsByTab;
}
