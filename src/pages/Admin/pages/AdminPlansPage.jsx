import { RefreshCw, Zap, ZapOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteAdminPlan, getAdminPlans } from "../../../services/adminService";
import { CommerceSyncStatus, PlansPanel } from "../components/CommercePanels";
import EditorModal from "../components/EditorModal";
import { requestError } from "../components/AdminUi";

const AUTO_REFRESH_MS = 20000;

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [editor, setEditor] = useState(null);

  // Only the very first fetch should show the full skeleton — every load
  // after that (refresh button, auto-refresh, post-save, post-delete)
  // updates the grid silently so it never flashes back to empty.
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    const showSkeleton = !silent && !hasLoadedOnce.current;
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);

    try {
      setPlans(await getAdminPlans());
      setLastSynced(Date.now());
    } catch (error) {
      toast.error(requestError(error, "Could not load plans"));
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

  // Optional live sync — keeps pricing/token values current if another
  // admin session changes something, without anyone needing to hit refresh.
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load]);

  // Removes the plan from view immediately instead of waiting on a full
  // reload, then reconciles with the server in the background. Rolls back
  // cleanly if the delete actually fails.
  async function remove(plan) {
    if (!window.confirm(`Delete plan ${plan.name}?`)) return;
    const previous = plans;
    setPlans((current) => current.filter((item) => item.id !== plan.id));
    try {
      await deleteAdminPlan(plan.id);
      toast.success("Plan deleted");
      load({ silent: true });
    } catch (error) {
      setPlans(previous);
      toast.error(requestError(error, "Could not delete plan"));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        <CommerceSyncStatus timestamp={lastSynced} live={autoRefresh} />

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

      <PlansPanel
        plans={plans}
        loading={loading}
        onEdit={(item) => setEditor({ type: "plan", item })}
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