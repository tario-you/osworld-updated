import { useMemo, useState } from 'react';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_ORDER, VERIFIED_ONLY_TAB } from './constants';
import { useSelfReportedLeaderboard, useVerifiedLeaderboard } from './hooks';
import {
  applyVerifiedFilters,
  getApproachTypes,
  getMaxSteps,
  getScopedRows,
  sortVerifiedRows,
} from './transform';
import type {
  LeaderboardScope,
  SelfReportedTab,
  VerifiedSortBy,
} from './types';
import { VerifiedLeaderboardTable } from './components/VerifiedLeaderboardTable';
import { SelfReportedTable } from './components/SelfReportedTable';

export function BenchmarkPage() {
  const verifiedQuery = useVerifiedLeaderboard();
  const [showSelfReported, setShowSelfReported] = useState(false);
  const [activeTab, setActiveTab] = useState<SelfReportedTab>(VERIFIED_ONLY_TAB);
  const [scope, setScope] = useState<LeaderboardScope>('all');
  const [sortBy, setSortBy] = useState<VerifiedSortBy>('score');
  const [selectedApproachesState, setSelectedApproachesState] = useState<
    string[] | null
  >(null);
  const [maxSteps, setMaxSteps] = useState('');
  const [includeA11y, setIncludeA11y] = useState(true);
  const [includeTool, setIncludeTool] = useState(true);
  const [includeMultiRollout, setIncludeMultiRollout] = useState(true);
  const [includeRetry, setIncludeRetry] = useState(true);
  const [modelQuery, setModelQuery] = useState('');

  const selfReportedQuery = useSelfReportedLeaderboard(showSelfReported);

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

  const sortedRows = useMemo(
    () => sortVerifiedRows(queriedRows, sortBy),
    [queriedRows, sortBy],
  );

  const allApproachesSelected =
    approachTypes.length > 0 && selectedApproaches.length === approachTypes.length;

  const tabs = showSelfReported ? TAB_ORDER : [VERIFIED_ONLY_TAB];
  const selectedTab = showSelfReported ? activeTab : VERIFIED_ONLY_TAB;

  const activeSelfReportedRows =
    selectedTab === VERIFIED_ONLY_TAB
      ? []
      : (selfReportedQuery.data?.[selectedTab] ?? []);

  const topModels = useMemo(
    () => sortVerifiedRows(getScopedRows(verifiedRows, 'all'), 'score').slice(0, 5),
    [verifiedRows],
  );

  const approachStats = useMemo(() => {
    const total = verifiedRows.length || 1;
    const countByType = new Map<string, number>();
    for (const row of verifiedRows) {
      countByType.set(row.approachType, (countByType.get(row.approachType) ?? 0) + 1);
    }

    return [...countByType.entries()]
      .map(([type, count]) => ({
        type,
        count,
        share: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [verifiedRows]);

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
    setSortBy('score');
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
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              OSWorld Updated
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight md:text-4xl">
              AI Model Rankings
            </h1>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="secondary">Verified benchmark</Badge>
            <Badge variant="outline">Updated Feb 22, 2026</Badge>
          </div>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>OSWorld-Verified Leaderboard</CardTitle>
            <CardDescription>
              Based on official unified evaluation runs, with optional self-reported modality tabs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              variant={showSelfReported ? 'secondary' : 'outline'}
              onClick={() => setShowSelfReported((prev) => !prev)}
            >
              {showSelfReported ? 'Hide self-reported tabs' : 'Show self-reported tabs'}
            </Button>
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <p className="text-xs text-muted-foreground">
              credits:{' '}
              <a
                className="text-primary hover:underline"
                href="https://os-world.github.io/"
                target="_blank"
                rel="noreferrer"
              >
                os-world.github.io
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top Models</CardTitle>
              <CardDescription>
                Highest verified success rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topModels.map((model, index) => (
                <div key={model.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate">
                      {index + 1}. {model.model}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{model.institution}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {model.successRateAvg.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Model Mix</CardTitle>
              <CardDescription>
                Distribution by approach type in the verified dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {approachStats.map((entry) => (
                <div
                  key={entry.type}
                  className="rounded-md border bg-muted/30 p-3"
                >
                  <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                    {entry.type}
                  </p>
                  <p className="mt-2 text-xl font-medium">{entry.count}</p>
                  <p className="text-xs text-muted-foreground">{entry.share}% share</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => setActiveTab(value as SelfReportedTab)}
            >
              <TabsList className="mb-4 h-auto flex-wrap">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={VERIFIED_ONLY_TAB}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Compare the most popular verified models</span>
                  </div>
                  <Tabs value={scope} onValueChange={(value) => changeScope(value as LeaderboardScope)}>
                    <TabsList>
                      <TabsTrigger value="foundation">Foundation E2E GUI</TabsTrigger>
                      <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="mb-4 grid gap-3 rounded-lg border bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-5">
                  <div className="space-y-2 xl:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Model Types
                    </p>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={allApproachesSelected}
                        onCheckedChange={(checked) => {
                          setSelectedApproachesState(checked === true ? approachTypes : []);
                        }}
                      />
                      <span>All</span>
                    </label>
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

                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as VerifiedSortBy)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="score">Score (Highest first)</SelectItem>
                          <SelectItem value="date">Date (Newest first)</SelectItem>
                          <SelectItem value="model">Model Name (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={modelQuery}
                          onChange={(event) => setModelQuery(event.target.value)}
                          placeholder="Search model or institution"
                          className="pl-8"
                        />
                      </div>

                      <Button variant="outline" className="w-full" onClick={resetFilters}>
                        Reset filters
                      </Button>
                    </div>
                  </div>
                </div>

                {scope === 'all' && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">🌳 Additional a11y tree</Badge>
                    <Badge variant="secondary">💻 Additional coding action</Badge>
                    <Badge variant="secondary">🔁 Multiple rollout</Badge>
                    <Badge variant="secondary">↺ Retry / self-verification</Badge>
                  </div>
                )}

                {verifiedQuery.isLoading ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Loading verified benchmark results...
                    </CardContent>
                  </Card>
                ) : verifiedQuery.isError ? (
                  <Card className="border-destructive/30 bg-destructive/10">
                    <CardContent className="py-8 text-center text-destructive">
                      Failed to load verified benchmark results.
                    </CardContent>
                  </Card>
                ) : (
                  <VerifiedLeaderboardTable rows={sortedRows} scope={scope} />
                )}
              </TabsContent>

              {tabs
                .filter((tab) => tab !== VERIFIED_ONLY_TAB)
                .map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    {selfReportedQuery.isLoading ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          Loading self-reported results...
                        </CardContent>
                      </Card>
                    ) : selfReportedQuery.isError ? (
                      <Card className="border-destructive/30 bg-destructive/10">
                        <CardContent className="py-8 text-center text-destructive">
                          Failed to load self-reported results.
                        </CardContent>
                      </Card>
                    ) : (
                      <SelfReportedTable rows={activeSelfReportedRows} />
                    )}
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Design direction inspired by openrouter.ai/rankings, adapted to OSWorld verified data.</span>
        </div>
      </div>
    </main>
  );
}
