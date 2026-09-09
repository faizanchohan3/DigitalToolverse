export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  category: string;
  badge?: string;
  logo?: string;
};

// Logos via Simple Icons CDN (https://simpleicons.org).
// Default to the brand's dark/black mark so it stays visible on the white logo chip.
const icon = (slug: string, color = "000000") => `https://cdn.simpleicons.org/${slug}/${color}`;
// Fallback for brands not in Simple Icons — pulls the real favicon by domain.
const favicon = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const tools: Tool[] = [
  { slug: "chatgpt-plus", name: "ChatGPT Plus", tagline: "GPT-4 class reasoning & faster responses", price: "PKR 2,499", category: "AI", badge: "-30%", logo: icon("openai", "000000") },
  { slug: "canva-pro", name: "Canva Pro", tagline: "Pro templates, brand kit & magic resize", price: "PKR 1,299", category: "Design", badge: "-55%", logo: icon("canva", "0A0E27") },
  { slug: "midjourney", name: "Midjourney", tagline: "Studio-grade AI image generation", price: "PKR 3,999", category: "AI", logo: icon("midjourney") },
  { slug: "adobe-cc", name: "Adobe Creative Cloud", tagline: "All 20+ Adobe apps in one plan", price: "PKR 6,500", category: "Design", badge: "-40%", logo: icon("adobecreativecloud", "EB1000") },
  { slug: "office-365", name: "Microsoft Office 365", tagline: "Word, Excel, PowerPoint + 1TB OneDrive", price: "PKR 4,999", category: "Productivity", logo: icon("microsoftoffice", "0078D4") },
  { slug: "nord-vpn", name: "NordVPN", tagline: "Fast, secure VPN with global servers", price: "PKR 900", category: "Privacy", logo: icon("nordvpn", "4687FF") },
  { slug: "grammarly", name: "Grammarly Premium", tagline: "Advanced grammar, tone & clarity AI", price: "PKR 1,499", category: "Writing", badge: "-70%", logo: icon("grammarly", "15C39A") },
  { slug: "notion", name: "Notion AI", tagline: "Docs, wikis & AI workspace in one", price: "PKR 1,899", category: "Productivity", logo: icon("notion") },
  { slug: "cursor", name: "Cursor Pro", tagline: "AI pair-programmer in your editor", price: "PKR 4,200", category: "Dev", logo: icon("cursor") },
  { slug: "envato", name: "Envato Elements", tagline: "Unlimited assets, fonts & templates", price: "PKR 2,300", category: "Design", badge: "-60%", logo: icon("envato", "81B441") },
  { slug: "coursera", name: "Coursera Plus", tagline: "Unlimited courses & certificates", price: "PKR 3,200", category: "Learning", logo: icon("coursera", "0056D2") },
  { slug: "quillbot", name: "QuillBot Premium", tagline: "Paraphrasing & grammar tools", price: "PKR 900", category: "Writing", logo: icon("quillbot", "00A98F") },
  { slug: "claude", name: "Claude Pro", tagline: "Anthropic's helpful AI assistant", price: "PKR 2,799", category: "AI", logo: icon("anthropic", "D97757") },
  { slug: "figma", name: "Figma Professional", tagline: "Collaborative design at scale", price: "PKR 2,100", category: "Design", logo: icon("figma", "F24E1E") },
  { slug: "perplexity", name: "Perplexity Pro", tagline: "AI search with real-time sources & citations", price: "PKR 2,199", category: "AI", badge: "Hot", logo: icon("perplexity", "20808D") },
  { slug: "elevenlabs", name: "ElevenLabs", tagline: "Ultra-realistic AI voice & text-to-speech", price: "PKR 1,899", category: "AI", logo: icon("elevenlabs") },
  { slug: "higgsfield", name: "Higgsfield", tagline: "AI-powered video generation & editing", price: "PKR 3,499", category: "AI", badge: "New", logo: favicon("higgsfield.ai") },
  { slug: "meshy-ai", name: "Meshy AI", tagline: "Generate 3D models from text, image or sketch", price: "PKR 3,299", category: "AI", badge: "New", logo: favicon("meshy.ai") },
];

export const services = [
  { slug: "affiliate-program", title: "Affiliate Program", desc: "Earn recurring commissions on every referral.", icon: "Handshake" },
  { slug: "physical-products", title: "Physical Products", desc: "Smart gadgets shipped to your doorstep.", icon: "Package" },
  { slug: "courses-hub", title: "Courses Hub", desc: "Premium courses across business, design & code.", icon: "GraduationCap" },
  { slug: "tools", title: "All AI Tools", desc: "100+ premium AI tools at the best price.", icon: "Sparkles" },
  { slug: "smm-panel", title: "SMM Panel", desc: "Real followers, views & engagement at scale.", icon: "TrendingUp" },
  { slug: "services", title: "Growth Services", desc: "Done-for-you marketing, SEO & branding.", icon: "Rocket" },
  { slug: "reviews", title: "Customer Reviews", desc: "Real stories from 12,000+ happy users.", icon: "Star" },
  { slug: "giveaways", title: "Giveaways", desc: "Free premium assets every single week.", icon: "Gift" },
];

export const stats = [
  { value: "12K+", label: "Happy Users" },
  { value: "500+", label: "Premium Tools" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Real Support" },
];

export const nav = [
  { label: "Tools", to: "/tools" as const },
  { label: "Services", to: "/services" as const },
  { label: "Courses Hub", to: "/courses-hub" as const },
  { label: "SMM Panel", to: "/smm-panel" as const },
  { label: "Giveaways", to: "/giveaways" as const },
  { label: "Affiliate", to: "/affiliate-program" as const },
  { label: "Reviews", to: "/reviews" as const },
];

export const contact = {
  phone: "0310-6991777",
  phoneTel: "+923106991777",
  whatsapp: "https://wa.me/923106991777",
  email: "hello@digitaltoolverse.com",
};

export const brand = {
  name: "Digital ToolVerse",
  nameLeft: "Digital",
  nameRight: "ToolVerse",
  tagline: "Premium AI tools, smart services and growth solutions for creators, students and entrepreneurs.",
};
