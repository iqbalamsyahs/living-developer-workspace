// One tag for the whole single-page app: any content change busts the full
// static page. The Sanity webhook (filter: the 4 types below) calls
// revalidateTag(PORTFOLIO_TAG) on create/update/delete.
export const PORTFOLIO_TAG = "portfolio-content";

// Single query, one payload. Experience references are resolved inline; slugs
// give the frontend stable ids. deskObject/workspaceConfig are intentionally
// not fetched (the 3D scene stays code-driven) and not in the webhook filter.
export const PORTFOLIO_QUERY = `{
  "profile": *[_type == "profile"][0]{
    photo, availability, faq, "resumeFileUrl": resume.file.asset->url,
    _id, name, philosophy, bio, contact, resume, siteConfig,
    "experiences": experiences[]->{position, company, startDate, endDate, description},
    stack, services
  },
  "projects": *[_type == "project"]|order(date desc){
    _id, title, date, summary, techStack, coverImage, gallery, role, highlights,
    outcomes, links, body, "slug": slug.current
  },
  "journalEntries": *[_type == "journalEntry"]|order(date desc){
    _id, title, date, summary, body, "slug": slug.current
  }
}`;
