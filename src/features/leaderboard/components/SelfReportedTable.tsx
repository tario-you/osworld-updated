import { useEffect, useMemo, useState } from 'react';
import {
  type Column,
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DataRow } from '../types';
import { formatDateLabel, parseDateValue, toNumberValue, toStringValue } from '../parsing';
import { selfReportedScore } from '../transform';

interface SelfReportedTableProps {
  rows: DataRow[];
  showDetails: boolean;
}

interface SelfReportedRowView {
  id: string;
  model: string;
  institution: string;
  dateLabel: string;
  dateValue: number;
  paperLink: string;
  paperLabel: string;
  scoreLabel: string;
  scoreValue: number;
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
  column: Column<SelfReportedRowView, unknown>;
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

export function SelfReportedTable({ rows, showDetails }: SelfReportedTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'score', desc: true },
  ]);

  useEffect(() => {
    if (showDetails) {
      return;
    }

    setSorting((current) => {
      const currentColumnId = current[0]?.id;
      if (
        currentColumnId === 'company' ||
        currentColumnId === 'date' ||
        currentColumnId === 'link'
      ) {
        return [{ id: 'score', desc: true }];
      }
      return current;
    });
  }, [showDetails]);

  const normalizedRows = useMemo<SelfReportedRowView[]>(
    () =>
      rows.map((row, index) => {
        const model = toStringValue(row.Model);
        const institution = toStringValue(row.Institution);
        const parsedDate = parseDateValue(row.Date);
        const paperLink = toStringValue(row.PaperLink);
        const paperLabel = toStringValue(row.PaperAuthors) || 'Source';
        const scoreLabel = selfReportedScore(row);
        const scoreValue = toNumberValue(row.Score ?? row['Success rate']) ?? Number.NEGATIVE_INFINITY;

        return {
          id: `${model}-${index}`,
          model,
          institution,
          dateLabel: formatDateLabel(parsedDate, row.Date) || '-',
          dateValue: parsedDate?.getTime() ?? 0,
          paperLink,
          paperLabel,
          scoreLabel,
          scoreValue,
        };
      }),
    [rows],
  );

  const columns = useMemo<ColumnDef<SelfReportedRowView>[]>(
    () => [
      {
        id: 'rank',
        header: '#',
        enableSorting: false,
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(info.row.index + 1).toString().padStart(2, '0')}
          </span>
        ),
      },
      {
        id: 'model',
        accessorFn: (row) => row.model,
        header: ({ column }) => <SortableHeader column={column} label="Model" />,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="w-[320px] min-w-[320px] max-w-[320px]">
              {!showDetails && row.paperLink ? (
                <a
                  href={row.paperLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-medium text-primary hover:underline"
                >
                  {row.model}
                </a>
              ) : (
                <p className="truncate font-medium">{row.model}</p>
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
              cell: (info) => (
                <span className="block w-[220px] min-w-[220px] max-w-[220px] truncate text-xs text-muted-foreground">
                  {info.row.original.institution || '-'}
                </span>
              ),
            },
          ] satisfies ColumnDef<SelfReportedRowView>[])
        : []),
      ...(showDetails
        ? ([
            {
              id: 'date',
              accessorFn: (row) => row.dateValue,
              header: ({ column }) => <SortableHeader column={column} label="Date" />,
              cell: (info) => (
                <span className="text-xs text-muted-foreground">{info.row.original.dateLabel || '-'}</span>
              ),
            },
            {
              id: 'link',
              accessorFn: (row) => row.paperLabel,
              header: ({ column }) => <SortableHeader column={column} label="Link" />,
              cell: (info) => {
                const row = info.row.original;
                return row.paperLink ? (
                  <a
                    href={row.paperLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-[180px] min-w-[180px] max-w-[180px] truncate text-xs text-primary hover:underline"
                  >
                    {row.paperLabel}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                );
              },
            },
          ] satisfies ColumnDef<SelfReportedRowView>[])
        : []),
      {
        id: 'score',
        accessorFn: (row) => row.scoreValue,
        header: ({ column }) => <SortableHeader column={column} label="Score" />,
        cell: (info) => (
          <Badge variant="secondary" className="font-mono">
            {info.row.original.scoreLabel}
          </Badge>
        ),
      },
    ],
    [showDetails],
  );

  const table = useReactTable({
    data: normalizedRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <Table className={showDetails ? 'min-w-[1160px]' : 'table-fixed min-w-[640px]'}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-xs uppercase tracking-wide text-muted-foreground ${
                    header.id === 'rank' ? 'w-[64px] min-w-[64px]' : ''
                  } ${header.id === 'model' ? 'w-[320px] min-w-[320px]' : ''} ${
                    header.id === 'company' ? 'w-[220px] min-w-[220px]' : ''
                  } ${header.id === 'score' ? 'w-[180px] min-w-[180px]' : ''} ${
                    showDetails && header.id === 'date' ? 'w-[130px] min-w-[130px]' : ''
                  } ${showDetails && header.id === 'link' ? 'w-[180px] min-w-[180px]' : ''}`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowPosition) => (
            <TableRow key={row.id} className="hover:bg-muted/40">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={`${cell.column.id === 'rank' ? 'w-[64px] min-w-[64px]' : ''} ${
                    cell.column.id === 'model' ? 'w-[320px] min-w-[320px] max-w-[320px]' : ''
                  } ${cell.column.id === 'company' ? 'w-[220px] min-w-[220px] max-w-[220px]' : ''} ${
                    cell.column.id === 'score' ? 'w-[180px] min-w-[180px]' : ''
                  } ${showDetails && cell.column.id === 'date' ? 'w-[130px] min-w-[130px]' : ''} ${
                    showDetails && cell.column.id === 'link' ? 'w-[180px] min-w-[180px] max-w-[180px]' : ''
                  }`}
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
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
