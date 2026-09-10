import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseAdmin } from "../supabase/admin.server";
import { requireAdmin, requireUser } from "./auth.server";

// Server functions for the course platform. Admin mutations run with the
// SECRET (service-role) client and re-verify the caller's token server-side.
// Media URLs (signed video/resource links) are only issued after an access
// check, so raw storage paths and external links never reach unauthorized users.

const VIDEO_BUCKET = "course-videos";
const RESOURCE_BUCKET = "course-resources";
const THUMBNAIL_BUCKET = "course-thumbnails";
const SIGNED_TTL = 60 * 60 * 4; // 4 hours

const BUCKET_BY_KIND = {
  video: VIDEO_BUCKET,
  resource: RESOURCE_BUCKET,
  thumbnail: THUMBNAIL_BUCKET,
} as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// Admin — courses
// ---------------------------------------------------------------------------

export const adminListCourses = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { data: rows, error } = await admin
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetCourse = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string(), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const [{ data: course }, { data: lectures }] = await Promise.all([
      admin.from("courses").select("*").eq("id", data.id).maybeSingle(),
      admin.from("lectures").select("*").eq("course_id", data.id).order("position"),
    ]);
    if (!course) throw new Error("Course not found.");
    return { course, lectures: lectures ?? [] };
  });

export const adminUpsertCourse = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      id: z.string().uuid().optional(),
      title: z.string().min(2),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      level: z.string().optional(),
      price_pkr: z.number().int().min(0),
      thumbnail_url: z.string().optional(),
      published: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { token, id, ...fields } = data;
    const row = {
      ...fields,
      slug: slugify(fields.title) || `course-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { data: updated, error } = await admin
        .from("courses")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }
    const { data: created, error } = await admin.from("courses").insert(row).select().single();
    if (error) throw new Error(error.message);
    return created;
  });

export const adminDeleteCourse = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string(), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("courses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Admin — lectures / episodes
// ---------------------------------------------------------------------------

export const adminUpsertLecture = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      id: z.string().uuid().optional(),
      course_id: z.string().uuid(),
      section: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      position: z.number().int().min(0).optional(),
      video_kind: z.enum(["upload", "external", "none"]),
      video_path: z.string().optional().nullable(),
      video_url: z.string().optional().nullable(),
      resource_path: z.string().optional().nullable(),
      resource_name: z.string().optional().nullable(),
      is_preview: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { token, id, ...fields } = data;
    if (id) {
      const { data: updated, error } = await admin
        .from("lectures")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }
    const { data: created, error } = await admin.from("lectures").insert(fields).select().single();
    if (error) throw new Error(error.message);
    return created;
  });

export const adminDeleteLecture = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string(), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("lectures").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Signed upload URL so the browser uploads large files straight to Storage
// (never proxied through the server). Returns a path + token for uploadToSignedUrl.
export const adminGetUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      kind: z.enum(["video", "resource", "thumbnail"]),
      course_id: z.string(),
      filename: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const bucket = BUCKET_BY_KIND[data.kind];
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${data.course_id}/${Date.now()}-${safeName}`;
    const { data: signed, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const publicUrl =
      data.kind === "thumbnail"
        ? admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
        : null;
    return { bucket, path, token: signed.token, publicUrl };
  });

// ---------------------------------------------------------------------------
// Admin — enrollments
// ---------------------------------------------------------------------------

export const adminListEnrollments = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { data: rows, error } = await admin
      .from("enrollments")
      .select("*, courses(title, slug, price_pkr), profiles(email, full_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetEnrollmentStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      id: z.string().uuid(),
      status: z.enum(["pending", "approved", "rejected"]),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("enrollments")
      .update({
        status: data.status,
        approved_at: data.status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Student — secure media access
// ---------------------------------------------------------------------------

export const getLecturePlayback = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional(), lectureId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();
    const { data: lecture } = await admin
      .from("lectures")
      .select("id, course_id, video_kind, video_path, video_url, is_preview")
      .eq("id", data.lectureId)
      .maybeSingle();
    if (!lecture) throw new Error("Lecture not found.");

    // Preview lectures are open; everything else requires an approved enrollment.
    if (!lecture.is_preview) {
      const user = await requireUser(data.token);
      const { data: allowed } = await admin.rpc("has_course_access", {
        uid: user.id,
        cid: lecture.course_id,
      });
      if (!allowed) throw new Error("Enroll and get approved to watch this lecture.");
    }

    if (lecture.video_kind === "external") {
      return { kind: "external" as const, url: lecture.video_url };
    }
    if (lecture.video_kind === "upload" && lecture.video_path) {
      const { data: signed, error } = await admin.storage
        .from(VIDEO_BUCKET)
        .createSignedUrl(lecture.video_path, SIGNED_TTL);
      if (error) throw new Error(error.message);
      return { kind: "upload" as const, url: signed.signedUrl };
    }
    return { kind: "none" as const, url: null };
  });

export const getResourceUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string(), lectureId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();
    const { data: lecture } = await admin
      .from("lectures")
      .select("course_id, resource_path, resource_name")
      .eq("id", data.lectureId)
      .maybeSingle();
    if (!lecture?.resource_path) throw new Error("No downloadable file for this lecture.");

    const user = await requireUser(data.token);
    const { data: allowed } = await admin.rpc("has_course_access", {
      uid: user.id,
      cid: lecture.course_id,
    });
    if (!allowed) throw new Error("Enroll and get approved to download this file.");

    const { data: signed, error } = await admin.storage
      .from(RESOURCE_BUCKET)
      .createSignedUrl(lecture.resource_path, SIGNED_TTL, {
        download: lecture.resource_name ?? true,
      });
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl, name: lecture.resource_name };
  });
