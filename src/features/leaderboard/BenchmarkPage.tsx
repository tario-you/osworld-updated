import { useMemo, useState } from 'react';
import {
  TAB_ORDER,
  VERIFIED_ONLY_TAB,
} from './constants';
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

  const sortedRows = useMemo(
    () => sortVerifiedRows(filteredRows, sortBy),
    [filteredRows, sortBy],
  );

  const allApproachesSelected =
    approachTypes.length > 0 && selectedApproaches.length === approachTypes.length;

  const tabs = showSelfReported ? TAB_ORDER : [VERIFIED_ONLY_TAB];
  const selectedTab = showSelfReported ? activeTab : VERIFIED_ONLY_TAB;

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
    setSortBy('score');
    setIncludeA11y(true);
    setIncludeTool(true);
    setIncludeMultiRollout(true);
    setIncludeRetry(true);
  }

  function changeScope(nextScope: LeaderboardScope) {
    setScope(nextScope);
    resetFilters();
  }

  return (
    <main className="benchmark-page">
      <header className="page-header">
        <h1>OSWorld-Verified Benchmark</h1>
        <p className="credits-text">
          credits:{' '}
          <a
            href="https://os-world.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            https://os-world.github.io/
          </a>
        </p>
      </header>

      <section className="content-card">
        {!showSelfReported ? (
          <>
            <h2>Results</h2>
            <p>
              These are official results evaluated by the OSWorld team under
              unified settings and environment.
            </p>
            <p>
              For self-reported results across different modalities, use{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => setShowSelfReported(true)}
              >
                Show self-reported results
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <h2>OSWorld Leaderboard</h2>
            <p>
              Verified results are official evaluations under unified settings.
              Self-reported results are community-submitted runs across
              modalities.
            </p>
          </>
        )}
      </section>

      <section className="content-card">
        <div className="tabs">
          {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={tab === selectedTab ? 'tab tab--active' : 'tab'}
              >
                {tab}
              </button>
            ))}
        </div>

        {selectedTab === VERIFIED_ONLY_TAB ? (
          <>
            <div className="sub-tabs">
              <button
                type="button"
                className={scope === 'foundation' ? 'tab tab--active' : 'tab'}
                onClick={() => changeScope('foundation')}
              >
                Foundation E2E GUI
              </button>
              <button
                type="button"
                className={scope === 'all' ? 'tab tab--active' : 'tab'}
                onClick={() => changeScope('all')}
              >
                All
              </button>
            </div>

            <div className="filters-card">
              <div className="filter-block">
                <span className="filter-label">Model Type</span>
                <label className="checkbox-item" htmlFor="approach-all">
                  <input
                    id="approach-all"
                    type="checkbox"
                    checked={allApproachesSelected}
                    onChange={(event) => {
                      setSelectedApproachesState(
                        event.target.checked ? approachTypes : [],
                      );
                    }}
                  />
                  <span>All</span>
                </label>
                <div className="checkbox-list">
                  {approachTypes.map((approach) => (
                    <label
                      className="checkbox-item"
                      key={approach}
                      htmlFor={`approach-${approach}`}
                    >
                      <input
                        id={`approach-${approach}`}
                        type="checkbox"
                        checked={selectedApproaches.includes(approach)}
                        onChange={() => toggleApproach(approach)}
                      />
                      <span>{approach}</span>
                    </label>
                  ))}
                </div>
              </div>

              {scope === 'all' && (
                <div className="filter-block">
                  <span className="filter-label">Tags</span>
                  <div className="checkbox-list">
                    <label className="checkbox-item" htmlFor="tag-a11y">
                      <input
                        id="tag-a11y"
                        type="checkbox"
                        checked={includeA11y}
                        onChange={(event) => setIncludeA11y(event.target.checked)}
                      />
                      <span>A11y tree</span>
                    </label>
                    <label className="checkbox-item" htmlFor="tag-tool">
                      <input
                        id="tag-tool"
                        type="checkbox"
                        checked={includeTool}
                        onChange={(event) => setIncludeTool(event.target.checked)}
                      />
                      <span>Additional coding-based action</span>
                    </label>
                    <label className="checkbox-item" htmlFor="tag-multi">
                      <input
                        id="tag-multi"
                        type="checkbox"
                        checked={includeMultiRollout}
                        onChange={(event) =>
                          setIncludeMultiRollout(event.target.checked)
                        }
                      />
                      <span>Multiple rollout</span>
                    </label>
                    <label className="checkbox-item" htmlFor="tag-retry">
                      <input
                        id="tag-retry"
                        type="checkbox"
                        checked={includeRetry}
                        onChange={(event) => setIncludeRetry(event.target.checked)}
                      />
                      <span>Retry / self-verification</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="filter-inline">
                <label htmlFor="max-steps">Max Steps</label>
                <select
                  id="max-steps"
                  value={maxSteps}
                  onChange={(event) => setMaxSteps(event.target.value)}
                >
                  <option value="">All</option>
                  {maxStepOptions.map((step) => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-inline">
                <label htmlFor="sort-by">Sort by</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as VerifiedSortBy)
                  }
                >
                  <option value="score">Score (Highest first)</option>
                  <option value="date">Date (Newest first)</option>
                  <option value="model">Model Name (A-Z)</option>
                </select>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            </div>

            {scope === 'all' && (
              <div className="legend-row">
                <span>🌳 Additional a11y tree</span>
                <span>💻 Additional coding-based action</span>
                <span>🔁 Multiple rollout</span>
                <span>↺ Retry / self-verification</span>
              </div>
            )}

            {verifiedQuery.isLoading ? (
              <p className="status-message">Loading verified benchmark results...</p>
            ) : verifiedQuery.isError ? (
              <p className="status-message status-message--error">
                Failed to load verified benchmark results.
              </p>
            ) : (
              <VerifiedLeaderboardTable rows={sortedRows} scope={scope} />
            )}
          </>
        ) : selfReportedQuery.isLoading ? (
          <p className="status-message">Loading self-reported results...</p>
        ) : selfReportedQuery.isError ? (
          <p className="status-message status-message--error">
            Failed to load self-reported results.
          </p>
        ) : (
          <SelfReportedTable rows={activeSelfReportedRows} />
        )}
      </section>
    </main>
  );
}
