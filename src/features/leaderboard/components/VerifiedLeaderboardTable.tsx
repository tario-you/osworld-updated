import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { AggregatedVerifiedRow, LeaderboardScope } from '../types';

interface VerifiedLeaderboardTableProps {
  rows: AggregatedVerifiedRow[];
  scope: LeaderboardScope;
}

export function VerifiedLeaderboardTable({
  rows,
  scope,
}: VerifiedLeaderboardTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedRowId(null);
  }, [rows]);

  const columns = useMemo<ColumnDef<AggregatedVerifiedRow>[]>(
    () => [
      {
        id: 'rank',
        header: 'Rank',
        cell: (info) => {
          const rank = info.row.index + 1;
          return (
            <span className={rank === 1 ? 'rank rank--first' : 'rank'}>
              {rank}
            </span>
          );
        },
      },
      {
        id: 'model',
        header: 'Model & Date',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="model-cell">
              <div className="model-title-row">
                <strong>{row.model}</strong>
                <span className="model-tags">
                  {row.hasAdditionalA11yTree && (
                    <span title="Uses additional a11y tree">🌳</span>
                  )}
                  {scope === 'all' && row.hasAdditionalTool && (
                    <span title="Uses additional coding-based action">💻</span>
                  )}
                  {scope === 'all' && row.hasMultipleRollout && (
                    <span title="Multiple rollout">🔁</span>
                  )}
                  {scope === 'all' && row.hasRetryStrategy && (
                    <span title="Retry / self-verification">↺</span>
                  )}
                </span>
              </div>
              {row.institution && (
                <p className="subtle-text">{row.institution}</p>
              )}
              {row.dateLabel && <p className="subtle-date">{row.dateLabel}</p>}
              {row.sources.length > 0 && (
                <p className="source-links">
                  {row.sources.map((source, index) => (
                    <span key={`${source.url}-${source.label}`}>
                      {index > 0 ? <span className="source-dot">•</span> : null}
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.label}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: 'details',
        header: 'Approach & Details',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="details-cell">
              <div>
                <strong>Type:</strong> {row.approachType || 'N/A'}
              </div>
              <div>
                <strong>Max Steps:</strong> {row.maxSteps || 'N/A'}
              </div>
              <div>
                <strong>Runs:</strong> {row.runCount}
              </div>
            </div>
          );
        },
      },
      {
        id: 'score',
        header: 'Success Rate',
        cell: (info) => {
          const row = info.row.original;
          const display =
            row.successRateStd > 0
              ? `${row.successRateAvg.toFixed(2)}±${row.successRateStd.toFixed(2)}%`
              : `${row.successRateAvg.toFixed(2)}%`;
          const isExpanded = expandedRowId === row.id;

          return (
            <div className="score-cell">
              <strong className="score-value">{display}</strong>
              {row.categoryColumns.length > 0 && (
                <button
                  type="button"
                  className="expand-button"
                  onClick={() => {
                    setExpandedRowId((current) =>
                      current === row.id ? null : row.id,
                    );
                  }}
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [expandedRowId, scope],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-wrap">
      <table className="leaderboard-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const original = row.original;
            const isExpanded = expandedRowId === original.id;

            return (
              <Fragment key={row.id}>
                <tr className={row.index === 0 ? 'top-row' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {isExpanded && original.categoryColumns.length > 0 && (
                  <tr>
                    <td colSpan={4} className="expanded-cell">
                      <div className="domain-breakdown-wrap">
                        <table className="domain-breakdown-table">
                          <thead>
                            <tr>
                              {original.runCount > 1 && <th>Run</th>}
                              {original.categoryColumns.map((column) => (
                                <th key={`${original.id}-${column}`}>{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {original.runs.map((run, runIndex) => (
                              <tr key={`${original.id}-run-${runIndex}`}>
                                {original.runCount > 1 && (
                                  <td>Run {runIndex + 1}</td>
                                )}
                                {original.categoryColumns.map((column) => (
                                  <td key={`${original.id}-${runIndex}-${column}`}>
                                    {run.categoryValues[column]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
