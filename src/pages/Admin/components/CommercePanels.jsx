import {
  CalendarClock,
  Check,
  Copy,
  CreditCard,
  Gift,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  UsersRound,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { EmptyState, formatDateTime, formatNumber, SectionHeader } from "./AdminUi";

const SKELETON_CARDS = 6;

function useStaggeredMount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}

function LiveDot() {
  return <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>;
}

function formatRelativeTime(timestamp, now) {
  if (!timestamp) return "not synced";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

export function CommerceSyncStatus({ timestamp, live }) {
  const [now, setNow] = useState(() => timestamp || 0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);
  return <span className="admin-commerce-sync">
    {live && <LiveDot />}
    synced {formatRelativeTime(timestamp, now)}
  </span>;
}

function SkeletonCard() {
  return <article className="admin-commerce-card admin-commerce-skeleton">
    <div className="h-9 w-9 animate-pulse rounded-md bg-white/10" />
    <span className="mt-4 block h-4 w-24 animate-pulse rounded bg-white/10" />
    <span className="mt-3 block h-7 w-28 animate-pulse rounded bg-white/10" />
    <span className="mt-3 block h-3 w-full animate-pulse rounded bg-white/5" />
    <span className="mt-2 block h-3 w-3/4 animate-pulse rounded bg-white/5" />
  </article>;
}

function cardMountStyle(mounted, index) {
  return {
    transitionDelay: mounted ? `${Math.min(index, 10) * 32}ms` : "0ms",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(5px)",
  };
}

function SummaryItem({ label, value, tone = "cyan" }) {
  return <div className={`admin-commerce-stat ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function SearchBar({ value, onChange, placeholder }) {
  return <label className="admin-commerce-search"><Search size={15} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>;
}

export function PlansPanel({ plans, loading, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const mounted = useStaggeredMount();
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return plans;
    return plans.filter((plan) => `${plan.name} ${plan.description}`.toLowerCase().includes(needle));
  }, [plans, query]);
  const livePlans = plans.filter((plan) => plan.active !== false).length;
  const totalCredits = plans.reduce((total, plan) => total + Number(plan.tokens || 0), 0);
  const prices = plans.map((plan) => Number(plan.price || 0)).filter(Number.isFinite);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;

  return <div className="admin-section-stack">
    <SectionHeader title="Subscription plans" description="Manage pricing and AI credits visible across checkout and recharge." action={<button className="admin-primary-btn" onClick={() => onEdit(null)}><Plus size={16} />New plan</button>} />
    {!loading && <section className="admin-commerce-summary" aria-label="Plan summary">
      <SummaryItem label="Total plans" value={formatNumber(plans.length)} />
      <SummaryItem label="Live plans" value={formatNumber(livePlans)} tone="green" />
      <SummaryItem label="Credits configured" value={formatNumber(totalCredits)} tone="violet" />
      <SummaryItem label="Starts from" value={`INR ${formatNumber(lowestPrice)}`} tone="amber" />
    </section>}
    <div className="admin-commerce-tools"><SearchBar value={query} onChange={setQuery} placeholder="Search plans" /><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
    <section className="admin-commerce-grid">
      {loading
        ? Array.from({ length: SKELETON_CARDS }).map((_, index) => <SkeletonCard key={index} />)
        : filtered.map((plan, index) => <article className="admin-commerce-card" style={cardMountStyle(mounted, index)} key={plan.id}>
          <div className="admin-commerce-icon"><Zap size={18} /></div>
          <span className={`admin-state-pill ${plan.active === false ? "inactive" : "active"}`}>{plan.active !== false && <LiveDot />}{plan.active === false ? "Inactive" : "Live"}</span>
          <h3>{plan.name}</h3>
          <strong>INR {formatNumber(plan.price)}</strong>
          <p>{formatNumber(plan.tokens)} AI credits</p>
          <small>{plan.description || "No description provided"}</small>
          <footer><button title="Edit plan" onClick={() => onEdit(plan)}><Pencil size={15} /></button><button className="danger" title="Delete plan" onClick={() => onDelete(plan)}><Trash2 size={15} /></button></footer>
        </article>)}
      {!loading && !filtered.length && <EmptyState icon={CreditCard} label={query ? "No matching plans" : "No plans configured"} />}
    </section>
  </div>;
}

function promoStatus(promo) {
  const now = Date.now();
  if (!promo.active) return { label: "Disabled", className: "inactive" };
  if (promo.currentlyAvailable) return { label: "Live", className: "active" };
  if (promo.validFrom && new Date(promo.validFrom).getTime() > now) return { label: "Scheduled", className: "scheduled" };
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() <= now) return { label: "Expired", className: "expired" };
  return { label: "Unavailable", className: "inactive" };
}

export function PromosPanel({ promos, loading, onEdit, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);
  const [query, setQuery] = useState("");
  const mounted = useStaggeredMount();
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return promos;
    return promos.filter((promo) => `${promo.code} ${promo.title} ${promo.description} ${promo.audience}`.toLowerCase().includes(needle));
  }, [promos, query]);
  const statuses = promos.map(promoStatus);
  const liveCount = statuses.filter((status) => status.label === "Live").length;
  const scheduledCount = statuses.filter((status) => status.label === "Scheduled").length;
  const totalClaims = promos.reduce((total, promo) => total + Number(promo.totalClaims || 0), 0);

  const copy = async (promo) => {
    await navigator.clipboard.writeText(promo.code);
    toast.success("Code copied");
    setCopiedId(promo.id);
    window.setTimeout(() => setCopiedId((current) => (current === promo.id ? null : current)), 1200);
  };

  return <div className="admin-section-stack">
    <SectionHeader title="Promo campaigns" description="Schedule targeted rewards with claim limits and live availability." action={<button className="admin-primary-btn" onClick={() => onEdit(null)}><Plus size={16} />New promo</button>} />
    {!loading && <section className="admin-commerce-summary" aria-label="Promo summary">
      <SummaryItem label="Campaigns" value={formatNumber(promos.length)} />
      <SummaryItem label="Live now" value={formatNumber(liveCount)} tone="green" />
      <SummaryItem label="Scheduled" value={formatNumber(scheduledCount)} tone="amber" />
      <SummaryItem label="Total claims" value={formatNumber(totalClaims)} tone="violet" />
    </section>}
    <div className="admin-commerce-tools"><SearchBar value={query} onChange={setQuery} placeholder="Search code, title or audience" /><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
    <section className="admin-commerce-grid">
      {loading
        ? Array.from({ length: SKELETON_CARDS }).map((_, index) => <SkeletonCard key={index} />)
        : filtered.map((promo, index) => {
          const status = promoStatus(promo);
          return <article className="admin-commerce-card admin-promo-card" style={cardMountStyle(mounted, index)} key={promo.id}>
            <div className="admin-commerce-icon"><Gift size={18} /></div>
            <span className={`admin-state-pill ${status.className}`}>{status.label === "Live" && <LiveDot />}{status.label}</span>
            <button className="admin-code" onClick={() => copy(promo)} title="Copy promo code"><span>{promo.code}</span>{copiedId === promo.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}</button>
            <h3>{promo.title}</h3>
            <p>{promo.rewardType === "FREE_PLAN" ? "Free plan reward" : promo.rewardType === "BONUS_TOKENS" ? `${formatNumber(promo.bonusTokens)} free credits` : `${promo.discountPercent}% discount${promo.bonusTokens ? ` + ${formatNumber(promo.bonusTokens)} credits` : ""}`}</p>
            <div className="admin-promo-meta"><span><UsersRound size={12} />{String(promo.audience || "ALL_USERS").replaceAll("_", " ")}</span><span><Gift size={12} />{formatNumber(promo.totalClaims)} claimed{promo.maxTotalClaims ? ` / ${formatNumber(promo.maxTotalClaims)}` : ""}</span><span><CalendarClock size={12} />{promo.expiresAt ? `Ends ${formatDateTime(promo.expiresAt)}` : "No expiry"}</span></div>
            <footer><button title="Edit promo" onClick={() => onEdit(promo)}><Pencil size={15} /></button><button className="danger" title="Delete promo" onClick={() => onDelete(promo)}><Trash2 size={15} /></button></footer>
          </article>;
        })}
      {!loading && !filtered.length && <EmptyState icon={Tag} label={query ? "No matching campaigns" : "No promo campaigns"} />}
    </section>
  </div>;
}