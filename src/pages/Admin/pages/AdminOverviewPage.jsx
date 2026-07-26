import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getAdminOverview } from "../../../services/adminService";
import { LoadingState, requestError } from "../components/AdminUi";
import { OverviewPanel } from "../components/MonitoringPanels";

const POLL_INTERVAL_MS = 30_000;

function formatRelativeTime(timestamp, now) {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 3) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setOverview(await getAdminOverview());
      setError("");
      setLastUpdated(Date.now());
    } catch (request) {
      setError(requestError(request, "Monitoring data is temporarily unavailable"));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(load, 0);
    const polling = window.setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(polling);
    };
  }, [load]);

  // Ticks the "updated Xs ago" label once a second — purely cosmetic, no fetch.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // "r" refreshes from anywhere on the page, same shortcut as the other admin views.
  useEffect(() => {
    const handler = (event) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (event.key.toLowerCase() === "r" && !isTyping) {
        event.preventDefault();
        load();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [load]);

  if (loading && !overview) return <LoadingState label="Loading operations data" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Operations overview</h1>
          <p className="text-xs text-slate-500">Health and traffic refresh every 30 seconds.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-slate-500 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            updated {formatRelativeTime(lastUpdated, now)}
          </span>

          <button
            onClick={() => load()}
            title="Refresh (r)"
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          error ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
            <span>{error}</span>
            <button
              onClick={() => load()}
              className="shrink-0 rounded border border-rose-400/30 px-2 py-1 text-xs font-medium text-rose-100 transition-colors duration-150 hover:bg-rose-400/20"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {overview && (
        <div className={`transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}>
          <OverviewPanel overview={overview} />
        </div>
      )}
    </div>
  );
}