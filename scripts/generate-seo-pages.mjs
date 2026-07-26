import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pageCanonical, SEO_PAGES, SITE_URL } from "../src/pages/Seo/seoContent.js";

const DIST_DIR = resolve(process.cwd(), "dist");
const TODAY = new Date().toISOString().slice(0, 10);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function staticPage(page) {
  return `
    <div class="seo-static">
      <nav aria-label="Main navigation">
        <a class="brand" href="/">CareerForge AI</a>
        <div><a href="/ai-resume-checker">Resume</a><a href="/ai-mock-interview">Interview</a><a href="/career-ai-chat">Career Chat</a></div>
      </nav>
      <main>
        <header class="hero">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="lead">${escapeHtml(page.description)}</p>
          <a class="cta" href="/register?next=${encodeURIComponent(page.route)}">${escapeHtml(page.cta)}</a>
          <small>Free account. No card required to start.</small>
        </header>
        <section>
          <h2>Career preparation based on your real context</h2>
          <p>${escapeHtml(page.audience)}</p>
          ${page.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>
        <section>
          <h2>How it works</h2>
          <div class="grid">${page.steps.map(([title, detail], index) => `<article><b>0${index + 1}</b><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></article>`).join("")}</div>
        </section>
        <section>
          <h2>What is included</h2>
          ${list(page.benefits)}
        </section>
        <section>
          <h2>Understand the result</h2>
          <div class="grid">${page.details.map(([title, detail]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></article>`).join("")}</div>
        </section>
        <section>
          <h2>Frequently asked questions</h2>
          ${page.questions.map(([question, answer]) => `<article class="faq"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}
        </section>
      </main>
      <footer><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Support</a></footer>
    </div>`;
}

function homeStaticPage() {
  return `
    <div class="seo-static">
      <nav aria-label="Main navigation"><a class="brand" href="/">CareerForge AI</a><div><a href="/login">Log in</a><a href="/register">Create free account</a></div></nav>
      <main>
        <header class="hero">
          <p class="eyebrow">Interview-first AI career workspace</p>
          <h1>CareerForge AI Interview Practice</h1>
          <p class="lead">Practise role-specific interviews using your resume and job description, answer in Hindi or English, and receive a practical improvement scorecard.</p>
          <a class="cta" href="/register?next=%2Finterview">Start a mock interview</a>
        </header>
        <section>
          <h2>One connected workspace for career preparation</h2>
          <p>CareerForge AI connects mock interviews, ATS resume analysis, career chat, live jobs, cover letters, and image tools around one account and credit wallet.</p>
          <div class="grid">
            <article><h3><a href="/ai-mock-interview">AI mock interview for freshers</a></h3><p>Practise voice or written interviews with resume-aware follow-ups and a final report.</p></article>
            <article><h3><a href="/ai-resume-checker">AI resume checker</a></h3><p>Find ATS gaps, compare a resume with a job description, and create an improved version.</p></article>
            <article><h3><a href="/career-ai-chat">Career AI chat</a></h3><p>Continue saved conversations about interviews, projects, resumes, coding, and job-search decisions.</p></article>
          </div>
        </section>
        <section>
          <h2>Start free and prepare with real evidence</h2>
          <p>Verified new accounts receive starter credits. Add your actual resume, role, company, and job description so the guidance is specific to the opportunity you are targeting.</p>
        </section>
      </main>
      <footer><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a><a href="/payment-policy">Payments</a><a href="/contact">Support</a></footer>
    </div>`;
}

const STATIC_STYLE = `
  <style id="seo-static-style">
    .seo-static{min-height:100vh;background:#060a12;color:#e8eef8;font:16px/1.7 Arial,sans-serif}
    .seo-static nav,.seo-static main,.seo-static footer{width:min(1080px,calc(100% - 32px));margin:auto}
    .seo-static nav{display:flex;justify-content:space-between;gap:20px;padding:22px 0}
    .seo-static nav div,.seo-static footer{display:flex;flex-wrap:wrap;gap:18px}
    .seo-static a{color:#67e8f9}.seo-static .brand{color:#fff;font-weight:800;text-decoration:none}
    .seo-static .hero{padding:72px 0 56px}.seo-static h1{max-width:820px;font-size:clamp(38px,7vw,66px);line-height:1.05;margin:12px 0}
    .seo-static h2{font-size:30px;line-height:1.2}.seo-static h3{line-height:1.35}.seo-static .lead{max-width:760px;font-size:19px;color:#b9c5d8}
    .seo-static .eyebrow{color:#67e8f9;font-weight:800;text-transform:uppercase}.seo-static .cta{display:inline-block;margin:18px 0 8px;background:#67e8f9;color:#041318;padding:12px 18px;text-decoration:none;font-weight:800}
    .seo-static small{display:block;color:#7f8da3}.seo-static section{border-top:1px solid #243044;padding:42px 0}.seo-static p,.seo-static li{color:#b9c5d8}
    .seo-static .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.seo-static article{border:1px solid #243044;background:#0b111b;padding:18px}
    .seo-static .faq{border-width:0 0 1px;background:transparent;padding-left:0}.seo-static footer{border-top:1px solid #243044;padding:28px 0 42px}
  </style>`;

function setMeta(html, page) {
  const canonical = pageCanonical(page);
  const title = `${page.title} | CareerForge AI`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.questions.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CareerForge AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: canonical,
    description: page.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(page.description)}">`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}">`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(page.description)}">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}">`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(page.description)}">`)
    .replace("</head>", `${STATIC_STYLE}<script type="application/ld+json">${JSON.stringify(appSchema)}</script><script type="application/ld+json">${JSON.stringify(faqSchema)}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root">${staticPage(page)}</div>`);
}

function setHomeStatic(html) {
  const canonical = `${SITE_URL}/`;
  const title = "CareerForge AI - AI Mock Interview, Resume Checker and Career Chat";
  const description = "Practise resume-aware AI mock interviews in Hindi or English, check ATS resume gaps, and continue career guidance in one connected workspace.";
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${description}">`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`)
    .replace("</head>", `${STATIC_STYLE}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${homeStaticPage()}</div>`);
}

export async function generateSeoPages() {
  const templatePath = resolve(DIST_DIR, "index.html");
  const template = await readFile(templatePath, "utf8");
  await writeFile(templatePath, setHomeStatic(template), "utf8");

  for (const page of Object.values(SEO_PAGES)) {
    const directory = resolve(DIST_DIR, page.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, "index.html"), setMeta(template, page), "utf8");
  }

  const urls = [
    ["", "1.0"],
    ...Object.values(SEO_PAGES).map((page) => [page.slug, "0.9"]),
    ["privacy-policy", "0.4"],
    ["terms", "0.4"],
    ["payment-policy", "0.4"],
    ["delivery-policy", "0.4"],
    ["contact", "0.5"],
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, priority]) => `  <url><loc>${SITE_URL}/${path}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;
  await writeFile(resolve(DIST_DIR, "sitemap.xml"), sitemap, "utf8");
  await writeFile(resolve(DIST_DIR, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, "utf8");
}

await generateSeoPages();
