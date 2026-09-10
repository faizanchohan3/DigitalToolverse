import { supabase } from "./supabase/client";

// Client-side course types + reads. These run under RLS with the browser
// (publishable) key, so they only ever see published courses, public
// curriculum, and the current user's own enrollments. Media pointers
// (video_url/video_path/resource_path) are revoked at the DB level and are
// fetched via server functions in courses.functions.ts after an access check.

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  level: string | null;
  price_pkr: number;
  thumbnail_url: string | null;
  published: boolean;
};

// Safe lecture shape for the client (no media pointers).
export type LectureMeta = {
  id: string;
  course_id: string;
  section: string | null;
  title: string;
  description: string | null;
  position: number;
  video_kind: "upload" | "external" | "none";
  is_preview: boolean;
  duration_seconds: number | null;
  resource_name: string | null;
};

export type EnrollmentStatus = "pending" | "approved" | "rejected";

const LECTURE_COLS =
  "id, course_id, section, title, description, position, video_kind, is_preview, duration_seconds, resource_name";

export function priceLabel(pkr: number): string {
  return pkr > 0 ? `PKR ${pkr.toLocaleString()}` : "Free";
}

export async function listPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Course[]) ?? [];
}

export async function getCourseBySlug(
  slug: string,
): Promise<{ course: Course; lectures: LectureMeta[] } | null> {
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!course) return null;

  const { data: lectures } = await supabase
    .from("lectures")
    .select(LECTURE_COLS)
    .eq("course_id", (course as Course).id)
    .order("position");

  return { course: course as Course, lectures: (lectures as LectureMeta[]) ?? [] };
}

export async function getMyEnrollment(courseId: string): Promise<EnrollmentStatus | null> {
  const { data } = await supabase
    .from("enrollments")
    .select("status")
    .eq("course_id", courseId)
    .maybeSingle();
  return (data?.status as EnrollmentStatus) ?? null;
}

// Upload a file directly to Storage using a server-issued signed URL.
// Returns the stored object path (+ public URL for thumbnails).
export async function uploadToStorage(
  bucket: string,
  path: string,
  uploadToken: string,
  file: File,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, uploadToken, file);
  if (error) throw error;
}

export async function requestEnrollment(courseId: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Please sign in first.");
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      { user_id: auth.user.id, course_id: courseId, status: "pending" },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}
