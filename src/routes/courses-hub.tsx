import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Tool } from "@/lib/site-data";
import { useState } from "react";
import {
  BookOpen, Award, Clock, ShoppingBag, Package, LineChart, Sparkles,
  Brain, Megaphone, Palette, Code2, DollarSign, ShoppingCart, Tag, Target, Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/courses-hub")({
  head: () => ({
    meta: [
      { title: "Courses Hub — Digital ToolVerse" },
      { name: "description", content: "Premium digital courses: Facebook Monetization, Digital Marketing, Amazon Seller, eBay, Facebook Marketing, Shopify, Amazon FBA and more. Learn faster, earn more." },
    ],
  }),
  component: CoursesHub,
});

type Course = {
  slug: string;
  title: string;
  desc: string;
  price: string;
  level: string;
  category: string;
  icon: LucideIcon;
  tag?: string;
};

const courses: Course[] = [
  { slug: "facebook-monetization", title: "Facebook Monetization", desc: "Turn pages & reels into payouts — in-stream ads, stars & bonuses.", price: "PKR 5,999", level: "Beginner → Pro", category: "Marketing", icon: DollarSign, tag: "Hot" },
  { slug: "digital-marketing", title: "Digital Marketing Mastery", desc: "SEO, paid ads, funnels & social — a full stack growth system.", price: "PKR 6,499", level: "All levels", category: "Marketing", icon: Megaphone, tag: "New" },
  { slug: "amazon-seller", title: "Amazon Seller Pro", desc: "Source, list, rank & scale a profitable Amazon seller account.", price: "PKR 6,999", level: "All levels", category: "E-commerce", icon: ShoppingCart, tag: "New" },
  { slug: "ebay-selling", title: "eBay Selling Blueprint", desc: "Find winning products and build a steady eBay income stream.", price: "PKR 5,499", level: "Beginner", category: "E-commerce", icon: Tag, tag: "New" },
  { slug: "facebook-marketing", title: "Facebook Marketing Ads", desc: "Master Meta Ads Manager — targeting, creatives & scaling ROAS.", price: "PKR 5,999", level: "All levels", category: "Marketing", icon: Target, tag: "Hot" },

  { slug: "shopify-mastery", title: "Shopify Mastery", desc: "Launch & scale a profitable Shopify store from zero.", price: "PKR 5,499", level: "Beginner → Pro", category: "E-commerce", icon: ShoppingBag },
  { slug: "amazon-fba", title: "Amazon FBA Course", desc: "Source, list and rank winning products on Amazon.", price: "PKR 6,999", level: "All levels", category: "E-commerce", icon: Package },
  { slug: "trading-pro", title: "Trading Pro", desc: "Crypto & forex trading with risk-managed setups.", price: "PKR 7,499", level: "Beginner → Advanced", category: "Business", icon: LineChart },
  { slug: "ai-prompt-engineering", title: "AI Prompt Engineering", desc: "Master prompts for ChatGPT, Claude, Midjourney & more.", price: "PKR 3,999", level: "All levels", category: "AI", icon: Sparkles },
  { slug: "ai-mastery-2026", title: "AI Mastery 2026", desc: "Build AI workflows that 10× your output.", price: "PKR 4,999", level: "Intermediate", category: "AI", icon: Brain },
  { slug: "brand-design-pro", title: "Brand Design Pro", desc: "From logo to identity systems clients love.", price: "PKR 3,499", level: "All levels", category: "Design", icon: Palette },
  { slug: "youtube-growth-os", title: "YouTube Growth OS", desc: "0 → 100K subs with proven systems.", price: "PKR 5,999", level: "Beginner", category: "Marketing", icon: Megaphone },
  { slug: "freelance-blueprint", title: "Freelance Blueprint", desc: "Land high-ticket clients in 30 days.", price: "PKR 4,499", level: "Beginner", category: "Business", icon: Award },
  { slug: "no-code-saas", title: "No-Code SaaS", desc: "Launch a SaaS without writing code.", price: "PKR 6,499", level: "All levels", category: "Dev", icon: Code2 },
];

function courseToTool(c: Course): Tool {
  return { slug: c.slug, name: c.title, tagline: c.desc, price: c.price, category: c.category };
}

function CourseCard({ c }: { c: Course }) {
  const Icon = c.icon;
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isInCart = items.some((item) => item.slug === c.slug);

  const handleEnroll = () => {
    addToCart(courseToTool(c), 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="relative gradient-border rounded-2xl p-6">
      {c.tag && (
        <span className="absolute right-4 top-4 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {c.tag}
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="inline-flex items-center gap-1 text-xs text-primary">
          <BookOpen className="h-3.5 w-3.5" /> Course
        </div>
      </div>
      <div className="font-semibold text-lg">{c.title}</div>
      <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> Certificate</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.level}</span>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="font-display text-lg font-bold text-gradient-gold">{c.price}</div>
        <Button
          size="sm"
          onClick={handleEnroll}
          className={
            justAdded || isInCart
              ? "border border-primary bg-primary/10 text-primary"
              : "bg-primary text-primary-foreground"
          }
        >
          {justAdded ? (
            <><Check className="mr-1 h-3.5 w-3.5" /> Added</>
          ) : isInCart ? (
            "In Cart"
          ) : (
            "Enroll"
          )}
        </Button>
      </div>
    </div>
  );
}

function CoursesHub() {
  return (
    <Layout>
      <Section eyebrow="Courses Hub" title="Learn from" highlight="industry pros" description="Curated, premium courses to help you ship faster and earn more.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.slug} c={c} />
          ))}
        </div>
      </Section>
    </Layout>
  );
}
