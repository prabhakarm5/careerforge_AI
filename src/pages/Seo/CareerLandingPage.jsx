import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileSearch, MessageSquareText, Mic2, ShieldCheck } from "lucide-react";

const SITE_URL = "https://carerforge-frontend.pages.dev";

const pages = {
  resume: {
    icon: FileSearch,
    eyebrow: "Free AI resume review",
    title: "AI Resume Checker for ATS Feedback",
    description: "Upload your resume, find ATS gaps, compare it with a job description, and build a clearer ATS-friendly version in CareerForge AI.",
    route: "/resume?new=1",
    cta: "Check my resume free",
    keywords: ["ATS score and missing keywords", "Resume and job-description match", "Downloadable ATS-friendly resume"],
    questions: [
      ["Can I check a resume without paying?", "Yes. Create a free CareerForge AI account and begin with free credits for resume analysis."],
      ["Can I add a job description?", "Yes. Paste it or upload a supported file to see role-specific gaps and match feedback."],
    ],
  },
  interview: {
    icon: Mic2,
    eyebrow: "Hindi and English practice",
    title: "AI Mock Interview Practice for Freshers",
    description: "Practice a resume-aware AI mock interview in Hindi or English. Use your job description, answer by voice or text, and get a practical scorecard.",
    route: "/interview",
    cta: "Start mock interview",
    keywords: ["Resume-aware interview questions", "Hindi and English voice practice", "Role and job-description follow-ups"],
    questions: [
      ["Does the interview use my resume?", "Yes. You can attach your resume and job description so questions stay related to your actual role and projects."],
      ["Can I practice in Hindi?", "Yes. CareerForge AI supports Hindi, English, and automatic language matching."],
    ],
  },
  chat: {
    icon: MessageSquareText,
    eyebrow: "Career guidance with context",
    title: "Career AI Chat for Resume and Interview Help",
    description: "Ask CareerForge AI about your resume, interview answers, projects, job search, and career decisions in one context-aware workspace.",
    route: "/chat",
    cta: "Open Career AI Chat",
    keywords: ["Career and coding guidance", "Conversation memory across sessions", "Artifact panel for code and long documents"],
    questions: [
      ["What can I ask Career AI Chat?", "You can get help with resumes, interview answers, projects, job-search planning, cover letters, and career decisions."],
      ["Will it remember my conversation?", "Conversation history is stored so the next discussion can continue from your earlier context."],
    ],
  },
};

function upsertMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function CareerLandingPage({ kind }) {
  const page = pages[kind] || pages.resume;
  const Icon = page.icon;
  const canonical = `${SITE_URL}/${kind === "resume" ? "ai-resume-checker" : kind === "interview" ? "ai-mock-interview" : "career-ai-chat"}`;

  useEffect(() => {
    document.title = `${page.title} | CareerForge AI`;
    upsertMeta("description", page.description);
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }, [canonical, page.description, page.title]);

  return (
    <main className="min-h-screen bg-[#060a12] text-white">
      <section className="border-b border-white/10 bg-[#0a1220] px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase text-cyan-200">
              <Icon size={16} /> {page.eyebrow}
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{page.description}</p>
            <Link to={`/register?next=${encodeURIComponent(page.route)}`} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-black text-[#031318] transition hover:bg-cyan-300">
              {page.cta} <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-xs text-slate-500">Free account. No card required to start.</p>
          </div>
          <aside className="border border-white/10 bg-[#080d15] p-5 sm:p-7">
            <h2 className="text-lg font-black">Built for practical career preparation</h2>
            <ul className="mt-5 grid gap-4">
              {page.keywords.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={17} />{item}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <p className="text-xs font-black uppercase text-cyan-300">How it works</p>
          <h2 className="mt-3 text-3xl font-black">Start with your real career context.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Create your free workspace", "Add your resume or job context", "Get focused guidance and next steps"].map((step, index) => <article key={step} className="border border-white/10 bg-[#0b111b] p-5"><span className="text-sm font-black text-cyan-300">0{index + 1}</span><p className="mt-4 text-sm font-bold leading-6 text-white">{step}</p></article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0f18] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center gap-2 text-cyan-300"><ShieldCheck size={18} /><span className="text-xs font-black uppercase">Questions people ask</span></div>
          <h2 className="mt-3 text-3xl font-black">Straight answers before you start.</h2>
          <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
            {page.questions.map(([question, answer]) => <article key={question} className="py-5"><h3 className="text-base font-black">{question}</h3><p className="mt-2 text-sm leading-7 text-slate-400">{answer}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
