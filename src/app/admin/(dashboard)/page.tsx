import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PenSquare,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Ambil user aktif
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil profil user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user?.id || "")
    .single();

  const role = profile?.role || "reporter";

  // Ambil data statistik artikel
  const { count: draftCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: reviewCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_review");

  const { count: publishedCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // Ambil artikel terbaru
  const { data: recentPosts } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      status,
      views_count,
      created_at,
      published_at,
      category:categories(name),
      author:profiles!posts_author_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Tayang</Badge>;
      case "in_review":
        return <Badge variant="warning">Dalam Review</Badge>;
      case "draft":
        return <Badge variant="secondary">Draf</Badge>;
      case "archived":
        return <Badge variant="destructive">Arsip</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Halo, {profile?.full_name || "Rekan Redaksi"}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "reporter"
              ? "Tulis liputan berita baru dan ajukan draf ke meja redaktur."
              : "Tinjau draf artikel liputan wartawan dan kelola publikasi berita."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts/new">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <PenSquare className="h-4 w-4" />
              <span>Tulis Berita Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Draf Saya
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{draftCount ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Belum diajukan ke editor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              Antrean Review
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{reviewCount ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Menunggu persetujuan redaktur</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Berita Tayang
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{publishedCount ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Aktif di portal berita publik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              Total Pembaca
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Eye className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500 mt-1">Akumulasi pembaca artikel</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Aktivitas Berita Terkini</CardTitle>
            <CardDescription>
              Daftar naskah berita yang baru saja dibuat atau disunting.
            </CardDescription>
          </div>
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-blue-600">
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPosts && recentPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Judul Berita</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPosts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {post.category?.name || "Umum"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {post.author?.full_name || "-"}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(post.status)}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/posts/edit/${post.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                            Sunting
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Belum ada naskah berita</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Mulai buat artikel berita pertama Anda menggunakan editor WYSIWYG.
              </p>
              <Link href="/admin/posts/new">
                <Button size="sm" className="bg-blue-600 text-white">
                  Mulai Menulis Berita
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
