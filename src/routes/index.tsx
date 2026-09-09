import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { OrbitHero } from "@/components/site/OrbitHero";
import { Marquee } from "@/components/site/Marquee";
import { Section } from "@/components/site/Section";
import { ToolCard } from "@/components/site/ToolCard";
import { CardSlider } from "@/components/site/CardSlider";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { Button } from "@/components/ui/button";
import { tools, services, stats } from "@/lib/site-data";
import {
  ArrowRight, Zap, ShieldCheck, Sparkles, Headphones, Gift,
  TrendingUp, Users, Crown, Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital ToolVerse — Premium AI Tools, Services & Growth" },
      { name: "description", content: "Premium AI tools, smart services and growth solutions for creators, students and entrepreneurs. Trusted by 12,000+ users worldwide." },
      { property: "og:title", content: "Digital ToolVerse — Premium AI Tools, Services & Growth" },
      { property: "og:description", content: "Premium AI tools, services and courses — all in one place." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Layout>
      <OrbitHero />
      <Marquee />

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <CardSlider gridClassName="sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Headphones, title: "24/7 Support", desc: "Real humans, no delays, no hassle." },
            { icon: Users, title: "12K+ Network", desc: "Satisfied creators & entrepreneurs." },
            { icon: ShieldCheck, title: "500+ Tools", desc: "Premium verified products." },
            { icon: Zap, title: "Instant Delivery", desc: "Activate in minutes, not days." },
          ].map((v, i) => (
            <div key={i} className="gradient-border rounded-2xl p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary mb-3">
                <v.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold">{v.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
            </div>
          ))}
        </CardSlider>
      </section>

      {/* Tools */}
      <Section
        eyebrow="Our Collection"
        title="Discover powerful"
        highlight="tools"
        description="Browse top AI & digital tools handpicked to help you work smarter and achieve more."
        action={
          <Button asChild variant="outline" className="border-primary/40 hover:bg-primary/10">
            <Link to="/tools">View all tools <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        }
      >
        <CardSlider gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.slice(0, 8).map((t) => <ToolCard key={t.slug} tool={t} />)}
        </CardSlider>
      </Section>

      {/* Services grid */}
      <Section
        eyebrow="What We Offer"
        title="Explore all our services in"
        highlight="one place"
        description="Everything you need to build, grow and scale — under one premium roof."
        action={
          <Button asChild variant="outline" className="border-primary/40 hover:bg-primary/10">
            <Link to="/services">View all services <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        }
      >
        <ServicesGrid>
          {services.map((s, i) => (
            <Link
              key={s.slug}
              to={`/${s.slug}` as "/tools"}
              className="group gradient-border rounded-2xl p-6 hover:-translate-y-1 transition"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground mb-4 font-display font-bold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-semibold mb-1">{s.title}</div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              <div className="mt-4 text-xs text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </ServicesGrid>
      </Section>

      {/* Giveaway CTA */}
      <section id="giveaway-cta" className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="relative overflow-hidden rounded-3xl gradient-border p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Gift className="h-4 w-4" /> Giveaways
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-bold">
              Grab hidden <span className="text-gradient-gold">digital assets</span> worth $100+ — free.
            </h3>
            <p className="text-muted-foreground max-w-lg">
              A private collection of premium tools, courses and resources — unlocked in seconds.
              No forms, no waiting. Just follow a few simple steps.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/giveaways">Get Free Access <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-primary/40 hover:bg-primary/10">
                <Link to="/courses-hub">Courses Hub</Link>
              </Button>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { icon: Crown, label: "Private Access", note: "Members only" },
              { icon: Sparkles, label: "Handpicked", note: "High-value resources" },
              { icon: Zap, label: "Instant Unlock", note: "No delays" },
              { icon: ShieldCheck, label: "Safe & Secure", note: "No shady redirects" },
            ].map((it, i) => (
              <div key={i} className="rounded-2xl bg-surface/60 border border-border/60 p-4">
                <it.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm font-semibold">{it.label}</div>
                <div className="text-xs text-muted-foreground">{it.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SMM panel */}
      <Section
        id="smm"
        eyebrow="SMM Panel"
        title="More reach. Real growth."
        highlight="Instantly."
        description="Real followers, likes, views and engagement across every major platform — delivered fast, securely, and at scale."
      >
        <ServicesGrid>
          {["Instagram", "YouTube", "TikTok", "Facebook", "X (Twitter)", "WhatsApp"].map((p) => (
            <div key={p} className="gradient-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="font-semibold">{p}</div>
              </div>
              <p className="text-sm text-muted-foreground">Followers, views, likes & engagement — fast and reliable delivery.</p>
              <div className="mt-4 flex gap-2 text-xs">
                <span className="rounded-full bg-secondary px-2 py-1">Fast Delivery</span>
                <span className="rounded-full bg-secondary px-2 py-1">Refill Guarantee</span>
              </div>
            </div>
          ))}
        </ServicesGrid>
        <div className="mt-10 grid sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center rounded-2xl bg-surface/60 border border-border/60 p-6">
              <div className="font-display text-3xl font-bold text-gradient-gold">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section
        id="testimonials"
        eyebrow="Top Rated"
        title="Loved by creators"
        highlight="worldwide"
        description="Real stories from creators, students and founders who scaled with Digital ToolVerse."
      >
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Hamza R.", role: "YouTuber, 240K", quote: "Got Canva Pro and ChatGPT in minutes. Quality is unreal at this price." },
            { name: "Ayesha K.", role: "Designer", quote: "Adobe CC + Envato bundle saved me thousands. Support replied at 2 AM." },
            { name: "Bilal M.", role: "Indie founder", quote: "SMM panel actually delivers. Real engagement, not bots. Highly recommend." },
          ].map((t, i) => (
            <div key={i} className="gradient-border rounded-2xl p-6">
              <div className="flex gap-1 mb-3 text-primary">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm">"{t.quote}"</p>
              <div className="mt-4 text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section id="whatsapp-help" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="rounded-3xl gradient-border p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.82_0.17_80/0.25),transparent_70%)]" />
          <div className="relative">
            <h3 className="font-display text-3xl sm:text-5xl font-bold">
              Ready to <span className="text-gradient-gold">level up?</span>
            </h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join 12,000+ creators using premium tools at unbeatable prices.
              Real support, instant delivery, zero risk.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/tools">Start Exploring</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
                <Link to="/affiliate-program">Join Affiliate Program</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
