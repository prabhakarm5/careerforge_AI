const DEFAULT_SITE_URL = "https://carerforge-frontend.pages.dev";
const configuredSiteUrl =
  globalThis.process?.env?.VITE_SITE_URL ||
  import.meta.env?.VITE_SITE_URL ||
  DEFAULT_SITE_URL;

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export const SEO_PAGES = {
  resume: {
    slug: "ai-resume-checker",
    icon: "resume",
    eyebrow: "Free AI resume review",
    title: "AI Resume Checker for ATS Feedback",
    description:
      "Upload your resume, find ATS gaps, compare it with a job description, and build a clearer ATS-friendly version in CareerForge AI.",
    route: "/resume?new=1",
    cta: "Check my resume free",
    audience:
      "Built for freshers, students, career switchers, and working professionals who want specific resume feedback before applying.",
    intro: [
      "A resume should be easy for both recruiters and applicant tracking systems to understand. CareerForge AI reviews the information in your resume, highlights missing or weak areas, and turns the result into a practical improvement plan.",
      "You can analyze a resume on its own or add a real job description. The job-specific workflow compares skills, responsibilities, and keywords so the feedback is connected to the role you actually want.",
    ],
    benefits: [
      "ATS score with clear reasons behind the result",
      "Missing skills, weak bullets, and formatting risks",
      "Resume and job-description match analysis",
      "Bilingual coaching in Hindi or English",
      "ATS-friendly resume generation and PDF download",
      "Saved history for continuing improvements later",
    ],
    steps: [
      ["Upload your resume", "Add a PDF, DOCX, image, or pasted resume text to start a secure analysis."],
      ["Add the target role", "Paste or upload a job description when you want role-specific matching."],
      ["Review the evidence", "See strengths, gaps, missing keywords, and suggested improvements instead of a score alone."],
      ["Build the improved version", "Continue with the resume coach and download an ATS-friendly result when it is ready."],
    ],
    details: [
      ["What the ATS score means", "The score is an AI-assisted coaching estimate. It helps you compare versions and identify common ATS risks, but it does not claim to reproduce every employer's private ATS."],
      ["Why job matching matters", "A strong general resume can still miss a specific role. Comparing it with the job description reveals missing terminology, relevant skills, and experience that should be made easier to find."],
      ["How your data is handled", "Provider credentials stay on the server. Authenticated history lets you revisit an analysis without placing secret API keys in the browser."],
    ],
    questions: [
      ["Can I check a resume without paying?", "Yes. Create a free CareerForge AI account and use the starter credits included with a verified new account."],
      ["Can I add a job description?", "Yes. Paste it or upload a supported PDF or image to receive role-specific gap and match feedback."],
      ["Does a high score guarantee an interview?", "No. The score is guidance, not an employer decision. Hiring also depends on role fit, experience, market conditions, and how you apply."],
      ["Can CareerForge AI rewrite my resume?", "Yes. After analysis, continue the conversation to improve sections and generate a downloadable ATS-friendly version."],
      ["Will my previous analysis remain available?", "Resume history is saved for your account so you can return to the same work instead of starting from zero."],
      ["Can freshers use it?", "Yes. The guidance can focus on education, projects, internships, certifications, and measurable learning outcomes when professional experience is limited."],
    ],
  },
  interview: {
    slug: "ai-mock-interview",
    icon: "interview",
    eyebrow: "Hindi and English practice",
    title: "AI Mock Interview Practice for Freshers",
    description:
      "Practice a resume-aware AI mock interview in Hindi or English. Use your job description, answer by voice or text, and get a practical scorecard.",
    route: "/interview",
    cta: "Start mock interview",
    audience:
      "Useful for campus placements, fresher interviews, career changes, technical roles, non-technical roles, and company-specific preparation.",
    intro: [
      "CareerForge AI creates an interview around your target role instead of showing the same generic question list to everyone. Add your resume, company, experience level, and job description to make the practice relevant.",
      "Choose written practice when you want to improve answer structure, or use the live room for voice-based preparation. The interviewer can ask follow-up questions and the final report explains strengths and improvement areas.",
    ],
    benefits: [
      "Resume-aware and job-description-aware questions",
      "Hindi, English, and automatic language matching",
      "Written practice and live voice interview modes",
      "Adaptive follow-up questions based on your answer",
      "Project, behavioral, technical, and HR preparation",
      "Final scorecard with evidence and improvement steps",
    ],
    steps: [
      ["Choose your interview", "Select the role, experience level, language, difficulty, and interview type."],
      ["Add real context", "Upload your resume and a PDF or image job description, or paste the role details."],
      ["Answer naturally", "Use voice in the live room or text in written practice while the interviewer adapts."],
      ["Review the report", "Study the evidence-based score, weak areas, and recommended practice before trying again."],
    ],
    details: [
      ["Questions for different careers", "The setup is not limited to software developers. Role, seniority, company, course, and job context guide the interview for technical and non-technical candidates."],
      ["Why follow-up questions help", "Real interviewers challenge vague claims and ask for examples. Adaptive follow-ups help you practise clarity, ownership, trade-offs, and measurable impact."],
      ["What the final score represents", "The report is a coaching estimate based on the practice session. It is designed to show patterns to improve, not to predict an employer's final decision."],
    ],
    questions: [
      ["Does the interview use my resume?", "Yes. Attach your resume and job description so questions can cover your skills, projects, claims, gaps, and target role."],
      ["Can I practise in Hindi?", "Yes. CareerForge AI supports Hindi, English, and automatic language matching for the interview conversation."],
      ["Can it ask company-specific questions?", "Yes. Add the company name and role context so the generated interview can include relevant company and role themes."],
      ["Is camera compulsory?", "No. You can choose written practice or control camera and microphone options in the live interview room."],
      ["Will I receive improvement feedback?", "Yes. The session report separates strengths, risks, evidence, and concrete areas to practise next."],
      ["Is it only for experienced candidates?", "No. Freshers can practise introductions, projects, internships, fundamentals, HR questions, and placement interviews."],
    ],
  },
  chat: {
    slug: "career-ai-chat",
    icon: "chat",
    eyebrow: "Career guidance with context",
    title: "Career AI Chat for Resume and Interview Help",
    description:
      "Ask CareerForge AI about your resume, interview answers, projects, job search, and career decisions in one context-aware workspace.",
    route: "/chat",
    cta: "Open Career AI Chat",
    audience:
      "Designed for candidates who need one workspace for career questions, project explanations, coding help, research, and application preparation.",
    intro: [
      "Career questions rarely fit into a single prompt. CareerForge AI keeps a saved conversation so you can refine a resume bullet, prepare its interview explanation, and continue the same discussion later.",
      "Responses stream as they are generated. Code and long documents can open in a focused artifact panel, while public-web research is used only when the question requires current information.",
    ],
    benefits: [
      "Career, resume, interview, and project guidance",
      "Durable conversation history across sessions",
      "Streaming responses with stop and retry controls",
      "Model selection based on configured providers",
      "Web research for questions needing current sources",
      "Artifact panel for code and long documents",
    ],
    steps: [
      ["Start a focused conversation", "Describe the decision, role, project, or interview answer you want to improve."],
      ["Add supporting material", "Paste text or attach the relevant context instead of relying on a generic prompt."],
      ["Refine with follow-ups", "Ask for a shorter answer, examples, trade-offs, or a version suited to your experience."],
      ["Continue later", "Open the saved conversation and carry on with the earlier context available."],
    ],
    details: [
      ["How memory works", "Recent conversation context is cached for speed and durable messages are stored for later sessions. Long conversations use relevant earlier snippets instead of sending unlimited history on every request."],
      ["When web research is used", "Current facts, documentation, and URL-based questions can trigger public-web research. The answer should distinguish researched context from the model's general knowledge."],
      ["Why artifacts are separate", "Long code and document outputs are easier to inspect, copy, and preview in a dedicated panel than inside a narrow chat bubble."],
    ],
    questions: [
      ["What can I ask Career AI Chat?", "Ask about resumes, interview answers, projects, coding, job-search planning, cover letters, and career decisions."],
      ["Will it remember my conversation?", "Saved messages let a later session continue from earlier context. Relevant history is selected to control speed and provider cost."],
      ["Can it search the public web?", "Yes, when the request needs current information or URL research and a configured provider supports that workflow."],
      ["Can I choose an AI model?", "Yes. The available model list comes from backend configuration and can depend on your current credit access."],
      ["Can I stop a long answer?", "Yes. Streaming controls let you stop generation, retry, copy responses, and continue with a new instruction."],
      ["Does it support code?", "Yes. Code can be streamed and opened in the artifact panel for focused viewing and copying."],
    ],
  },
};

export function pageCanonical(page) {
  return `${SITE_URL}/${page.slug}/`;
}
