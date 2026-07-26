import { Activity, Check, Clock3, Copy, Cpu, Users } from "lucide-react";
import { useEffect, useState } from "react";

export const formatNumber = (value = 0) => new Intl.NumberFormat("en-IN").format(value);
export const formatDateTime = (value) => value
  ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  : "Not available";
export const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  : "-";

export function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

export function formatUptime(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return days ? `${days}d ${hours}h` : `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function requestError(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function statusTone(status) {
  if (status >= 500) return "danger";
  if (status >= 400) return "warn";
  if (status >= 300) return "info";
  return "success";
}

// ---------------------------------------------------------------------------
// Avatar — shared across admin panels so a user's photo (or a deterministic
// colored-initial fallback when there's no photo / it fails to load) always
// looks the same wherever they appear: user directory, drawer, request logs.
// ---------------------------------------------------------------------------
const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-purple-500",
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function Avatar({ name, email, image, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const key = email || name || "user";
  const initial = (name || email || "U").trim().slice(0, 1).toUpperCase();
  const gradient = AVATAR_GRADIENTS[hashString(key) % AVATAR_GRADIENTS.length];
  const dimension = { width: size, height: size, minWidth: size };

  if (image && !failed) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={dimension}
        className="shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }

  return (
    <span
      style={dimension}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white ring-1 ring-white/10`}
    >
      {initial}
    </span>
  );
}

export function MetricCard({ icon: Icon, label, value, hint, tone = "cyan" }) {
  return (
    <article className={`admin-metric admin-tone-${tone} transition-transform duration-200 hover:-translate-y-0.5`}>
      <span className="admin-metric-icon"><Icon size={18} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
    </article>
  );
}

export function EmptyState({ icon: Icon = Activity, label }) {
  return <div className="admin-empty"><Icon size={20} /><span>{label}</span></div>;
}

// Fades in instead of popping into view, so it reads as a transition rather
// than a flash — same label API as before, nothing else changes.
export function LoadingState({ label = "Loading" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="admin-page-loading compact"
      style={{ transition: "opacity 200ms ease", opacity: visible ? 1 : 0 }}
    >
      <span className="admin-css-spinner" />
      <span>{label}</span>
    </div>
  );
}

export function SectionHeader({ title, description, action }) {
  return <div className="admin-section-heading"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

export function MetricList({ title, items = [], color = "cyan" }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <section className="admin-panel admin-ranked-panel">
    <header><h3>{title}</h3></header>
    {items.length ? <div className="admin-ranked-list">{items.map((item) => <div className="admin-ranked-row" key={item.name}>
      <div><span title={item.name}>{item.name}</span><strong>{formatNumber(item.value)}</strong></div>
      <div className="admin-rank-track">
        <span
          className={`admin-rank-fill ${color} transition-all duration-700 ease-out`}
          style={{ width: `${item.value * 100 / max}%` }}
        />
      </div>
    </div>)}</div> : <EmptyState label="No activity in this window" />}
  </section>;
}

export function RequestTable({ requests = [], detailed = false }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyIp = (value, key) => {
    if (!value || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1200);
      })
      .catch(() => {});
  };

  return <div className="admin-table-scroll"><table className="admin-request-table">
    <thead className="sticky top-0 z-10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50">
      <tr><th>Time</th><th>Method</th><th>Route</th><th>Status</th><th>Latency</th>{detailed && <><th>User</th><th>IP address</th><th>Outcome</th><th>Response</th><th>Location</th><th>Client</th></>}</tr>
    </thead>
    <tbody>{requests.map((request, index) => {
      const rowKey = `${request.timestamp}-${request.path}-${index}`;
      const ip = request.clientIp || request.maskedIp;
      return <tr key={rowKey} className="transition-colors duration-150 hover:bg-white/[0.03]">
        <td>{formatTime(request.timestamp)}</td><td><span className="admin-method">{request.method}</span></td>
        <td className="admin-route-cell" title={request.path}>{request.path}</td>
        <td><span className={`admin-status ${statusTone(request.status)}`}>{request.status}</span></td>
        <td className={request.durationMs > 750 ? "admin-latency-hot" : ""}>{request.durationMs} ms</td>
        {detailed && <>
          <td title={request.userEmail || request.user}>
            <span className="flex items-center gap-2">
              <Avatar
                name={request.userName}
                email={request.userEmail || request.user}
                image={request.userAvatar || request.profileImage}
                size={22}
              />
              <span className="truncate">{request.userEmail || request.user || "Anonymous"}</span>
            </span>
          </td>
          <td><button type="button" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-cyan-300 transition-colors duration-150 hover:text-cyan-200" onClick={() => copyIp(ip, rowKey)} title="Copy full IP"><span>{ip}</span>{copiedKey === rowKey ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}</button></td>
          <td>{request.responseSummary || "Completed"}</td>
          <td><span className="block max-w-40 truncate" title={request.contentType}>{request.contentType || "Unknown"}</span><small className="text-slate-500">{request.responseBytes ? formatBytes(request.responseBytes) : "Size unavailable"}</small></td>
          <td>{request.location || request.country}</td>
          <td className="admin-client-cell" title={request.userAgent}>{request.userAgent || "Unknown"}</td>
        </>}
      </tr>;
    })}</tbody>
  </table>{!requests.length && <EmptyState label="No requests captured in this window" />}</div>;
}

export const KPI_ICONS = { users: Users, requests: Activity, latency: Clock3, cpu: Cpu };