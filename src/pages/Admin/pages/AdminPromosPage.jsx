import { RefreshCw, Zap, ZapOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteAdminPromo, getAdminPlans, getAdminPromos } from "../../../services/adminService";
import { PromosPanel } from "../components/CommercePanels";
import EditorModal from "../components/EditorModal";
import { requestError } from "../components/AdminUi";

const AUTO_REFRESH_MS = 20000;

function formatRelativeTime(timestamp, now) {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 3) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [editor, setEditor] = useState(null);

  // Only the very first fetch shows the full skeleton — every load after
  // that (refresh button, auto-refresh, post-save, post-delete) updates
  // the grid silently so it never flashes back to empty.
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    const showSkeleton = !silent && !hasLoadedOnce.current;
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);

    try {
      const [promoData, planData] = await Promise.all([getAdminPromos(), getAdminPlans()]);
      setPromos(promoData);
      setPlans(planData);
      setLastSynced(Date.now());
    } catch (error) {
      toast.error(requestError(error, "Could not load promo campaigns"));
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Optional live sync — keeps claim counts / expiry status current without
  // anyone needing to hit refresh.
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load]);

  // Ticks the "synced Xs ago" label once a second.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Removes the promo from view immediately instead of waiting on a full
  // reload, then reconciles with the server in the background. Rolls back
  // cleanly if the delete actually fails.
  async function remove(promo) {
    if (!window.confirm(`Delete promo ${promo.code}?`)) return;
    const previous = promos;
    setPromos((current) => current.filter((item) => item.id !== promo.id));
    try {
      await deleteAdminPromo(promo.id);
      toast.success("Promo deleted");
      load({ silent: true });
    } catch (error) {
      setPromos(previous);
      toast.error(requestError(error, "Could not delete promo"));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
          {autoRefresh && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          )}
          synced {formatRelativeTime(lastSynced, now)}
        </span>

        <button
          onClick={() => setAutoRefresh((value) => !value)}
          title={autoRefresh ? "Turn off live updates" : "Turn on live updates"}
          className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors duration-150 ${
            autoRefresh
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {autoRefresh ? <Zap size={13} /> : <ZapOff size={13} />}
          {autoRefresh ? "Live" : "Live off"}
        </button>

        <button
          onClick={() => load({ silent: true })}
          title="Refresh"
          className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <PromosPanel
        promos={promos}
        loading={loading}
        onEdit={(item) => setEditor({ type: "promo", item })}
        onDelete={remove}
      />

      {editor && (
        <EditorModal
          editor={editor}
          plans={plans}
          onClose={() => setEditor(null)}
          onSaved={() => load({ silent: true })}
        />
      )}
    </div>
  );
}