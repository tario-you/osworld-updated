import type { DataRow } from '../types';
import { selfReportedScore } from '../transform';
import { toStringValue } from '../parsing';

interface SelfReportedTableProps {
  rows: DataRow[];
}

export function SelfReportedTable({ rows }: SelfReportedTableProps) {
  return (
    <div className="table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Model</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rank = index + 1;
            const model = toStringValue(row.Model);
            const institution = toStringValue(row.Institution);
            const date = toStringValue(row.Date);
            const paperLink = toStringValue(row.PaperLink);
            const paperLabel = toStringValue(row.PaperAuthors) || 'Source';

            return (
              <tr key={`${model}-${index}`} className={rank === 1 ? 'top-row' : undefined}>
                <td>
                  <span className={rank === 1 ? 'rank rank--first' : 'rank'}>{rank}</span>
                </td>
                <td>
                  <div className="model-cell">
                    <strong>{model}</strong>
                    {institution && <p className="subtle-text">{institution}</p>}
                    {date && <p className="subtle-date">{date}</p>}
                    {paperLink && (
                      <p className="source-links">
                        <a href={paperLink} target="_blank" rel="noreferrer">
                          {paperLabel}
                        </a>
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <strong className="score-value">{selfReportedScore(row)}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
