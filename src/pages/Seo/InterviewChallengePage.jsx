import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronLeft, Clock3, Code2, Copy, Database, Gauge, MessageCircle, RotateCcw, Share2, Sparkles, Target, Users } from "lucide-react";

import { trackPageView } from "../../services/telemetryService";

const ROLES = [
  ["java", "Java Developer", "Spring Boot, APIs and projects", Code2],
  ["frontend", "Frontend Developer", "React, UI and web performance", Sparkles],
  ["data", "Data Analyst", "SQL, dashboards and decisions", Database],
  ["general", "General Fresher", "HR, projects and communication", Users],
];

const QUESTIONS = {
  intro: {
    category: "Clarity",
    prompt: "The interviewer says: Tell me about yourself. Which opening is strongest?",
    options: [
      ["My hobbies and personal history explained from the beginning.", 0],
      ["Every line already written in my resume.", 1],
      ["A 60-second summary of my current stage, relevant skills, one proof point and why this role fits.", 3],
      ["I am hardworking, passionate and a quick learner.", 1],
    ],
    feedback: "A useful introduction is short, role-focused and supported by one concrete proof point.",
  },
  evidence: {
    category: "Evidence",
    prompt: "You are asked about your strongest project. What should your answer emphasize?",
    options: [
      ["Only the technology list.", 1],
      ["The problem, my responsibility, one difficult decision and a measurable or verifiable result.", 3],
      ["The team did everything, so I describe only the final screen.", 0],
      ["A long feature list without explaining my contribution.", 1],
    ],
    feedback: "Interviewers need evidence of ownership, decisions and outcomes, not only a stack or feature list.",
  },
  composure: {
    category: "Composure",
    prompt: "The interviewer asks something you do not fully know. What is the best response?",
    options: [
      ["Invent an answer confidently.", 0],
      ["Say I do not know and stop immediately.", 1],
      ["Clarify, state what I know, reason through it and identify what I would verify.", 3],
      ["Change the topic to a memorized answer.", 0],
    ],
    feedback: "Honest structured reasoning is stronger than guessing or ending the conversation too early.",
  },
};

const ROLE_QUESTIONS = {
  java: ["A Spring Boot API becomes slow under load. What is the strongest first response?", [
    ["Increase the server size immediately.", 1],
    ["Measure endpoint latency, database queries, pool usage and external calls before changing code.", 3],
    ["Add Redis to every method.", 1],
    ["Restart whenever it slows down.", 0],
  ]],
  frontend: ["A React screen feels slow on mobile. What is the strongest first response?", [
    ["Add more animations.", 0],
    ["Measure rendering, network waterfalls and bundle cost, then fix the dominant bottleneck.", 3],
    ["Use memo on every component.", 1],
    ["Hide the slow section on mobile.", 0],
  ]],
  data: ["Two dashboards show different revenue totals. What should you do first?", [
    ["Use the larger number.", 0],
    ["Check metric definitions, date ranges, joins, filters and source freshness.", 3],
    ["Average both totals.", 0],
    ["Change the dashboard colors.", 0],
  ]],
  general: ["You have limited professional experience. How should you prove you can do the job?", [
    ["Repeat that I am a quick learner.", 1],
    ["Connect projects, coursework or internships to the role using specific actions and outcomes.", 3],
    ["Apologize for being a fresher.", 0],
    ["Claim experience I do not have.", 0],
  ]],
};

function roleQuestion(role) {
  const [prompt, options] = ROLE_QUESTIONS[role];
  return { category: "Role readiness", prompt, options, feedback: "Strong answers start with evidence and a clear decision process instead of a generic claim." };
}

function resultCopy(score) {
  if (score >= 85) return ["Interview ready", "Strong structure. Practise delivery and deeper role-specific follow-ups next.", "text-emerald-300"];
  if (score >= 65) return ["Promising foundation", "You understand the approach, but examples and delivery need more practice.", "text-cyan-300"];
  return ["Practice recommended", "Focus on concise structure, concrete evidence and calm reasoning.", "text-amber-300"];
}

