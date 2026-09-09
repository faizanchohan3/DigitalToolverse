import orbitCore from "@/assets/orbit-core.png";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { tools } from "@/lib/site-data";

type OrbitItem = { name: string; logo: string };

const logoFor = (slug: string): OrbitItem => {
  const t = tools.find((x) => x.slug === slug);
  return { name: t?.name ?? slug, logo: t?.logo ?? "" };
};

const ring1: OrbitItem[] = [
  logoFor("chatgpt-plus"),
  logoFor("canva-pro"),
  logoFor("claude"),
  logoFor("perplexity"),
  logoFor("adobe-cc"),
  logoFor("office-365"),
];

const ring2: OrbitItem[] = [
  logoFor("figma"),
  logoFor("midjourney"),
  logoFor("notion"),
  logoFor("grammarly"),
  logoFor("coursera"),
  logoFor("elevenlabs"),
  logoFor("cursor"),
];

function Orbit({
  size,
  duration,
  reverse,
  items,
}: {
  size: number;
  duration: string;
  reverse?: boolean;
  items: OrbitItem[];
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full border border-primary/15"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        animation: `${reverse ? "spin-reverse" : "spin-slow"} ${duration} linear infinite`,
      }}
    >
      {items.map((it, i) => {
        const angle = (360 / items.length) * i;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${angle}deg) translateX(${size / 2}px) rotate(-${angle}deg)` }}
          >
            <div
              className="grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-card)] ring-1 ring-black/5"
              style={{ animation: `${reverse ? "spin-slow" : "spin-reverse"} ${duration} linear infinite` }}
            >
              <img
                src={it.logo}
                alt={`${it.name} logo`}
                loading="lazy"
                className="h-7 w-7 rounded-full object-contain"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrbitHero() {
  return (
    <section className="relative overflow-hidden bg-aurora">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
            <Shield className="h-3.5 w-3.5" />
            The No.1 Trusted Digital Store Worldwide
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Dominate the digital world{" "}
            <span className="text-gradient-gold">with premium tools</span>.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
            Powerful AI tools, growth services and curated courses — all in one
            place. Built for creators, students, YouTubers and entrepreneurs
            who refuse to settle for less.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/tools">
                Explore Our Tools <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10">
              <Link to="/services">Our Services</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 pt-4 text-sm">
            <div><span className="font-display text-2xl text-gradient-gold font-bold">12K+</span><div className="text-muted-foreground">Happy users</div></div>
            <div><span className="font-display text-2xl text-gradient-gold font-bold">500+</span><div className="text-muted-foreground">Premium tools</div></div>
            <div><span className="font-display text-2xl text-gradient-gold font-bold">24/7</span><div className="text-muted-foreground">Real support</div></div>
          </div>
        </div>

        {/* Orbit visual */}
        <div className="relative aspect-square w-full max-w-[560px] mx-auto">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
          <img
            src={orbitCore}
            alt="Digital ToolVerse energy core"
            className="absolute inset-0 m-auto h-2/3 w-2/3 object-contain animate-float"
            width={1024}
            height={1024}
          />
          <Orbit size={340} duration="38s" items={ring1} />
          <Orbit size={500} duration="55s" reverse items={ring2} />
        </div>
      </div>
    </section>
  );
}
