import { Ban, CheckCircle2, Loader2, Mail, RefreshCw, Send, Shield, ShieldOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { sendAdminMessage } from "../../../services/adminService";
import { formatNumber, formatTime, RequestTable, requestError } from "./AdminUi";

const MESSAGE_LIMIT = 4000;
const SUBJECT_LIMIT = 120;
const CLOSE_ANIMATION_MS = 200;

// Same deterministic-color approach as the users table, kept local so this
// file doesn't depend on another panel's internals.
const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-purple-500",
];

function stringHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function UserAvatar({ account, size = 48 }) {
  const [failed, setFailed] = useState(false);
  const key = account.email || account.name || "user";
  const initial = (account.name || account.email || "U").slice(0, 1).toUpperCase();
  const gradient = AVATAR_GRADIENTS[stringHash(key) % AVATAR_GRADIENTS.length];
  const dimension = { width: size, height: size, minWidth: size };

  if (account.profileImage && !failed) {
    return (
      <img
        src={account.profileImage}
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
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} text-lg font-semibold text-white ring-1 ring-white/10`}
    >
      {initial}
    </span>
  );
}

function DrawerSkeleton() {
  return (
    <div className="admin-drawer-content">
      <section className="admin-drawer-stats">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <span className="inline-block h-2.5 w-14 animate-pulse rounded bg-white/10" />
            <strong className="mt-1.5 block h-5 w-16 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </section>

      <section className="admin-drawer-section">
        <div className="admin-drawer-title">
          <div>
            <h3>Request history</h3>
            <p>URLs hit during the retained window</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="h-8 w-full animate-pulse rounded bg-white/5"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function UserDrawer({ activity, loading, onClose, onAction, onRefresh }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionKey, setActionKey] = useState(null); // tracks which action button is busy
  const [closing, setClosing] = useState(false);
  const subjectRef = useRef(null);
  const account = activity?.user;

  // Lock background scroll while the drawer is open, restore focus target on mount
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Play the close animation before actually unmounting, instead of cutting instantly.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_ANIMATION_MS);
  };

  // Close on Escape for fast keyboard-driven workflows
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  const submit = async (event) => {
    event.preventDefault();
    if (!account || sending) return;
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    if (!trimmedSubject || !trimmedMessage) {
      toast.error("Add a subject and message before sending");
      return;
    }
    setSending(true);
    try {
      await sendAdminMessage(account.id, { subject: trimmedSubject, message: trimmedMessage });
      toast.success("Message queued for delivery");
      setSubject("");
      setMessage("");
      subjectRef.current?.focus();
    } catch (error) {
      toast.error(requestError(error, "Message could not be sent"));
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAction = async (nextAction) => {
    if (actionKey) return;
    setActionKey(nextAction);
    try {
      await onAction?.(account, nextAction);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button
        className="admin-drawer-backdrop"
        style={{ transition: `opacity ${CLOSE_ANIMATION_MS}ms ease`, opacity: closing ? 0 : 1 }}
        onClick={requestClose}
        aria-label="Close user details"
      />

      <aside
        className="admin-user-drawer admin-drawer-enter"
        style={{
          transition: `opacity ${CLOSE_ANIMATION_MS}ms ease, transform ${CLOSE_ANIMATION_MS}ms ease`,
          opacity: closing ? 0 : 1,
          transform: closing ? "translateX(16px)" : "translateX(0)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={account?.name ? `${account.name} activity` : "User activity"}
      >
        <header>
          <div className="flex items-center gap-3">
            {account && <UserAvatar account={account} />}
            <div>
              <span>User activity</span>
              {account ? (
                <>
                  <h2>{account.name}</h2>
                  <p>{account.email}</p>
                </>
              ) : (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  <span className="block h-4 w-36 animate-pulse rounded bg-white/10" />
                  <span className="block h-3 w-44 animate-pulse rounded bg-white/5" />
                </div>
              )}
            </div>
          </div>
          <button title="Close" onClick={requestClose} className="admin-icon-btn">
            <X size={18} />
          </button>
        </header>

        {loading || !account ? (
          <DrawerSkeleton />
        ) : (
          <div className="admin-drawer-content">
            <section className="admin-drawer-stats">
              <div><span>Requests</span><strong>{formatNumber(activity.requestCount)}</strong></div>
              <div><span>Errors</span><strong>{formatNumber(activity.errorCount)}</strong></div>
              <div><span>Average</span><strong>{activity.averageLatencyMs} ms</strong></div>
              <div><span>Last seen</span><strong>{activity.lastSeenAt ? formatTime(activity.lastSeenAt) : "-"}</strong></div>
            </section>

            <section className="admin-drawer-section">
              <div className="admin-drawer-title">
                <div>
                  <h3>Request history</h3>
                  <p>URLs hit during the retained window</p>
                </div>
                <button
                  title="Refresh activity"
                  onClick={handleRefresh}
                  className="admin-icon-btn"
                  disabled={refreshing}
                >
                  <RefreshCw size={15} className={refreshing ? "admin-spin" : ""} />
                </button>
              </div>
              <div className={`transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
                <RequestTable requests={activity.requests} />
              </div>
            </section>

            <form className="admin-message-form" onSubmit={submit}>
              <div className="admin-drawer-title">
                <div>
                  <h3>Message user</h3>
                  <p>Delivered to the registered email address</p>
                </div>
                <Mail size={16} />
              </div>

              <input
                ref={subjectRef}
                required
                maxLength={SUBJECT_LIMIT}
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
              />

              <div className="admin-textarea-wrap">
                <textarea
                  required
                  maxLength={MESSAGE_LIMIT}
                  rows="5"
                  placeholder="Write a clear support message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                />
                <span className="admin-char-count">{message.length}/{MESSAGE_LIMIT}</span>
              </div>

              <button
                className="admin-primary-btn"
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? <Loader2 className="admin-spin" size={15} /> : <Send size={15} />}
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>

            {account.role !== "ROLE_ADMIN" && (
              <section className="admin-drawer-actions">
                <button
                  onClick={() => handleAction(account.enabled ? "disable" : "enable")}
                  disabled={actionKey !== null}
                >
                  {actionKey === "disable" || actionKey === "enable" ? (
                    <Loader2 className="admin-spin" size={15} />
                  ) : account.enabled ? (
                    <ShieldOff size={15} />
                  ) : (
                    <Shield size={15} />
                  )}
                  {account.enabled ? "Disable" : "Enable"}
                </button>

                <button
                  onClick={() => handleAction(account.blocked ? "unblock" : "block")}
                  disabled={actionKey !== null}
                >
                  {actionKey === "block" || actionKey === "unblock" ? (
                    <Loader2 className="admin-spin" size={15} />
                  ) : account.blocked ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Ban size={15} />
                  )}
                  {account.blocked ? "Unblock" : "Block"}
                </button>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}