function Metric({ label, value, color }) {
  return <div className="border-t border-white/10 py-4"><div className="flex justify-between gap-4 text-sm"><span className="font-bold text-slate-300">{label}</span><strong className={color}>{value}%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color.replace("text-", "bg-")}`} style={{ width: `${value}%` }} /></div></div>;
}

export default function InterviewChallengePage() {
  const location = useLocation();
  const [role, setRole] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [complete, setComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const questions = useMemo(() => role ? [QUESTIONS.intro, roleQuestion(role), QUESTIONS.evidence, QUESTIONS.composure] : [], [role]);

  useEffect(() => {
    document.title = "Free Interview Readiness Test | CareerForge AI";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Take a free 3-minute interview readiness test without signing up and get an instant improvement plan.");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", "https://carerforge-frontend.pages.dev/interview-challenge/");
  }, []);

  const campaign = useMemo(() => {
    const input = new URLSearchParams(location.search);
    const output = new URLSearchParams();
    ["utm_source", "utm_medium", "utm_campaign"].forEach((key) => { const value = input.get(key); if (value) output.set(key, value.slice(0, 50)); });
    return output.toString();
  }, [location.search]);

  function chooseRole(value) {
    setRole(value); setStep(0); setAnswers([]); setSelected(null); setComplete(false);
    trackPageView(`/interview-challenge/started/${value}`).catch(() => {});
  }
  function next() {
    if (!selected) return;
    const updated = [...answers, selected];
    setAnswers(updated); setSelected(null);
    if (step === questions.length - 1) { setComplete(true); trackPageView(`/interview-challenge/completed/${role}`).catch(() => {}); }
    else setStep((value) => value + 1);
  }
  function reset() { setRole(""); setStep(0); setAnswers([]); setSelected(null); setComplete(false); }

  const score = Math.round((answers.reduce((sum, item) => sum + item[1], 0) / (questions.length * 3 || 1)) * 100);
  const summary = resultCopy(score);
  const metrics = complete ? questions.reduce((all, question, index) => ({ ...all, [question.category]: Math.round(((answers[index]?.[1] || 0) / 3) * 100) }), {}) : {};
  const registerTarget = `/register?next=%2Finterview${campaign ? `&${campaign}` : ""}`;
  const shareUrl = "https://carerforge-frontend.pages.dev/interview-challenge/?utm_source=share&utm_medium=referral&utm_campaign=interview_challenge";
  const shareText = `I scored ${score}/100 in this free interview readiness test. Check your score:`;

  async function shareResult() {
    if (navigator.share) {
      await navigator.share({ title: "My interview readiness score", text: shareText, url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return <main className="min-h-[calc(100dvh-56px)] bg-[#060a12] px-4 py-8 text-white sm:min-h-[calc(100dvh-64px)] sm:px-6 sm:py-12">
    <div className="mx-auto max-w-[1040px]">
      <header className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase text-cyan-200"><Clock3 size={15} /> Free 3-minute challenge</div><h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">How ready are you for your next interview?</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Answer four realistic situations and receive an instant readiness snapshot. No signup, no card and no waiting.</p></div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400"><Gauge className="text-amber-300" size={18} /> Instant score after 4 answers</div>
      </header>

      {!role && <section className="py-9 sm:py-12"><p className="text-xs font-black uppercase text-cyan-300">Step 1 of 2</p><h2 className="mt-2 text-2xl font-black">Choose the interview closest to your goal</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{ROLES.map(([id, label, detail, Icon]) => <button key={id} type="button" onClick={() => chooseRole(id)} className="flex min-h-24 items-center gap-4 rounded-lg border border-white/10 bg-[#0b111b] p-4 text-left transition hover:border-cyan-300/45 hover:bg-[#101927]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-cyan-300"><Icon size={21} /></span><span className="min-w-0"><strong className="block text-base">{label}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span><ArrowRight className="ml-auto shrink-0 text-slate-600" size={18} /></button>)}</div></section>}

      {role && !complete && <section className="mx-auto max-w-[820px] py-8 sm:py-12"><div className="flex items-center justify-between gap-4"><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"><ChevronLeft size={16} /> Change role</button><span className="text-xs font-black text-cyan-300">Question {step + 1} of {questions.length}</span></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-[width] duration-300" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div><div className="mt-7"><p className="text-xs font-black uppercase text-amber-300">{questions[step].category}</p><h2 className="mt-3 text-2xl font-black leading-snug sm:text-3xl">{questions[step].prompt}</h2><div className="mt-6 grid gap-3">{questions[step].options.map((option, index) => { const active = selected?.[0] === option[0]; return <button key={option[0]} type="button" onClick={() => setSelected(option)} className={`flex min-h-14 items-start gap-3 rounded-lg border p-4 text-left text-sm leading-6 transition ${active ? "border-cyan-300 bg-cyan-300/10 text-white" : "border-white/10 bg-[#0b111b] text-slate-300 hover:border-white/25"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-black ${active ? "border-cyan-300 bg-cyan-300 text-[#031318]" : "border-white/20 text-slate-500"}`}>{String.fromCharCode(65 + index)}</span>{option[0]}</button>; })}</div>{selected && <div className="mt-5 border-l-2 border-amber-300 bg-amber-300/[0.06] p-4 text-sm leading-6 text-slate-300">{questions[step].feedback}</div>}<button type="button" onClick={next} disabled={!selected} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-black text-[#031318] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto">{step === questions.length - 1 ? "Show my score" : "Next question"} <ArrowRight size={17} /></button></div></section>}

      {complete && <section className="py-8 sm:py-12"><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12"><div><p className="text-xs font-black uppercase text-cyan-300">Your readiness snapshot</p><div className="mt-4 flex items-end gap-3"><strong className="text-7xl font-black leading-none">{score}</strong><span className="pb-1 text-lg font-bold text-slate-500">/100</span></div><h2 className={`mt-5 text-2xl font-black ${summary[2]}`}>{summary[0]}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{summary[1]}</p><div className="mt-7 border-y border-white/10"><Metric label="Clarity" value={metrics.Clarity || 0} color="text-cyan-300" /><Metric label="Role readiness" value={metrics["Role readiness"] || 0} color="text-fuchsia-300" /><Metric label="Evidence" value={metrics.Evidence || 0} color="text-emerald-300" /><Metric label="Composure" value={metrics.Composure || 0} color="text-amber-300" /></div></div><div className="rounded-lg border border-white/10 bg-[#0b111b] p-5 sm:p-7"><div className="flex items-center gap-2 text-emerald-300"><Target size={19} /><span className="text-xs font-black uppercase">Your next practice plan</span></div><ol className="mt-6 grid gap-5">{[["Prepare a 60-second introduction", "Connect your stage, skills, proof and motivation."], ["Build three evidence stories", "Use situation, action, decision and result."], ["Practise follow-up pressure", "Explain trade-offs, mistakes and ownership."]].map(([title, detail], index) => <li key={title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black text-cyan-300">{index + 1}</span><div><strong className="text-sm">{title}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></li>)}</ol><Link to={registerTarget} onClick={() => trackPageView(`/interview-challenge/full-interview/${role}`).catch(() => {})} className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-black text-[#031318] hover:bg-cyan-300">Practise a full interview free <ArrowRight size={18} /></Link><p className="mt-3 text-center text-xs text-slate-500">100 starter credits. No card required.</p><div className="mt-5 border-t border-white/10 pt-5"><p className="text-center text-xs font-black uppercase text-slate-400">Challenge a friend</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" onClick={shareResult} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-bold text-white hover:bg-white/10"><Share2 size={15} /> Share</button><a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-xs font-bold text-emerald-200"><MessageCircle size={15} /> WhatsApp</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-400/20 bg-blue-400/10 text-xs font-bold text-blue-200"><Share2 size={15} /> LinkedIn</a><button type="button" onClick={async () => { await navigator.clipboard.writeText(`${shareText} ${shareUrl}`); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-bold text-white hover:bg-white/10"><Copy size={15} /> {copied ? "Copied" : "Copy"}</button></div></div></div></div><button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><RotateCcw size={15} /> Try another role</button></section>}

      <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-300" /> No personal data is required.</span><span>Coaching snapshot, not an employer decision.</span></footer>
    </div>
  </main>;
}