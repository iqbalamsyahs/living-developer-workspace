// Usage: node content/build-import.mjs  ->  content/content.ndjson
import { writeFileSync } from "node:fs";
import { email, experience, faq, photo, projects, services, socials, stack } from "./data.mjs";

const keyed = (prefix, items) => items.map((item, i) => ({ _key: `${prefix}${i}`, ...item }));
// `_sanityAsset` sits on the image object itself; the importer uploads the URL and writes `asset._ref`.
const image = (url, alt) => ({ _type: "image", _sanityAsset: `image@${url}`, alt });
const block = (text) => ({
  _type: "block",
  _key: "b0",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s0", marks: [], text }],
});

// Order matters for the importer: referenced documents come before the profile.
const docs = [
  {
    _id: experience.id,
    _type: "experience",
    position: experience.position,
    company: experience.company,
    startDate: experience.startDate,
    description: [block(experience.description)],
  },
  ...projects.map((p) => ({
    _id: `project-${p.slug}`,
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    summary: p.summary,
    coverImage: image(p.coverUrl, p.title),
    ...(p.href ? { links: [{ _type: "link", _key: "l0", label: "Visit site", href: p.href }] } : {}),
  })),
  {
    _id: "profile",
    _type: "profile",
    name: "Iqbal Alamsyah",
    heroTagline:
      "Experienced web developer from Bandung, Indonesia, with a passion for crafting seamless digital experiences and a proven track record.",
    photo: image(photo.url, photo.alt),
    availability: { isAvailable: true, statusText: "Available for work", timezone: "Asia/Jakarta" },
    experiences: [{ _type: "reference", _key: "e0", _ref: experience.id }],
    stack: keyed("st", stack),
    services: keyed("sv", services),
    faq: keyed("fq", faq),
    contact: {
      email,
      blurb: "Connect with Me Today. Let's Create Something Amazing Together!",
      socials: keyed("so", socials),
    },
  },
];

writeFileSync(new URL("./content.ndjson", import.meta.url), docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
console.log(`wrote ${docs.length} documents`);
