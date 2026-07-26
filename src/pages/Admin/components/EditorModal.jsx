import { CalendarClock, Check, Gift, Loader2, Tag, UsersRound, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { saveAdminPlan, saveAdminPromo } from "../../../services/adminService";
import { requestError } from "./AdminUi";

const EMPTY_PLAN = { name: "", price: 0, tokens: 0, description: "" };
const EMPTY_PROMO = {
  code: "", title: "", description: "", discountPercent: 10, bonusTokens: 0,
  rewardType: "DISCOUNT", audience: "ALL_USERS", rewardPlanId: "", maxTotalClaims: 0,
  targetUserEmails: "", active: true, validFrom: "", expiresAt: "",
};

function toLocalInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function scheduleLabel(startValue, endValue) {
  if (!startValue && !endValue) return "Starts immediately and stays active until disabled.";
  const formatter = new Intl.DateTimeFormat([], { dateStyle: "medium", timeStyle: "short" });
  const starts = startValue ? formatter.format(new Date(startValue)) : "immediately";
  const ends = endValue ? formatter.format(new Date(endValue)) : "manually disabled";
  return `Runs from ${starts} until ${ends}.`;
}

export default function EditorModal({ editor, plans = [], onClose, onSaved }) {
  const isPlan = editor.type === "plan";
  const [form, setForm] = useState(() => isPlan ? { ...EMPTY_PLAN, ...editor.item } : {
    ...EMPTY_PROMO, ...editor.item,
    targetUserEmails: (editor.item?.targetUserEmails || []).join(", "),
    validFrom: editor.item?.validFrom?.slice(0, 16) || "",
    expiresAt: editor.item?.expiresAt?.slice(0, 16) || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const scheduleSummary = useMemo(
    () => scheduleLabel(form.validFrom, form.expiresAt),
    [form.expiresAt, form.validFrom],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, saving]);

  const submit = async (event) => {
    event.preventDefault();
    if (!isPlan && form.validFrom && form.expiresAt && new Date(form.expiresAt) <= new Date(form.validFrom)) {
      toast.error("Expiry time must be later than the start time");
      return;
    }
    setSaving(true);
    try {
      const payload = isPlan ? {
        name: form.name.trim(), price: Number(form.price), tokens: Number(form.tokens), description: form.description?.trim() || "",
      } : {
        code: form.code.trim(), title: form.title.trim(), description: form.description?.trim() || "",
        rewardType: form.rewardType, audience: form.audience,
        discountPercent: form.rewardType === "DISCOUNT" ? Number(form.discountPercent) : 0,
        bonusTokens: form.rewardType === "FREE_PLAN" ? 0 : Number(form.bonusTokens),
        rewardPlanId: form.rewardType === "FREE_PLAN" ? form.rewardPlanId : null,
        maxTotalClaims: Number(form.maxTotalClaims || 0),
        targetUserEmails: form.audience === "SPECIFIC_USERS"
          ? form.targetUserEmails.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean)
          : [],
        active: Boolean(form.active), validFrom: form.validFrom || null, expiresAt: form.expiresAt || null,
      };
      if (isPlan) await saveAdminPlan(editor.item?.id, payload);
      else await saveAdminPromo(editor.item?.id, payload);
      toast.success(`${isPlan ? "Plan" : "Promo"} saved`);
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(requestError(error, "Could not save changes"));
    } finally {
      setSaving(false);
    }
  };

  return <div className="admin-modal-layer">
    <button className="admin-modal-backdrop" onClick={onClose} aria-label="Close editor" />
    <form className="admin-editor" onSubmit={submit}>
      <header>
        <div className="admin-editor-heading">
          <span>{isPlan ? <Zap size={18} /> : <Tag size={18} />}</span>
          <div>
            <h2>{editor.item ? "Edit" : "Create"} {isPlan ? "plan" : "reward campaign"}</h2>
            <p>Eligibility and rewards are verified by the backend.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} title="Close" disabled={saving}><X size={18} /></button>
      </header>
      <fieldset disabled={saving} className="admin-editor-body">
        {isPlan
          ? <PlanFields form={form} set={set} />
          : <PromoFields form={form} set={set} plans={plans} scheduleSummary={scheduleSummary} />}
      </fieldset>
      <footer>
        <button type="button" className="admin-secondary-btn" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="admin-primary-btn" disabled={saving}>
          {saving ? <Loader2 className="admin-spin" size={15} /> : <Check size={15} />}
          {saving ? "Saving..." : `Save ${isPlan ? "plan" : "campaign"}`}
        </button>
      </footer>
    </form>
  </div>;
}

function PlanFields({ form, set }) {
  return <>
    <PromoSection icon={Gift} title="Plan details">
      <label><span>Plan name</span><input required maxLength={80} placeholder="Professional" value={form.name} onChange={(event) => set("name", event.target.value)} /></label>
      <div className="admin-form-grid">
        <label><span>Price (INR)</span><input required min="0" step="1" type="number" value={form.price} onChange={(event) => set("price", event.target.value)} /></label>
        <label><span>AI credits</span><input required min="0" step="1" type="number" value={form.tokens} onChange={(event) => set("tokens", event.target.value)} /></label>
      </div>
      <label><span>Description</span><textarea maxLength={500} rows="4" placeholder="What customers receive with this plan" value={form.description || ""} onChange={(event) => set("description", event.target.value)} /></label>
    </PromoSection>
    <div className="admin-plan-preview">
      <span>Customer preview</span>
      <strong>{form.name || "Plan name"}</strong>
      <p>INR {Number(form.price || 0).toLocaleString()} - {Number(form.tokens || 0).toLocaleString()} AI credits</p>
    </div>
  </>;
}

