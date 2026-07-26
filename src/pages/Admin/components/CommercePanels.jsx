import { Check, Copy, CreditCard, Gift, Pencil, Plus, Tag, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyState, formatDateTime, formatNumber, SectionHeader } from "./AdminUi";

const SKELETON_CARDS = 6;

// Fades + lifts the grid in once, staggered per card, instead of items
// just appearing. Re-triggers whenever the list length changes (new data).
function useStaggeredMount(dependencyLength) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [dependencyLength]);
  return mounted;
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

function SkeletonCard() {
  return (
    <article className="admin-commerce-card">
      <div className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
      <span className="mt-3 block h-4 w-14 animate-pulse rounded-full bg-white/10" />
      <span className="mt-3 block h-4 w-24 animate-pulse rounded bg-white/10" />
      <span className="mt-2 block h-6 w-20 animate-pulse rounded bg-white/10" />
      <span className="mt-2 block h-3 w-28 animate-pulse rounded bg-white/5" />
      <span className="mt-1 block h-3 w-32 animate-pulse rounded bg-white/5" />
    </article>
  );
}

function cardMountStyle(mounted, index) {
  return {
    transitionDelay: mounted ? `${Math.min(index, 10) * 40}ms` : "0ms",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(6px)",
  };
}

export function PlansPanel({ plans, loading, onEdit, onDelete }) {
  const mounted = useStaggeredMount(plans?.length);

  return <div className="admin-section-stack">
    <SectionHeader title="Subscription plans" description="Create, update or retire plans visible in recharge and pricing surfaces." action={<button className="admin-primary-btn" onClick={() => onEdit(null)}><Plus size={16} />New plan</button>} />
    <section className="admin-commerce-grid">
      {loading
        ? Array.from({ length: SKELETON_CARDS }).map((_, index) => <SkeletonCard key={index} />)
        : plans.map((plan, index) => <article
            className="admin-commerce-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)]"
            style={cardMountStyle(mounted, index)}
            key={plan.id}
          >
            <div className="admin-commerce-icon"><Zap size={18} /></div>
            <span className={`admin-state-pill ${plan.active === false ? "inactive" : "active"} inline-flex items-center gap-1.5`}>
              {plan.active !== false && <LiveDot />}
              {plan.active === false ? "Inactive" : "Live"}
            </span>
            <h3>{plan.name}</h3>
            <strong>₹{formatNumber(plan.price)}</strong>
            <p>{formatNumber(plan.tokens)} AI tokens</p>
            <small>{plan.description || "No description"}</small>
            <footer>
              <button title="Edit plan" onClick={() => onEdit(plan)} className="transition-colors duration-150"><Pencil size={15} /></button>
              <button className="danger transition-colors duration-150" title="Delete plan" onClick={() => onDelete(plan)}><Trash2 size={15} /></button>
            </footer>
          </article>)}
      {!loading && !plans.length && <EmptyState icon={CreditCard} label="No plans configured" />}
    </section>
  </div>;
}

export function PromosPanel({ promos, loading, onEdit, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);
  const mounted = useStaggeredMount(promos?.length);

  const copy = (promo) => {
    navigator.clipboard.writeText(promo.code).then(() => {
      toast.success("Code copied");
      setCopiedId(promo.id);
      window.setTimeout(() => setCopiedId((current) => (current === promo.id ? null : current)), 1200);
    });
  };

  return <div className="admin-section-stack">
    <SectionHeader title="Promo campaigns" description="Publish time-bound offers shown to signed-in users in recharge." action={<button className="admin-primary-btn" onClick={() => onEdit(null)}><Plus size={16} />New promo</button>} />
    <section className="admin-commerce-grid">
      {loading
        ? Array.from({ length: SKELETON_CARDS }).map((_, index) => <SkeletonCard key={index} />)
        : promos.map((promo, index) => {
            const status = promo.currentlyAvailable ? "Live" : promo.active ? "Scheduled" : "Disabled";
            return <article
              className="admin-commerce-card admin-promo-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)]"
              style={cardMountStyle(mounted, index)}
              key={promo.id}
            >
              <div className="admin-commerce-icon"><Gift size={18} /></div>
              <span className={`admin-state-pill ${promo.currentlyAvailable ? "active" : "inactive"} inline-flex items-center gap-1.5`}>
                {promo.currentlyAvailable && <LiveDot />}
                {status}
              </span>
              <button className="admin-code transition-colors duration-150" onClick={() => copy(promo)} title="Copy promo code">
                <span>{promo.code}</span>
                {copiedId === promo.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <h3>{promo.title}</h3>
              <p>{promo.rewardType === "FREE_PLAN" ? "Free plan reward" : promo.rewardType === "BONUS_TOKENS" ? `${formatNumber(promo.bonusTokens)} free tokens` : `${promo.discountPercent}% discount${promo.bonusTokens ? ` + ${formatNumber(promo.bonusTokens)} tokens` : ""}`}</p>
              <small>{String(promo.audience || "ALL_USERS").replaceAll("_", " ")} · {formatNumber(promo.totalClaims)} claimed{promo.maxTotalClaims ? ` / ${formatNumber(promo.maxTotalClaims)}` : ""}</small>
              <small>{promo.expiresAt ? `Ends ${formatDateTime(promo.expiresAt)}` : "No expiry"}</small>
              <footer>
                <button title="Edit promo" onClick={() => onEdit(promo)} className="transition-colors duration-150"><Pencil size={15} /></button>
                <button className="danger transition-colors duration-150" title="Delete promo" onClick={() => onDelete(promo)}><Trash2 size={15} /></button>
              </footer>
            </article>;
          })}
      {!loading && !promos.length && <EmptyState icon={Tag} label="No promo campaigns" />}
    </section>
  </div>;
}