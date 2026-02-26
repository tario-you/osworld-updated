import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_ORDER, VERIFIED_ONLY_TAB } from './constants';
import { useSelfReportedLeaderboard, useVerifiedLeaderboard } from './hooks';
import {
  applyVerifiedFilters,
  getApproachTypes,
  getMaxSteps,
  getScopedRows,
} from './transform';
import type {
  LeaderboardScope,
  SelfReportedTab,
} from './types';
import { VerifiedLeaderboardTable } from './components/VerifiedLeaderboardTable';
import { SelfReportedTable } from './components/SelfReportedTable';

export function BenchmarkPage() {
  const verifiedQuery = useVerifiedLeaderboard();
  const [activeTab, setActiveTab] = useState<SelfReportedTab>(VERIFIED_ONLY_TAB);
  const [scope, setScope] = useState<LeaderboardScope>('all');
  const [selectedApproachesState, setSelectedApproachesState] = useState<
    string[] | null
  >(null);
  const [maxSteps, setMaxSteps] = useState('');
  const [includeA11y, setIncludeA11y] = useState(true);
  const [includeTool, setIncludeTool] = useState(true);
  const [includeMultiRollout, setIncludeMultiRollout] = useState(true);
  const [includeRetry, setIncludeRetry] = useState(true);
  const [modelQuery, setModelQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const selfReportedQuery = useSelfReportedLeaderboard(true);

  const verifiedRows = useMemo(() => verifiedQuery.data ?? [], [verifiedQuery.data]);

  const scopedRows = useMemo(
    () => getScopedRows(verifiedRows, scope),
    [scope, verifiedRows],
  );

  const approachTypes = useMemo(
    () => getApproachTypes(scopedRows),
    [scopedRows],
  );

  const maxStepOptions = useMemo(() => getMaxSteps(scopedRows), [scopedRows]);

  const selectedApproaches = useMemo(() => {
    if (selectedApproachesState === null) {
      return approachTypes;
    }

    return selectedApproachesState.filter((approach) =>
      approachTypes.includes(approach),
    );
  }, [approachTypes, selectedApproachesState]);

  const filteredRows = useMemo(
    () =>
      applyVerifiedFilters({
        rows: scopedRows,
        selectedApproaches,
        maxSteps,
        includeA11y,
        includeTool,
        includeMultiRollout,
        includeRetry,
        scope,
      }),
    [
      includeA11y,
      includeMultiRollout,
      includeRetry,
      includeTool,
      maxSteps,
      scope,
      scopedRows,
      selectedApproaches,
    ],
  );

  const query = modelQuery.trim().toLowerCase();

  const queriedRows = useMemo(() => {
    if (!query) {
      return filteredRows;
    }

    return filteredRows.filter((row) => {
      const haystack = `${row.model} ${row.institution} ${row.approachType}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [filteredRows, query]);

  const tabs = TAB_ORDER;
  const selectedTab = activeTab;

  const activeSelfReportedRows =
    selectedTab === VERIFIED_ONLY_TAB
      ? []
      : (selfReportedQuery.data?.[selectedTab] ?? []);

  function toggleApproach(approach: string) {
    setSelectedApproachesState((current) => {
      const baseline = current ?? approachTypes;
      if (baseline.includes(approach)) {
        return baseline.filter((value) => value !== approach);
      }

      return [...baseline, approach];
    });
  }

  function resetFilters() {
    setSelectedApproachesState(null);
    setMaxSteps('');
    setIncludeA11y(true);
    setIncludeTool(true);
    setIncludeMultiRollout(true);
    setIncludeRetry(true);
    setModelQuery('');
  }

  function changeScope(nextScope: LeaderboardScope) {
    setScope(nextScope);
    resetFilters();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1360px] px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-foreground">
              CUA Leaderboard
            </p>
            <p className="text-xs text-muted-foreground">
              updated{' '}
              <a
                className="text-primary hover:underline"
                href="https://os-world.github.io/"
                target="_blank"
                rel="noreferrer"
              >
                os-world.github.io
              </a>
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <p className="text-[11px] text-muted-foreground">Updated Feb 26, 2026</p>
          </div>
        </header>

        <Tabs
          value={selectedTab}
          onValueChange={(value) => setActiveTab(value as SelfReportedTab)}
        >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={modelQuery}
                    onChange={(event) => setModelQuery(event.target.value)}
                    placeholder="Search model or institution"
                    className="pl-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOptions((current) => !current)}
                >
                  {showOptions ? 'Hide options' : 'Options'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetails((current) => !current)}
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </Button>
              </div>

              {showDetails && selectedTab === VERIFIED_ONLY_TAB && scope === 'all' ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">🌳 Additional a11y tree</Badge>
                  <Badge variant="secondary">💻 Additional coding action</Badge>
                  <Badge variant="secondary">🔁 Multiple rollout</Badge>
                  <Badge variant="secondary">↺ Retry / self-verification</Badge>
                </div>
              ) : null}

              {showOptions ? (
                <div className="mb-4 space-y-4">
                  <TabsList className="h-auto flex-wrap">
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab} value={tab}>
                        <span>{tab}{tab !== VERIFIED_ONLY_TAB ? '*' : ''}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <p className="text-xs text-muted-foreground">
                    * Self-reported results (not verified under the unified official evaluation settings).
                  </p>

                  {selectedTab === VERIFIED_ONLY_TAB ? (
                    <>
                      <Tabs value={scope} onValueChange={(value) => changeScope(value as LeaderboardScope)}>
                        <TabsList>
                          <TabsTrigger value="foundation">Foundation E2E GUI</TabsTrigger>
                          <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div className="space-y-2 xl:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Model Types
                          </p>
                          <div className="grid gap-1 sm:grid-cols-2">
                            {approachTypes.map((approach) => (
                              <label
                                key={approach}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <Checkbox
                                  checked={selectedApproaches.includes(approach)}
                                  onCheckedChange={() => toggleApproach(approach)}
                                />
                                <span>{approach}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {scope === 'all' && (
                          <div className="space-y-2 xl:col-span-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Tag Filters
                            </p>
                            <div className="grid gap-1 sm:grid-cols-2">
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                  checked={includeA11y}
                                  onCheckedChange={(checked) => setIncludeA11y(checked === true)}
                                />
                                <span>A11y tree</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                  checked={includeTool}
                                  onCheckedChange={(checked) => setIncludeTool(checked === true)}
                                />
                                <span>Additional coding action</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                  checked={includeMultiRollout}
                                  onCheckedChange={(checked) => setIncludeMultiRollout(checked === true)}
                                />
                                <span>Multiple rollout</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                  checked={includeRetry}
                                  onCheckedChange={(checked) => setIncludeRetry(checked === true)}
                                />
                                <span>Retry / self-verification</span>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Controls
                          </p>
                          <div className="space-y-2">
                            <Select
                              value={maxSteps || 'all'}
                              onValueChange={(value) => setMaxSteps(value === 'all' ? '' : value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Max Steps" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All max steps</SelectItem>
                                {maxStepOptions.map((step) => (
                                  <SelectItem key={step} value={step}>
                                    {step}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button variant="outline" className="w-full" onClick={resetFilters}>
                              Reset filters
                            </Button>
                          </div>
                        </div>
                      </div>

                    </>
                  ) : null}
                </div>
              ) : null}

              <TabsContent value={VERIFIED_ONLY_TAB}>

                {verifiedQuery.isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading verified benchmark results...
                  </div>
                ) : verifiedQuery.isError ? (
                  <div className="py-8 text-center text-destructive">
                    Failed to load verified benchmark results.
                  </div>
                ) : (
                  <VerifiedLeaderboardTable rows={queriedRows} scope={scope} showDetails={showDetails} />
                )}
              </TabsContent>

              {tabs
                .filter((tab) => tab !== VERIFIED_ONLY_TAB)
                .map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    {selfReportedQuery.isLoading ? (
                      <div className="py-8 text-center text-muted-foreground">
                        Loading self-reported results...
                      </div>
                    ) : selfReportedQuery.isError ? (
                      <div className="py-8 text-center text-destructive">
                        Failed to load self-reported results.
                      </div>
                    ) : (
                      <SelfReportedTable rows={activeSelfReportedRows} showDetails={showDetails} />
                    )}
                  </TabsContent>
                ))}
            </Tabs>

      </div>
    </main>
  );
}