function PromoFields({ form, set, plans, scheduleSummary }) {
  const applyPreset = (hours) => {
    const starts = new Date();
    starts.setSeconds(0, 0);
    const expires = new Date(starts.getTime() + hours * 60 * 60 * 1000);
    set("validFrom", toLocalInput(starts));
    set("expiresAt", toLocalInput(expires));
  };

  const targetCount = form.targetUserEmails
    ? form.targetUserEmails.split(/[\s,;]+/).filter(Boolean).length
    : 0;

  return <>
    <PromoSection icon={Tag} title="Campaign details">
      <div className="admin-form-grid">
        <label><span>Promo code</span><input required maxLength={32} placeholder="WELCOME25" value={form.code} onChange={(event) => set("code", event.target.value.toUpperCase().replace(/\s+/g, ""))} /></label>
        <label><span>Campaign title</span><input required maxLength={80} placeholder="New user welcome reward" value={form.title} onChange={(event) => set("title", event.target.value)} /></label>
      </div>
      <label><span>Description shown to users</span><textarea maxLength={300} rows="3" placeholder="Explain the reward in one clear sentence" value={form.description || ""} onChange={(event) => set("description", event.target.value)} /></label>
    </PromoSection>

    <PromoSection icon={Gift} title="Reward rules">
      <div className="admin-form-grid">
        <label><span>Reward type</span><select value={form.rewardType} onChange={(event) => set("rewardType", event.target.value)}><option value="DISCOUNT">Checkout discount</option><option value="BONUS_TOKENS">Free credit reward</option><option value="FREE_PLAN">Free plan reward</option></select></label>
        <label><span>Who can claim</span><select value={form.audience} onChange={(event) => set("audience", event.target.value)}><option value="ALL_USERS">All users</option><option value="NEVER_RECHARGED">Never recharged</option><option value="SPECIFIC_USERS">Specific users</option></select></label>
      </div>
      {form.rewardType === "DISCOUNT" && <div className="admin-form-grid"><label><span>Discount %</span><input required min="1" max="90" type="number" value={form.discountPercent} onChange={(event) => set("discountPercent", event.target.value)} /></label><label><span>Bonus credits after payment</span><input min="0" type="number" value={form.bonusTokens} onChange={(event) => set("bonusTokens", event.target.value)} /></label></div>}
      {form.rewardType === "BONUS_TOKENS" && <label><span>Free credits</span><input required min="1" type="number" value={form.bonusTokens} onChange={(event) => set("bonusTokens", event.target.value)} /></label>}
      {form.rewardType === "FREE_PLAN" && <label><span>Plan granted immediately</span><select required value={form.rewardPlanId || ""} onChange={(event) => set("rewardPlanId", event.target.value)}><option value="">Select a plan</option>{plans.filter((plan) => plan.active !== false).map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - {Number(plan.tokens || 0).toLocaleString()} credits</option>)}</select></label>}
    </PromoSection>

    <PromoSection icon={UsersRound} title="Eligibility">
      {form.audience === "SPECIFIC_USERS" && <label><span>Target user emails</span><textarea required rows="3" placeholder="user@example.com, another@example.com" value={form.targetUserEmails} onChange={(event) => set("targetUserEmails", event.target.value)} /><small>{targetCount} recipient{targetCount === 1 ? "" : "s"}. Separate emails with commas, spaces, or new lines.</small></label>}
      <label><span>Maximum total claims</span><input min="0" type="number" value={form.maxTotalClaims} onChange={(event) => set("maxTotalClaims", event.target.value)} /><small>Use 0 for no campaign-wide limit. Each user can claim once.</small></label>
    </PromoSection>

    <PromoSection icon={CalendarClock} title="Schedule and local time">
      <div className="admin-schedule-presets" aria-label="Quick schedule">
        <button type="button" onClick={() => applyPreset(24)}>24 hours</button>
        <button type="button" onClick={() => applyPreset(24 * 7)}>7 days</button>
        <button type="button" onClick={() => applyPreset(24 * 30)}>30 days</button>
        <button type="button" onClick={() => { set("validFrom", ""); set("expiresAt", ""); }}>No expiry</button>
      </div>
      <div className="admin-form-grid">
        <label><span>Starts</span><input type="datetime-local" value={form.validFrom} onChange={(event) => set("validFrom", event.target.value)} /></label>
        <label><span>Expires</span><input type="datetime-local" min={form.validFrom || undefined} value={form.expiresAt} onChange={(event) => set("expiresAt", event.target.value)} /></label>
      </div>
      <div className="admin-schedule-summary"><CalendarClock size={15} /><span>{scheduleSummary}</span><small>{Intl.DateTimeFormat().resolvedOptions().timeZone}</small></div>
      <label className="admin-toggle"><input type="checkbox" checked={form.active} onChange={(event) => set("active", event.target.checked)} /><span><Check size={13} /></span>Campaign enabled</label>
    </PromoSection>
  </>;
}

function PromoSection({ icon: Icon, title, children }) {
  return <section className="admin-promo-section">
    <div className="admin-promo-section-title"><Icon size={16} /><span>{title}</span></div>
    {children}
  </section>;
}