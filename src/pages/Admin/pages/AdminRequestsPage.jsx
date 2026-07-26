import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filter, RefreshCw, Search, X, Zap, ZapOff } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminRequestLogs } from "../../../services/adminService";
import { LoadingState, RequestTable, requestError } from "../components/AdminUi";

const EMPTY_FILTERS = { user: "", path: "", status: "" };

// Friendly labels so admins don't have to memorize raw codes.
const STATUS_OPTIONS = [
  { code: 200, label: "200 · OK" },
  { code: 201, label: "201 · Created" },
  { code: 204, label: "204 · No content" },
  { code: 400, label: "400 · Bad request" },
  { code: 401, label: "401 · Unauthorized" },
  { code: 403, label: "403 · Forbidden" },
  { code: 404, label: "404 · Not found" },
  { code: 409, label: "409 · Conflict" },
  { code: 429, label: "429 · Rate limited" },
  { code: 500, label: "500 · Server error" },
  { code: 502, label: "502 · Bad gateway" },
  { code: 503, label: "503 · Unavailable" },
];

const FILTER_LABELS = { user: "User", path: "Path", status: "Status" };

const AUTO_REFRESH_MS = 8000;
const DEBOUNCE_MS = 400;

function formatRelativeTime(timestamp, now) {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 3) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export default function AdminRequestsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState("1");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(Date.now());

  const searchRef = useRef(null);
  const hasLoadedOnce = useRef(false);

  // Debounce filter typing before it hits the network.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setQuery(filters);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const showSkeleton = !silent || !hasLoadedOnce.current;
      if (showSkeleton) setLoading(true);
      else setRefreshing(true);

      try {
        const result = await getAdminRequestLogs({ page, size: 25, ...query });
        setData(result);
        setLastUpdated(Date.now());
      } catch (error) {
        toast.error(requestError(error, "Could not load request history"));
      } finally {
        hasLoadedOnce.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, query]
  );

  // Every real navigation (filters/page change) still loads normally,
  // but doesn't wipe the table — only the very first load shows a skeleton.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  useEffect(() => {
    setPageInput(String(page + 1));
  }, [page]);

  // Live auto-refresh, fully silent so the table never flashes.
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load]);

  // Tick the "updated Xs ago" label once a second.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Keyboard shortcuts: "/" focuses search, "r" force-refreshes.
  useEffect(() => {
    const handler = (event) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key.toLowerCase() === "r" && !isTyping) {
        event.preventDefault();
        load({ silent: true });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [load]);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([, value]) => Boolean(value)),
    [filters]
  );

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const clearFilter = (key) => updateFilter(key, "");
  const clearAllFilters = () => setFilters(EMPTY_FILTERS);

  const totalPages = Math.max(1, data?.totalPages || 1);

  const commitPageJump = () => {
    const target = Math.min(totalPages, Math.max(1, Number(pageInput) || 1));
    setPage(target - 1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Request history</h1>
          <p className="text-xs text-slate-500">
            Retained, sanitized API outcomes with full administrator-only IP visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-slate-500 sm:flex">
            {autoRefresh && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            )}
            updated {formatRelativeTime(lastUpdated, now)}
          </span>

          <button
            onClick={() => setAutoRefresh((value) => !value)}
            title={autoRefresh ? "Turn off live updates" : "Turn on live updates"}
            className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors duration-150 ${
              autoRefresh
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {autoRefresh ? <Zap size={14} /> : <ZapOff size={14} />}
            <span className="hidden sm:inline">{autoRefresh ? "Live" : "Live off"}</span>
          </button>

          <button
            onClick={() => load({ silent: true })}
            title="Refresh (r)"
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <section className="space-y-2 rounded-md border border-white/10 bg-[#0d1420] p-3">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_190px]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/15 px-3 text-slate-500 transition-colors duration-150 focus-within:border-white/25">
            <Search size={15} />
            <input
              ref={searchRef}
              value={filters.user}
              onChange={(event) => updateFilter("user", event.target.value)}
              placeholder="User name or email"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            {!filters.user && (
              <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600 sm:block">
                /
              </kbd>
            )}
          </label>

          <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/15 px-3 text-slate-500 transition-colors duration-150 focus-within:border-white/25">
            <Filter size={15} />
            <input
              value={filters.path}
              onChange={(event) => updateFilter("path", event.target.value)}
              placeholder="Endpoint contains..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="h-10 rounded-md border border-white/10 bg-[#0b1220] px-3 text-sm text-slate-300 outline-none transition-colors duration-150 focus:border-white/25"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter chips — only takes up space when filters are set */}
        <div
          className={`flex flex-wrap items-center gap-1.5 overflow-hidden transition-all duration-200 ${
            activeFilters.length ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 py-1 pl-2.5 pr-1.5 text-xs text-slate-300"
            >
              <span className="text-slate-500">{FILTER_LABELS[key]}:</span> {value}
              <button
                onClick={() => clearFilter(key)}
                className="grid h-4 w-4 place-items-center rounded-full text-slate-500 hover:bg-white/10 hover:text-white"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 underline-offset-2 hover:text-white hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </section>

      {/* ---------- Table ---------- */}
      <section className="admin-panel admin-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h3>Captured requests</h3>
            <p>Response bodies are not stored, preventing secrets and personal data from leaking into monitoring.</p>
          </div>
          <span className="flex items-center gap-1.5 font-mono">
            {data?.totalElements ?? 0} events
            {refreshing && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" title="Refreshing" />
            )}
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && !data ? (
            <LoadingState label="Loading request history" />
          ) : (
            <div
              className={`transition-opacity duration-200 ${
                refreshing ? "opacity-60" : "opacity-100"
              }`}
            >
              <RequestTable requests={data?.content || []} detailed />
            </div>
          )}
        </div>

        <footer className="admin-pagination">
          <button disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>
            Previous
          </button>

          <span className="flex items-center gap-1.5 font-mono text-xs">
            Page
            <input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ""))}
              onBlur={commitPageJump}
              onKeyDown={(event) => event.key === "Enter" && commitPageJump()}
              className="w-10 rounded border border-white/10 bg-black/20 px-1 py-0.5 text-center text-white outline-none focus:border-white/25"
            />
            of {totalPages}
          </span>

          <button
            disabled={loading || page + 1 >= (data?.totalPages || 0)}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </footer>
      </section>
    </div>
  );
}