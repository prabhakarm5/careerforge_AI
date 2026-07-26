import { useEffect, useState } from "react";
import { Check, Clock3, Copy, KeyRound, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import BrandLogo from "../../shared/BrandLogo";
import { revealAdminOtp } from "../../services/adminAuthService";
import "./admin.css";

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function AdminOtpRevealPage() {
  const [params] = useSearchParams();
  const token = params.get("token")?.trim();
  const [state, setState] = useState(() => token
    ? { status: "loading", otp: "", seconds: 0, totalSeconds: 0 }
    : { status: "error", otp: "", seconds: 0, totalSeconds: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    revealAdminOtp(token)
      .then((data) => {
        if (!active) return;
        const seconds = Math.max(0, Number(data.expiresInSeconds || 0));
        setState({ status: "ready", otp: data.otp, seconds, totalSeconds: seconds });
      })
      .catch(() => active && setState({ status: "error", otp: "", seconds: 0, totalSeconds: 0 }));
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (state.status !== "ready") return undefined;
    const timer = window.setInterval(() => {
      setState((current) => current.seconds <= 1
        ? { ...current, status: "expired", otp: "", seconds: 0 }
        : { ...current, seconds: current.seconds - 1 });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.status]);

  const copyOtp = async () => {
    await navigator.clipboard.writeText(state.otp);
    setCopied(true);
    toast.success("OTP copied");
    window.setTimeout(() => setCopied(false), 1500);
  };

  const progress = state.totalSeconds > 0 ? state.seconds / state.totalSeconds : 0;

  return <main className="admin-otp-reveal-shell">
    <section className="admin-otp-reveal-card">
      <header><BrandLogo /><span><ShieldCheck size={14} />Secure admin verification</span></header>

      {state.status === "loading" && <div className="admin-otp-reveal-state" aria-live="polite">
        <div className="admin-otp-reveal-icon"><Loader2 className="admin-spin" /></div>
        <h1>Opening secure code</h1>
        <p>Validating this single-use access link.</p>
      </div>}

      {state.status === "ready" && <div className="admin-otp-reveal-state" aria-live="polite">
        <div className="admin-otp-timer" style={{ "--timer-progress": `${progress * 360}deg` }}>
          <div><Clock3 size={18} /><strong>{formatTime(state.seconds)}</strong><span>remaining</span></div>
        </div>
        <p className="admin-eyebrow">Administrator verification</p>
        <h1>Your one-time login code</h1>
        <button type="button" onClick={copyOtp} className="admin-otp-copy">
          <span>{state.otp}</span>
          <b>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</b>
        </button>
        <p>Return to the admin sign-in tab and enter this code. It expires automatically and can only be used once.</p>
      </div>}

      {(state.status === "error" || state.status === "expired") && <div className="admin-otp-reveal-state" aria-live="polite">
        <div className="admin-otp-reveal-icon error"><ShieldAlert /></div>
        <h1>{state.status === "expired" ? "This code has expired" : "Link cannot be opened"}</h1>
        <p>Request a fresh admin login code. Old links cannot reveal a new OTP.</p>
        <Link to="/admin/login" className="admin-primary-button"><KeyRound size={17} />Return to admin sign in</Link>
      </div>}

      <footer><ShieldCheck size={13} />Protected by single-use access and device verification</footer>
    </section>
  </main>;
}