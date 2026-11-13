// Content migrated from the owner's Framer site (home, /services, /contact).
// Marked "mine" where the Framer site has no text for it.
const IMG = (id) => `https://framerusercontent.com/images/${id}`;

export const email = "ialamsyah92@gmail.com";

export const stack = [
  ...["Laravel", "React JS", "Vue JS", "Express JS", "Tailwind CSS", "Bootstrap", "Redux", "Pinia", "Axios"].map((name) => ({ name, category: "framework" })),
  ...["PHP", "JavaScript", "TypeScript"].map((name) => ({ name, category: "language" })),
  ...["Git", "Node JS", "Jira", "Trello", "Figma", "Framer"].map((name) => ({ name, category: "tool" })),
  ...["MySQL", "MongoDB"].map((name) => ({ name, category: "database" })),
];

export const services = [
  { name: "Web Dev", description: "Developing fast, scalable, and high-performance web applications tailored to your needs." },
  { name: "Landing Page Dev", description: "Designing high-converting and responsive landing pages that drive engagement and conversions." },
  { name: "CMS Dev", description: "Developing flexible and user-friendly content management systems for effortless content control." },
  // mine: the Framer text for this card repeats a performance blurb
  { name: "API Integration", description: "Connecting web apps to third-party and internal APIs for reliable, well-structured data flow." },
];

export const faq = [
  ["Can you work with clients remotely?", "Absolutely! I have experience working with clients from all around the world. Through effective communication channels such as email, video calls, and project management tools, I ensure seamless collaboration regardless of geographical location."],
  ["How long does it typically take to complete a project?", "The timeline for each project varies depending on its scope and complexity. Factors such as the number of pages, functionalities required, and client feedback process can impact the timeline. Upon discussing your project requirements, I will provide you with a realistic timeline and keep you updated throughout the process."],
  ["Do you offer website maintenance?", "Yes, I offer website maintenance services to ensure your website remains up to date, secure, and optimized. From content updates and bug fixes to performance optimization and security enhancements, I can provide ongoing support to keep your website running smoothly."],
  ["Can you optimize my website?", "Certainly! I incorporate search engine optimization (SEO) best practices into my web design process. This includes using relevant keywords, optimizing meta tags, creating search engine-friendly URLs, and ensuring your website has a solid foundation for better search engine visibility."],
  ["Will my website be mobile-friendly?", "Absolutely! Mobile responsiveness is a top priority in today's digital landscape. I design and develop websites that are fully responsive and adapt seamlessly to various devices and screen sizes. Your website will provide an optimal user experience whether accessed from desktops, smartphones, or tablets."],
  ["Can you integrate third-party tools into my website?", "Yes, I have experience integrating various third-party tools, plugins, and platforms into websites. Whether you need to integrate e-commerce functionalities, social media integration, email marketing services, or any other specific requirements, I can help you find the right solutions and ensure smooth integration."],
  ["How do you handle website revisions?", "I value your input and collaboration throughout the design process. Upon completing the initial design, I provide you with an opportunity to review and provide feedback. I incorporate your suggestions and revisions to ensure the final product aligns with your vision."],
  ["What are your payment terms?", "Payment terms may vary depending on the project scope and duration. Generally, I require a percentage of the total project cost as an upfront deposit before commencing work."],
].map(([question, answer]) => ({ question, answer }));

export const socials = [
  { platform: "linkedin", url: "https://www.linkedin.com/in/iqbal-alamsyah-63808b1a5/" },
  { platform: "instagram", url: "https://www.instagram.com/iqbalamsyahs/" },
  { platform: "x", url: "https://x.com/iqbalamsyahs" },
  { platform: "facebook", url: "https://web.facebook.com/m.s.12327" },
];

// Owner-approved About copy: one string per paragraph.
export const bio = [
  "I'm Iqbal, a frontend web developer from Bandung, Indonesia. Since 2021 I've worked at Aegislabs, building applications with Laravel, React and Vue, including asset and project management systems for PLN.",
  "Outside the day job I take on freelance work: web apps, landing pages that convert, CMS tools teams can run themselves, and API integrations. I work remotely with clients anywhere, and I care about the details users feel: speed, responsiveness and a clean handoff.",
];

export const philosophy =
  "Good software is like a well-lit room: you find what you need without looking for the switch.";

export const photo ={ url: IMG("1yCelgDI6rlFZFD7urP97WH5mHo.jpg"), alt: "Portrait of Iqbal Alamsyah" };

export const experience = {
  id: "experience-aegislabs",
  position: "Frontend Web Developer",
  company: "Aegislabs",
  // The site only says "2021 - Present"; owner to correct the month/day.
  startDate: "2021-01-01",
  description:
    "Developing several applications as Frontend Web Developer using Framework Laravel for PHP, Library React JS and Framework Vue for Javascript",
};

export const projects = [
  { slug: "cmms", title: "CMMS", summary: "Asset management system for PLN to track and optimize infrastructure.", cover: "khDIuRGz8gSYGcXkUA2bq0S0E.png" },
  { slug: "new-virtual-cubicle", title: "New Virtual Cubicle", summary: "Project management system for PLN to track and optimize corporate operations.", cover: "qQe5OfCN6BkIgNs976uijl7PzSI.png" },
  { slug: "vyneapple-landing", title: "Landing Page Vyneapple", summary: "A promotional website Vyneapple’s features, benefits, and e-learning solutions.", cover: "trl2CxvubG85BKjT1uQol5KwvQ.png", href: "https://vyneapple.com/" },
  { slug: "vyneapple-app", title: "Web Apps Vyneapple", summary: "E-learning platform for elementary schools in Indonesia with interactive features.", cover: "GYaIHoLpq6UGiIRbGXoYLPawS0.png", href: "https://apps.vyneapple.com/" },
  { slug: "vyneapple-cms", title: "CMS Vyneapple", summary: "A content management system for managing e-learning materials and user data.", cover: "w5aSxhiWw5cyKr2goYWS6Jn6pKQ.png" },
  { slug: "mindtrex-academy", title: "Mindtrex Academy", summary: "A promotional website Mindtrex's features, benefits, and e-learning solutions.", cover: "LeM36v9YA03EiRKlnS9G9ZiJM.png", href: "https://mindtrexacademy.com/" },
].map((p) => ({ ...p, coverUrl: IMG(p.cover) }));
