import { useQuery } from '@tanstack/react-query';
import { fetchSelfReportedRowsByTab, fetchVerifiedRows } from './data';
import { aggregateVerifiedRows } from './transform';

export function useVerifiedLeaderboard() {
  return useQuery({
    queryKey: ['verified-leaderboard'],
    queryFn: async () => {
      const rows = await fetchVerifiedRows();
      return aggregateVerifiedRows(rows);
    },
  });
}

export function useSelfReportedLeaderboard(enabled: boolean) {
  return useQuery({
    queryKey: ['self-reported-leaderboard'],
    queryFn: fetchSelfReportedRowsByTab,
    enabled,
  });
}
