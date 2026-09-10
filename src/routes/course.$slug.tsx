import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Lock, PlayCircle, Download, CheckCircle2, Clock, BookOpen, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { contact } from "@/lib/site-data";
import {
  getCourseBySlug,
  getMyEnrollment,
  requestEnrollment,
  priceLabel,
  type Course,
  type LectureMeta,
  type EnrollmentStatus,
} from "@/lib/courses";
import { getLecturePlayback, getResourceUrl } from "@/lib/api/courses.functions";

export const Route = createFileRoute("/course/$slug")({
  component: CoursePage,
});

function toEmbed(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function CoursePage() {
  const { slug } = Route.useParams();
  const { user, isAdmin, getToken } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<LectureMeta[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LectureMeta | null>(null);
  const [playback, setPlayback] = useState<{ kind: string; url: string | null } | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const hasAccess = isAdmin || enrollment === "approved";

  const load = async () => {
    const data = await getCourseBySlug(slug);
    if (!data) {
      setLoading(false);
      return;
    }
    setCourse(data.course);
    setLectures(data.lectures);
    setActive(data.lectures[0] ?? null);
    if (user) setEnrollment(await getMyEnrollment(data.course.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

  // Load playback for the active lecture whenever access or selection changes.
  useEffect(() => {
    setPlayback(null);
    setPlaybackError(null);
    if (!active) return;
    const canPlay = hasAccess || active.is_preview;
    if (!canPlay || active.video_kind === "none") return;
    (async () => {
      try {
        const token = await getToken();
        const res = await getLecturePlayback({ data: { token, lectureId: active.id } });
        setPlayback(res);
      } catch (e) {
        setPlaybackError(e instanceof Error ? e.message : "Cannot load video.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, hasAccess]);

  const sections = useMemo(() => {
    const map = new Map<string, LectureMeta[]>();
    for (const l of lectures) {
      const k = l.section || "Course Content";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(l);
    }
    return [...map.entries()];
  }, [lectures]);

  const enroll = async () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/course/${slug}` } });
      return;
    }
    setBusy(true);
    try {
      await requestEnrollment(course!.id);
      setEnrollment("pending");
      openWhatsApp();
    } finally {
      setBusy(false);
    }
  };

  const openWhatsApp = () => {
    if (!course) return;
    const msg = `Hi Digital ToolVerse! I want to enroll in "${course.title}" (${priceLabel(course.price_pkr)}). My account email: ${user?.email ?? ""}. How do I pay?`;
    window.open(`${contact.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const download = async (lectureId: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const { url } = await getResourceUrl({ data: { token, lectureId } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed.");
    }
  };

  if (loading) {
    return <Layout><div className="mx-auto max-w-5xl px-4 py-24 text-center text-muted-foreground">Loading…</div></Layout>;
  }
  if (!course) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Course not found</h1>
          <Button asChild className="mt-4"><Link to="/courses-hub">Browse courses</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid lg:grid-cols-[1fr_22rem] gap-8">
        {/* Main */}
        <div className="space-y-6 min-w-0">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary">{course.category}</div>
            <h1 className="font-display text-3xl font-bold mt-1">{course.title}</h1>
            {course.subtitle && <p className="text-muted-foreground mt-2">{course.subtitle}</p>}
          </div>

          {/* Player */}
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black/80 grid place-items-center">
            {!active ? (
              <span className="text-sm text-muted-foreground">No episodes yet.</span>
            ) : !(hasAccess || active.is_preview) ? (
              <div className="text-center text-muted-foreground p-6">
                <Lock className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">This episode is locked. Enroll to unlock the full course.</p>
              </div>
            ) : active.video_kind === "none" ? (
              <div className="text-center text-muted-foreground p-6"><BookOpen className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Text lesson — see notes below.</p></div>
            ) : playbackError ? (
              <p className="text-sm text-destructive p-6">{playbackError}</p>
            ) : !playback ? (
              <span className="text-sm text-muted-foreground">Loading video…</span>
            ) : playback.kind === "external" && playback.url ? (
              <iframe src={toEmbed(playback.url)} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={active.title} />
            ) : playback.url ? (
              <video src={playback.url} controls controlsList="nodownload" className="h-full w-full" />
            ) : (
              <span className="text-sm text-muted-foreground">Video unavailable.</span>
            )}
          </div>

          {active && (
            <div>
              <h2 className="font-semibold text-lg">{active.title}</h2>
              {/* Only the headline shows when locked; notes/description unlock after approval */}
              {hasAccess || active.is_preview ? (
                <>
                  {active.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{active.description}</p>}
                  {active.resource_name && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => download(active.id)}>
                      <Download className="h-4 w-4 mr-1" /> Download {active.resource_name}
                    </Button>
                  )}
                </>
              ) : (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Enroll and get approved to watch this episode and access its notes & downloads.
                </p>
              )}
            </div>
          )}

          {course.description && (
            <div className="gradient-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">About this course</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="gradient-border rounded-2xl p-5">
            {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="rounded-xl mb-4 w-full object-cover aspect-video" />}
            <div className="font-display text-2xl font-bold text-gradient-gold">{priceLabel(course.price_pkr)}</div>

            {hasAccess ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" /> {isAdmin ? "Admin access" : "You're enrolled — full access"}
              </div>
            ) : enrollment === "pending" ? (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" /> Request received — pending payment approval.
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={openWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-1" /> Pay via WhatsApp
                </Button>
              </div>
            ) : enrollment === "rejected" ? (
              <p className="mt-3 text-sm text-destructive">Your previous request was declined. Contact support.</p>
            ) : (
              <Button className="mt-3 w-full bg-primary text-primary-foreground" disabled={busy} onClick={enroll}>
                {busy ? "Please wait…" : "Enroll now"}
              </Button>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{course.level} · {lectures.length} episodes</p>
          </div>

          {/* Curriculum */}
          <div className="gradient-border rounded-2xl p-4">
            <div className="font-semibold text-sm px-1 mb-2">Course content</div>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto">
              {sections.map(([name, items]) => (
                <div key={name}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground px-1 mb-1">{name}</div>
                  <ul className="space-y-0.5">
                    {items.map((l) => {
                      const locked = !(hasAccess || l.is_preview);
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => setActive(l)}
                            className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${active?.id === l.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                          >
                            {locked ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <PlayCircle className="h-3.5 w-3.5 shrink-0 text-primary" />}
                            <span className="truncate flex-1">{l.title}</span>
                            {l.is_preview && !hasAccess && <span className="text-[10px] text-primary">Preview</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
