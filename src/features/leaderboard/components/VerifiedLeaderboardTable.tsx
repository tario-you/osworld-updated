import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  type Column,
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AggregatedVerifiedRow, LeaderboardScope } from '../types';

interface VerifiedLeaderboardTableProps {
  rows: AggregatedVerifiedRow[];
  scope: LeaderboardScope;
  showDetails: boolean;
}

function toScoreLabel(row: AggregatedVerifiedRow): string {
  if (row.successRateStd > 0) {
    return `${row.successRateAvg.toFixed(2)}±${row.successRateStd.toFixed(2)}%`;
  }

  return `${row.successRateAvg.toFixed(2)}%`;
}

function toNumericValue(value: string): number {
  const normalized = value.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function SortIndicator({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') {
    return <ArrowUp className="h-3.5 w-3.5" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="h-3.5 w-3.5" />;
  }
  return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<AggregatedVerifiedRow, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-left"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      <span>{label}</span>
      <SortIndicator direction={sorted} />
    </button>
  );
}

export function VerifiedLeaderboardTable({
  rows,
  scope,
  showDetails,
}: VerifiedLeaderboardTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'score', desc: true },
  ]);

  useEffect(() => {
    if (showDetails) {
      return;
    }

    setExpandedRowId(null);

    setSorting((current) => {
      const currentColumnId = current[0]?.id;
      if (
        currentColumnId === 'company' ||
        currentColumnId === 'date' ||
        currentColumnId === 'link' ||
        currentColumnId === 'modelType' ||
        currentColumnId === 'steps' ||
        currentColumnId === 'runs'
      ) {
        return [{ id: 'score', desc: true }];
      }
      return current;
    });
  }, [showDetails]);

  const activeExpandedRowId = useMemo(() => {
    if (!expandedRowId) {
      return null;
    }

    return rows.some((row) => row.id === expandedRowId) ? expandedRowId : null;
  }, [expandedRowId, rows]);

  const columns = useMemo<ColumnDef<AggregatedVerifiedRow>[]>(
    () => [
      {
        id: 'rank',
        header: '#',
        enableSorting: false,
        cell: (info) => {
          const rank = info.row.index + 1;
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {rank.toString().padStart(2, '0')}
            </span>
          );
        },
      },
      {
        id: 'model',
        accessorFn: (row) => row.model,
        header: ({ column }) => <SortableHeader column={column} label="Model" />,
        cell: (info) => {
          const row = info.row.original;
          const showToolTags = showDetails && scope === 'all';
          const modelLink = row.sources[0]?.url;
          const hasTags =
            (showDetails && row.hasAdditionalA11yTree) ||
            (showToolTags && row.hasAdditionalTool) ||
            (showToolTags && row.hasMultipleRollout) ||
            (showToolTags && row.hasRetryStrategy);

          return (
            <div className={showDetails ? 'max-w-[320px] space-y-1' : 'max-w-[260px] space-y-1'}>
              {!showDetails && modelLink ? (
                <a
                  href={modelLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-medium text-primary hover:underline"
                >
                  {row.model}
                </a>
              ) : (
                <p className="truncate font-medium">{row.model}</p>
              )}
              {hasTags && (
                <div className="flex flex-wrap items-center gap-1">
                  {row.hasAdditionalA11yTree && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      🌳
                    </Badge>
                  )}
                  {showToolTags && row.hasAdditionalTool && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      💻
                    </Badge>
                  )}
                  {showToolTags && row.hasMultipleRollout && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      🔁
                    </Badge>
                  )}
                  {showToolTags && row.hasRetryStrategy && (
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      ↺
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      ...(showDetails
        ? ([
            {
              id: 'company',
              accessorFn: (row) => row.institution,
              header: ({ column }) => <SortableHeader column={column} label="Company" />,
              cell: (info) => {
                const row = info.row.original;
                return (
                  <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
                    {row.institution || '-'}
                  </span>
                );
              },
            },
          ] satisfies ColumnDef<AggregatedVerifiedRow>[])
        : []),
      ...(showDetails
        ? ([
            {
              id: 'date',
              accessorFn: (row) => row.date?.getTime() ?? 0,
              header: ({ column }) => <SortableHeader column={column} label="Date" />,
              cell: (info) => {
                const row = info.row.original;
                return <span className="text-xs text-muted-foreground">{row.dateLabel || '-'}</span>;
              },
            },
            {
              id: 'link',
              accessorFn: (row) => row.sources[0]?.label ?? '',
              header: ({ column }) => <SortableHeader column={column} label="Link" />,
              cell: (info) => {
                const row = info.row.original;
                if (row.sources.length === 0) {
                  return <span className="text-xs text-muted-foreground">-</span>;
                }

                const [firstSource] = row.sources;
                const extraCount = row.sources.length - 1;
                return (
                  <div className="max-w-[180px] space-y-1">
                    <a
                      href={firstSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-xs text-primary hover:underline"
                      title={firstSource.label}
                    >
                      {firstSource.label}
                    </a>
                    {extraCount > 0 ? (
                      <span className="text-[10px] text-muted-foreground">+{extraCount} more</span>
                    ) : null}
                  </div>
                );
              },
            },
            {
              id: 'modelType',
              accessorFn: (row) => row.approachType,
              header: ({ column }) => <SortableHeader column={column} label="Model type" />,
              cell: (info) => {
                const row = info.row.original;
                return <span className="text-xs text-muted-foreground">{row.approachType || 'N/A'}</span>;
              },
            },
            {
              id: 'steps',
              accessorFn: (row) => toNumericValue(row.maxSteps),
              header: ({ column }) => <SortableHeader column={column} label="# steps" />,
              cell: (info) => {
                const row = info.row.original;
                return <span className="text-xs text-muted-foreground">{row.maxSteps || 'N/A'}</span>;
              },
            },
            {
              id: 'runs',
              accessorFn: (row) => row.runCount,
              header: ({ column }) => <SortableHeader column={column} label="# runs" />,
              cell: (info) => {
                const row = info.row.original;
                return <span className="text-xs text-muted-foreground">{row.runCount}</span>;
              },
            },
          ] satisfies ColumnDef<AggregatedVerifiedRow>[])
        : []),
      {
        id: 'score',
        accessorFn: (row) => row.successRateAvg,
        header: ({ column }) => <SortableHeader column={column} label="Score" />,
        cell: (info) => {
          const row = info.row.original;
          const isExpanded = activeExpandedRowId === row.id;

          return (
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold">{toScoreLabel(row)}</span>
              {showDetails && row.categoryColumns.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => {
                    setExpandedRowId((current) =>
                      current === row.id ? null : row.id,
                    );
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  <span className="text-xs">Breakdown</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [activeExpandedRowId, scope, showDetails],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <Table className={showDetails ? "min-w-[1580px]" : "w-auto table-fixed min-w-[620px]"}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`h-11 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground ${header.id === 'rank' ? 'w-[64px] min-w-[64px]' : ''} ${header.id === 'model' ? (showDetails ? 'w-[320px] min-w-[320px]' : 'w-[260px] min-w-[260px]') : ''} ${header.id === 'company' ? 'w-[220px] min-w-[220px]' : ''} ${header.id === 'score' ? 'w-[180px] min-w-[180px]' : ''} ${showDetails && header.id === 'date' ? 'w-[130px] min-w-[130px]' : ''} ${showDetails && header.id === 'link' ? 'w-[180px] min-w-[180px]' : ''}`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowPosition) => {
            const original = row.original;
            const isExpanded = activeExpandedRowId === original.id;
            const isHumanBaselineRow =
              original.model.trim().toLowerCase() === 'human baseline';

            return (
              <Fragment key={row.id}>
                <TableRow
                  className={
                    isHumanBaselineRow
                      ? 'bg-muted/70 hover:bg-muted/80'
                      : 'hover:bg-muted/40'
                  }
                  data-state={row.index === 0 ? 'selected' : undefined}
                >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`py-3 align-top ${cell.column.id === 'rank' ? 'w-[64px] min-w-[64px]' : ''} ${cell.column.id === 'model' ? (showDetails ? 'w-[320px] min-w-[320px] max-w-[320px]' : 'w-[260px] min-w-[260px] max-w-[260px]') : ''} ${cell.column.id === 'company' ? 'w-[220px] min-w-[220px] max-w-[220px]' : ''} ${cell.column.id === 'score' ? 'w-[180px] min-w-[180px]' : ''} ${showDetails && cell.column.id === 'date' ? 'w-[130px] min-w-[130px]' : ''} ${showDetails && cell.column.id === 'link' ? 'w-[180px] min-w-[180px] max-w-[180px]' : ''}`}
                      >
                        {cell.column.id === 'rank' ? (
                          <span className="font-mono text-xs text-muted-foreground">
                          {(rowPosition + 1).toString().padStart(2, '0')}
                        </span>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {showDetails && isExpanded && original.categoryColumns.length > 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={table.getVisibleLeafColumns().length} className="bg-muted/40 py-3">
                      <div className="mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => setExpandedRowId(null)}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                          Hide breakdown
                        </Button>
                      </div>
                      <div className="w-full overflow-x-auto">
                        <table className="min-w-max border-collapse text-xs">
                          <thead>
                            <tr>
                              {original.runCount > 1 && (
                                <th className="border border-border px-3 py-2 text-left text-foreground/80">
                                  Run
                                </th>
                              )}
                              {original.categoryColumns.map((column) => (
                                <th
                                  key={`${original.id}-${column}`}
                                  className="border border-border px-3 py-2 text-left text-foreground/80"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {original.runs.map((run, runIndex) => (
                              <tr key={`${original.id}-run-${runIndex}`}>
                                {original.runCount > 1 && (
                                  <td className="border border-border px-3 py-2 text-muted-foreground">
                                    {runIndex + 1}
                                  </td>
                                )}
                                {original.categoryColumns.map((column) => (
                                  <td
                                    key={`${original.id}-${runIndex}-${column}`}
                                    className="border border-border px-3 py-2"
                                  >
                                    {run.categoryValues[column] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
