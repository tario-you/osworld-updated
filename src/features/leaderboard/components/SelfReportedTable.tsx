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
import { selfReportedScore } from '../transform';
import { toStringValue } from '../parsing';

interface SelfReportedTableProps {
  rows: DataRow[];
}

export function SelfReportedTable({ rows }: SelfReportedTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">#</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Model</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const rank = index + 1;
            const model = toStringValue(row.Model);
            const institution = toStringValue(row.Institution);
            const date = toStringValue(row.Date);
            const paperLink = toStringValue(row.PaperLink);
            const paperLabel = toStringValue(row.PaperAuthors) || 'Source';

            return (
              <TableRow
                key={`${model}-${index}`}
                className="hover:bg-muted/40"
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {rank.toString().padStart(2, '0')}
                </TableCell>
                <TableCell className="space-y-1">
                  <p className="font-medium">{model}</p>
                  {institution && <p className="text-xs text-muted-foreground">{institution}</p>}
                  {date && <p className="text-xs text-muted-foreground">{date}</p>}
                  {paperLink && (
                    <p className="text-xs text-primary">
                      <a href={paperLink} target="_blank" rel="noreferrer" className="hover:underline">
                        {paperLabel}
                      </a>
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {selfReportedScore(row)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
