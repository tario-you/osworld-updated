import { Fragment, useMemo, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

function toScoreLabel(row: AggregatedVerifiedRow): string {
  if (row.successRateStd > 0) {
    return `${row.successRateAvg.toFixed(2)}±${row.successRateStd.toFixed(2)}%`;
  }

  return `${row.successRateAvg.toFixed(2)}%`;
}

export function VerifiedLeaderboardTable({
  rows,
  scope,
}: VerifiedLeaderboardTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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
        cell: (info) => {
          const rank = info.row.index + 1;
          return (
            <span className="font-mono text-sm text-muted-foreground">
              {rank.toString().padStart(2, '0')}
            </span>
          );
        },
      },
      {
        id: 'model',
        header: 'Model',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{row.model}</p>
                {row.hasAdditionalA11yTree && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    🌳
                  </Badge>
                )}
                {scope === 'all' && row.hasAdditionalTool && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    💻
                  </Badge>
                )}
                {scope === 'all' && row.hasMultipleRollout && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    🔁
                  </Badge>
                )}
                {scope === 'all' && row.hasRetryStrategy && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    ↺
                  </Badge>
                )}
              </div>
              {row.institution && (
                <p className="text-xs text-muted-foreground">{row.institution}</p>
              )}
              {row.dateLabel && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {row.dateLabel}
                </p>
              )}
              {row.sources.length > 0 && (
                <p className="flex flex-wrap items-center gap-2 text-xs text-primary">
                  {row.sources.map((source) => (
                    <a
                      key={`${row.id}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {source.label}
                    </a>
                  ))}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: 'details',
        header: 'Details',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">
                {row.approachType || 'N/A'}
              </Badge>
              <Badge variant="outline">
                {row.maxSteps || 'N/A'} steps
              </Badge>
              <Badge variant="outline">
                {row.runCount} run{row.runCount > 1 ? 's' : ''}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'score',
        header: 'Score',
        cell: (info) => {
          const row = info.row.original;
          const isExpanded = activeExpandedRowId === row.id;

          return (
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{toScoreLabel(row)}</span>
              {row.categoryColumns.length > 0 && (
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
    [activeExpandedRowId, scope],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <ScrollArea className="w-full">
        <Table className="min-w-[920px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"
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
            {table.getRowModel().rows.map((row) => {
              const original = row.original;
              const isExpanded = activeExpandedRowId === original.id;

              return (
                <Fragment key={row.id}>
                  <TableRow
                    className="hover:bg-muted/40"
                    data-state={row.index === 0 ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && original.categoryColumns.length > 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="bg-muted/40 py-3">
                        <ScrollArea className="w-full whitespace-nowrap">
                          <table className="w-max min-w-full border-collapse text-xs">
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
                        </ScrollArea>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
