import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { priceLabel } from "@/lib/courses";
import { adminListEnrollments, adminSetEnrollmentStatus } from "@/lib/api/courses.functions";

export const Route = createFileRoute("/admin/enrollments")({
  component: EnrollmentsAdmin,
});

type Row = Awaited<ReturnType<typeof adminListEnrollments>>[number];

function EnrollmentsAdmin() {
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
      setRows(await adminListEnrollments({ data: { token } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    const token = await getToken();
    if (!token) return;
    await adminSetEnrollmentStatus({ data: { token, id, status } });
    load();
  };

  const badge = (s: string) =>
    s === "approved" ? "bg-primary/15 text-primary" : s === "rejected" ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Enrollments</h1>
        <p className="text-sm text-muted-foreground">Approve a student after they pay to unlock their course.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="gradient-border rounded-2xl p-10 text-center text-muted-foreground">No enrollment requests yet.</div>
      ) : (
        <div className="gradient-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => {
                const profile = r.profiles as { email?: string; full_name?: string } | null;
                const course = r.courses as { title?: string; price_pkr?: number } | null;
                return (
                  <tr key={r.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{profile?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{profile?.email}</div>
                    </td>
                    <td className="px-4 py-3">{course?.title}</td>
                    <td className="px-4 py-3">{priceLabel(course?.price_pkr ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status !== "approved" && (
                        <Button size="sm" className="bg-primary text-primary-foreground h-8" onClick={() => setStatus(r.id, "approved")}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )}
                      {r.status === "pending" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive ml-1" title="Reject" onClick={() => setStatus(r.id, "rejected")}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {r.status !== "pending" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 ml-1" title="Reset to pending" onClick={() => setStatus(r.id, "pending")}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
