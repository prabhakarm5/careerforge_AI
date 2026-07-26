import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Search, Shield, ShieldOff, Trash2, Users, X } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, formatNumber, SectionHeader } from "./AdminUi";

const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_ROWS = 8;

// Deterministic per-user color so the same person always gets the same
// fallback avatar, instead of a flat gray circle for everyone.
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

function UserAvatar({ account, size = 42 }) {
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
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white ring-1 ring-white/10`}
    >
      {initial}
    </span>
  );
}

function UserRow({ account, onSelect, onAction, isRowBusy, busyAction }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(account);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    if (window.confirm(`Delete ${account.name || account.email}? This can't be undone.`)) {
      onAction(account, "delete");
    }
  };

  return (
    <tr
      className="admin-clickable-row transition-colors duration-150"
      onClick={() => onSelect(account)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View activity for ${account.name || account.email}`}
    >
      <td data-label="User">
        <div className="admin-user-cell">
          <UserAvatar account={account} />
          <div>
            <strong>{account.name}</strong>
            <small>{account.email}</small>
          </div>
        </div>
      </td>
      <td data-label="Joined">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "-"}</td>
      <td data-label="Role">{account.role.replace("ROLE_", "")}</td>
      <td data-label="Verification">
        {account.emailVerified ? (
          <span className="admin-verified"><CheckCircle2 size={14} />Verified</span>
        ) : (
          "Pending"
        )}
      </td>
      <td data-label="Access">
        <span className={`admin-access ${account.blocked ? "blocked" : account.enabled ? "enabled" : "disabled"}`}>
          {account.blocked ? "Blocked" : account.enabled ? "Enabled" : "Disabled"}
        </span>
      </td>
      <td data-label="Actions" onClick={(event) => event.stopPropagation()}>
        {account.role === "ROLE_ADMIN" ? (
          <span className="admin-protected"><Shield size={14} />Protected</span>
        ) : (
          <div className="admin-row-actions">
            <button
              title={account.enabled ? "Disable user" : "Enable user"}
              onClick={() => onAction(account, account.enabled ? "disable" : "enable")}
              disabled={isRowBusy}
              className="transition-opacity duration-150 disabled:opacity-50"
            >
              {actionMatches(busyAction, account.enabled ? "disable" : "enable") ? (
                <Loader2 className="admin-spin" size={15} />
              ) : account.enabled ? (
                <ShieldOff size={15} />
              ) : (
                <Shield size={15} />
              )}
            </button>
            <button
              title={account.blocked ? "Unblock user" : "Block user"}
              onClick={() => onAction(account, account.blocked ? "unblock" : "block")}
              disabled={isRowBusy}
              className="transition-opacity duration-150 disabled:opacity-50"
            >
              {actionMatches(busyAction, account.blocked ? "unblock" : "block") ? (
                <Loader2 className="admin-spin" size={15} />
              ) : account.blocked ? (
                <CheckCircle2 size={15} />
              ) : (
                <Ban size={15} />
              )}
            </button>
            <button
              className="danger transition-opacity duration-150 disabled:opacity-50"
              title="Delete user"
              onClick={handleDelete}
              disabled={isRowBusy}
            >
              {actionMatches(busyAction, "delete") ? <Loader2 className="admin-spin" size={15} /> : <Trash2 size={15} />}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function actionMatches(busyAction, action) {
  return busyAction === action;
}

function SkeletonRow() {
  return (
    <tr className="admin-clickable-row">
      <td data-label="User">
        <div className="admin-user-cell">
          <span className="h-[42px] w-[42px] shrink-0 animate-pulse rounded-full bg-white/10" />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="h-3 w-32 animate-pulse rounded bg-white/10" />
            <span className="h-2.5 w-40 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </td>
      <td><span className="inline-block h-3 w-20 animate-pulse rounded bg-white/10" /></td>
      <td><span className="inline-block h-3 w-16 animate-pulse rounded bg-white/10" /></td>
      <td><span className="inline-block h-3 w-16 animate-pulse rounded bg-white/10" /></td>
      <td><span className="inline-block h-3 w-16 animate-pulse rounded bg-white/10" /></td>
      <td><span className="inline-block h-3 w-14 animate-pulse rounded bg-white/10" /></td>
    </tr>
  );
}

const MemoUserRow = memo(UserRow);

export default function UsersPanel({ pageData, loading, query, setQuery, page, setPage, onSelect, onAction, actionId }) {
  // Keep typing instant for the user, but only push the search upstream
  // after they pause — avoids firing a request on every keystroke.
  const [localQuery, setLocalQuery] = useState(query || "");
  // Hold on to the last rows we actually rendered so a search/page/refresh
  // in flight never blanks the table — it just dims what's already there.
  const [cachedRows, setCachedRows] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    setLocalQuery(query || "");
  }, [query]);

  useEffect(() => {
    if (localQuery === query) return;
    const timer = setTimeout(() => {
      setQuery(localQuery);
      setPage(0); // a fresh search should land on the first page
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  useEffect(() => {
    if (pageData?.content) setCachedRows(pageData.content);
  }, [pageData]);

  useEffect(() => {
    const handler = (event) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const totalPages = Math.max(1, pageData?.totalPages || 1);
  const isLastPage = pageData?.last !== false;
  const isRefreshing = loading && cachedRows.length > 0;
  const isFirstLoad = loading && cachedRows.length === 0;
  const rows = loading ? cachedRows : pageData?.content || [];

  const busyMap = useMemo(() => {
    if (!actionId) return { id: null, action: null };
    const account = rows.find((row) => actionId.startsWith(String(row.id)));
    if (!account) return { id: null, action: null };
    return { id: account.id, action: actionId.slice(String(account.id).length) };
  }, [actionId, rows]);

  return (
    <div className="admin-section-stack flex h-full min-h-0 flex-col gap-4">
      <SectionHeader title="User directory" description="Search by name or email, inspect activity and manage account access." />

      <section className="admin-panel admin-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="admin-users-header">
          <div className="admin-search">
            <Search size={16} />
            <input
              ref={searchRef}
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Search email or name"
              aria-label="Search users"
            />
            {localQuery && (
              <button onClick={() => setLocalQuery("")} title="Clear search">
                <X size={14} />
              </button>
            )}
            {!localQuery && (
              <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600 sm:block">
                /
              </kbd>
            )}
          </div>
          <span className="flex items-center gap-1.5">
            {formatNumber(pageData?.totalElements || 0)} accounts
            {isRefreshing && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" title="Refreshing" />
            )}
          </span>
        </header>

        <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody
              className={`transition-opacity duration-200 ${isRefreshing ? "opacity-60" : "opacity-100"}`}
            >
              {isFirstLoad
                ? Array.from({ length: SKELETON_ROWS }).map((_, index) => <SkeletonRow key={index} />)
                : rows.map((account) => {
                    const isRowBusy = busyMap.id === account.id;
                    return (
                      <MemoUserRow
                        key={account.id}
                        account={account}
                        onSelect={onSelect}
                        onAction={onAction}
                        isRowBusy={isRowBusy}
                        busyAction={isRowBusy ? busyMap.action : null}
                      />
                    );
                  })}
            </tbody>
          </table>
          {!isFirstLoad && !rows.length && <EmptyState icon={Users} label="No matching users" />}
        </div>

        <footer className="admin-pagination">
          <button
            title="Previous page"
            disabled={loading || page === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            <ChevronLeft size={15} />
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            title="Next page"
            disabled={loading || isLastPage}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </footer>
      </section>
    </div>
  );
}