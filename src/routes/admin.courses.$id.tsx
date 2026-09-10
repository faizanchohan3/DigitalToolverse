import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Upload, Save, GripVertical, Film, Link2, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { uploadToStorage } from "@/lib/courses";
import {
  adminGetCourse,
  adminUpsertCourse,
  adminUpsertLecture,
  adminDeleteLecture,
  adminGetUploadUrl,
} from "@/lib/api/courses.functions";

export const Route = createFileRoute("/admin/courses/$id")({
  component: CourseEditor,
});

type Loaded = Awaited<ReturnType<typeof adminGetCourse>>;
type Course = Loaded["course"];
type Lecture = Loaded["lectures"][number];

function CourseEditor() {
  const { id } = Route.useParams();
  const { getToken } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    const data = await adminGetCourse({ data: { token, id } });
    setCourse(data.course);
    setLectures(data.lectures);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveCourse = async () => {
    if (!course) return;
    setStatus("Saving…");
    const token = await getToken();
    if (!token) return;
    await adminUpsertCourse({
      data: {
        token,
        id: course.id,
        title: course.title,
        subtitle: course.subtitle ?? undefined,
        description: course.description ?? undefined,
        category: course.category ?? undefined,
        level: course.level ?? undefined,
        price_pkr: course.price_pkr,
        thumbnail_url: course.thumbnail_url ?? undefined,
        published: course.published,
      },
    });
    setStatus("Saved ✓");
    setTimeout(() => setStatus(null), 2000);
  };

  const uploadThumbnail = async (file: File) => {
    const token = await getToken();
    if (!token || !course) return;
    setStatus("Uploading thumbnail…");
    const { bucket, path, token: up, publicUrl } = await adminGetUploadUrl({
      data: { token, kind: "thumbnail", course_id: course.id, filename: file.name },
    });
    await uploadToStorage(bucket, path, up, file);
    setCourse({ ...course, thumbnail_url: publicUrl });
    setStatus("Thumbnail uploaded — remember to Save");
  };

  const addLecture = async () => {
    const token = await getToken();
    if (!token || !course) return;
    await adminUpsertLecture({
      data: {
        token,
        course_id: course.id,
        title: "New episode",
        position: lectures.length,
        video_kind: "none",
      },
    });
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!course) return <p className="text-sm text-destructive">Course not found.</p>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/courses"><ArrowLeft className="h-4 w-4 mr-1" /> Courses</Link></Button>
        <div className="flex items-center gap-3">
          {status && <span className="text-xs text-muted-foreground">{status}</span>}
          <Button onClick={saveCourse} className="bg-primary text-primary-foreground"><Save className="h-4 w-4 mr-1" /> Save course</Button>
        </div>
      </div>

      {/* Course details */}
      <section className="gradient-border rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold">Course details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title"><Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} /></Field>
          <Field label="Subtitle"><Input value={course.subtitle ?? ""} onChange={(e) => setCourse({ ...course, subtitle: e.target.value })} /></Field>
          <Field label="Category"><Input value={course.category ?? ""} onChange={(e) => setCourse({ ...course, category: e.target.value })} /></Field>
          <Field label="Level"><Input value={course.level ?? ""} onChange={(e) => setCourse({ ...course, level: e.target.value })} /></Field>
          <Field label="Price (PKR)"><Input type="number" value={course.price_pkr} onChange={(e) => setCourse({ ...course, price_pkr: Number(e.target.value) || 0 })} /></Field>
          <Field label="Thumbnail">
            <div className="flex items-center gap-3">
              {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover" />}
              <UploadButton accept="image/*" label="Upload image" onFile={uploadThumbnail} />
            </div>
          </Field>
        </div>
        <Field label="Description"><Textarea rows={4} value={course.description ?? ""} onChange={(e) => setCourse({ ...course, description: e.target.value })} /></Field>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={course.published} onCheckedChange={(v) => setCourse({ ...course, published: v })} />
          Published (visible on the public site)
        </label>
      </section>

      {/* Episodes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Episodes / Lectures</h2>
          <Button onClick={addLecture} size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Add episode</Button>
        </div>
        {lectures.length === 0 ? (
          <p className="text-sm text-muted-foreground">No episodes yet.</p>
        ) : (
          <div className="space-y-3">
            {lectures.map((lec) => (
              <LectureEditor key={lec.id} courseId={course.id} lecture={lec} onChanged={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function UploadButton({ accept, label, onFile }: { accept: string; label: string; onFile: (f: File) => void | Promise<void> }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()}>
        <Upload className="h-4 w-4 mr-1" /> {label}
      </Button>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </>
  );
}

function LectureEditor({ courseId, lecture, onChanged }: { courseId: string; lecture: Lecture; onChanged: () => void }) {
  const { getToken } = useAuth();
  const [lec, setLec] = useState(lecture);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setLec(lecture), [lecture]);

  const save = async (overrides: Partial<Lecture> = {}) => {
    const token = await getToken();
    if (!token) return;
    const next = { ...lec, ...overrides };
    setMsg("Saving…");
    await adminUpsertLecture({
      data: {
        token,
        id: next.id,
        course_id: courseId,
        section: next.section ?? undefined,
        title: next.title,
        description: next.description ?? undefined,
        position: next.position,
        video_kind: next.video_kind,
        video_path: next.video_path,
        video_url: next.video_url,
        resource_path: next.resource_path,
        resource_name: next.resource_name,
        is_preview: next.is_preview,
      },
    });
    setMsg("Saved ✓");
    setTimeout(() => setMsg(null), 1500);
    onChanged();
  };

  const uploadVideo = async (file: File) => {
    const token = await getToken();
    if (!token) return;
    setMsg("Uploading video… (don't close)");
    const { bucket, path, token: up } = await adminGetUploadUrl({
      data: { token, kind: "video", course_id: courseId, filename: file.name },
    });
    await uploadToStorage(bucket, path, up, file);
    setLec((l: Lecture) => ({ ...l, video_kind: "upload", video_path: path }));
    await save({ video_kind: "upload", video_path: path });
  };

  const uploadResource = async (file: File) => {
    const token = await getToken();
    if (!token) return;
    setMsg("Uploading file…");
    const { bucket, path, token: up } = await adminGetUploadUrl({
      data: { token, kind: "resource", course_id: courseId, filename: file.name },
    });
    await uploadToStorage(bucket, path, up, file);
    setLec((l: Lecture) => ({ ...l, resource_path: path, resource_name: file.name }));
    await save({ resource_path: path, resource_name: file.name });
  };

  const remove = async () => {
    if (!confirm("Delete this episode?")) return;
    const token = await getToken();
    if (!token) return;
    await adminDeleteLecture({ data: { token, id: lec.id } });
    onChanged();
  };

  const kinds: { value: Lecture["video_kind"]; label: string; icon: typeof Film }[] = [
    { value: "upload", label: "Upload video", icon: Film },
    { value: "external", label: "External / YouTube link", icon: Link2 },
    { value: "none", label: "No video (text only)", icon: FileText },
  ];

  return (
    <div className="gradient-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="grid sm:grid-cols-[1fr_8rem] gap-3">
            <Input value={lec.title} placeholder="Episode title" onChange={(e) => setLec({ ...lec, title: e.target.value })} onBlur={() => save()} />
            <Input type="number" value={lec.position} title="Order" onChange={(e) => setLec({ ...lec, position: Number(e.target.value) || 0 })} onBlur={() => save()} />
          </div>
          <Input value={lec.section ?? ""} placeholder="Section (e.g. Module 1)" onChange={(e) => setLec({ ...lec, section: e.target.value })} onBlur={() => save()} />

          {/* Video source selector */}
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <Button key={k.value} type="button" size="sm" variant={lec.video_kind === k.value ? "default" : "outline"}
                className={lec.video_kind === k.value ? "bg-primary text-primary-foreground" : ""}
                onClick={() => save({ video_kind: k.value })}>
                <k.icon className="h-3.5 w-3.5 mr-1" /> {k.label}
              </Button>
            ))}
          </div>

          {lec.video_kind === "external" && (
            <Input value={lec.video_url ?? ""} placeholder="https://youtube.com/watch?v=…" onChange={(e) => setLec({ ...lec, video_url: e.target.value })} onBlur={() => save()} />
          )}
          {lec.video_kind === "upload" && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <UploadButton accept="video/*" label={lec.video_path ? "Replace video" : "Upload video"} onFile={uploadVideo} />
              {lec.video_path && <span className="truncate">✓ video attached</span>}
            </div>
          )}

          {/* Downloadable resource */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <UploadButton accept="*/*" label={lec.resource_path ? "Replace file" : "Attach downloadable file"} onFile={uploadResource} />
            {lec.resource_name && <span className="truncate">📎 {lec.resource_name}</span>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={lec.is_preview} onCheckedChange={(v) => save({ is_preview: v })} />
              Free preview
            </label>
            <div className="flex items-center gap-3">
              {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
