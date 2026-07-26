import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  MessageSquareText,
  Mic2,
  ShieldCheck,
} from "lucide-react";
import { pageCanonical, SEO_PAGES } from "./seoContent";

const icons = {
  resume: FileSearch,
  interview: Mic2,
  chat: MessageSquareText,
};

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export default function CareerSeoLandingPage({ kind }) {
  const page = SEO_PAGES[kind] || SEO_PAGES.resume;
  const Icon = icons[page.icon] || FileSearch;
  const canonical = pageCanonical(page);

  useEffect(() => {
    const title = `${page.title} | CareerForge AI`;
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: page.description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: page.description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });

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
            <Link
              to={`/register?next=${encodeURIComponent(page.route)}`}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-black text-[#031318] transition hover:bg-cyan-300"
            >
              {page.cta} <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-xs text-slate-500">Free account. No card required to start.</p>
          </div>
          <aside className="border border-white/10 bg-[#080d15] p-5 sm:p-7">
            <h2 className="text-lg font-black">Built for practical career preparation</h2>
            <ul className="mt-5 grid gap-4">
              {page.benefits.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <p className="text-xs font-black uppercase text-cyan-300">Who it is for</p>
          <h2 className="mt-3 text-3xl font-black">Preparation grounded in your real context.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">{page.audience}</p>
          <div className="mt-6 space-y-4">
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-slate-400">{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0f18] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1000px]">
          <p className="text-xs font-black uppercase text-cyan-300">How it works</p>
          <h2 className="mt-3 text-3xl font-black">Four focused steps from context to action.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {page.steps.map(([title, detail], index) => (
              <article key={title} className="border border-white/10 bg-[#080d15] p-5">
                <span className="text-sm font-black text-cyan-300">0{index + 1}</span>
                <h3 className="mt-3 text-base font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1000px] gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase text-cyan-300">Included capabilities</p>
            <h2 className="mt-3 text-3xl font-black">Useful signals, not a mystery score.</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {page.benefits.map((item) => (
              <li key={item} className="flex gap-3 border border-white/10 bg-[#0b111b] p-4 text-sm leading-6 text-slate-300">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={17} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0f18] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1000px]">
          <p className="text-xs font-black uppercase text-cyan-300">How to interpret the result</p>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {page.details.map(([title, detail]) => (
              <article key={title} className="border border-white/10 bg-[#080d15] p-5">
                <h2 className="text-base font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck size={18} />
            <span className="text-xs font-black uppercase">Questions people ask</span>
          </div>
          <h2 className="mt-3 text-3xl font-black">Straight answers before you start.</h2>
          <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
            {page.questions.map(([question, answer]) => (
              <article key={question} className="py-5">
                <h3 className="text-base font-black">{question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0a1220] px-4 py-14 text-center sm:px-6">
        <h2 className="text-3xl font-black">Start with free credits. No card required.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
          Create one CareerForge AI workspace and continue the same career journey across resume, interview, chat, jobs, and supporting tools.
        </p>
        <Link
          to={`/register?next=${encodeURIComponent(page.route)}`}
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-black text-[#031318] transition hover:bg-cyan-300"
        >
          {page.cta} <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
