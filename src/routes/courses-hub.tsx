import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Clock, GraduationCap } from "lucide-react";
import { listPublishedCourses, priceLabel, type Course } from "@/lib/courses";

export const Route = createFileRoute("/courses-hub")({
  head: () => ({
    meta: [
      { title: "Courses Hub — Digital ToolVerse" },
      { name: "description", content: "Premium digital courses: Facebook Monetization, Digital Marketing, Amazon Seller, eBay, Facebook Marketing and more. Learn faster, earn more." },
    ],
  }),
  component: CoursesHub,
});

function CoursesHub() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublishedCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Section eyebrow="Courses Hub" title="Learn from" highlight="industry pros" description="Curated, premium courses to help you ship faster and earn more.">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading courses…</p>
        ) : courses.length === 0 ? (
          <div className="gradient-border rounded-2xl p-12 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-primary" />
            <p>No courses published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Link
                key={c.id}
                to="/course/$slug"
                params={{ slug: c.slug }}
                className="group relative gradient-border rounded-2xl p-6 transition hover:-translate-y-1"
              >
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt="" className="mb-4 aspect-video w-full rounded-xl object-cover" />
                ) : (
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <div className="inline-flex items-center gap-1 text-xs text-primary">
                      <BookOpen className="h-3.5 w-3.5" /> Course
                    </div>
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.category}</div>
                <div className="font-semibold text-lg mt-0.5">{c.title}</div>
                {c.subtitle && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.subtitle}</p>}
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> Certificate</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.level}</span>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="font-display text-lg font-bold text-gradient-gold">{priceLabel(c.price_pkr)}</div>
                  <Button size="sm" className="bg-primary text-primary-foreground">View course</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}
