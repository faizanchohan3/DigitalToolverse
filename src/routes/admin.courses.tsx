import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { priceLabel } from "@/lib/courses";
import { adminListCourses, adminUpsertCourse, adminDeleteCourse } from "@/lib/api/courses.functions";

export const Route = createFileRoute("/admin/courses")({
  component: CoursesAdmin,
});

type Row = Awaited<ReturnType<typeof adminListCourses>>[number];

function CoursesAdmin() {
  const { getToken } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in.");
      setRows(await adminListCourses({ data: { token } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCourse = async () => {
    const token = await getToken();
    if (!token) return;
    await adminUpsertCourse({
      data: { token, title: "Untitled course", price_pkr: 0, published: false },
    });
    load();
  };

  const togglePublish = async (row: Row) => {
    const token = await getToken();
    if (!token) return;
    await adminUpsertCourse({
      data: {
        token,
        id: row.id,
        title: row.title,
        subtitle: row.subtitle ?? undefined,
        description: row.description ?? undefined,
        category: row.category ?? undefined,
        level: row.level ?? undefined,
        price_pkr: row.price_pkr,
        thumbnail_url: row.thumbnail_url ?? undefined,
        published: !row.published,
      },
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this course and all its lectures? This cannot be undone.")) return;
    const token = await getToken();
    if (!token) return;
    await adminDeleteCourse({ data: { token, id } });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground">Create courses, add episodes, upload videos.</p>
        </div>
        <Button onClick={createCourse} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> New course
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="gradient-border rounded-2xl p-10 text-center text-muted-foreground">
          No courses yet. Click <span className="text-primary">New course</span> to start.
        </div>
      ) : (
        <div className="gradient-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                  <td className="px-4 py-3">{priceLabel(r.price_pkr)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.published ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {r.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title={r.published ? "Unpublish" : "Publish"} onClick={() => togglePublish(r)}>
                      {r.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="Edit">
                      <Link to="/admin/courses/$id" params={{ id: r.id }}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Delete" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
