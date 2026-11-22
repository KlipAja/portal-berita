import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PenSquare,
  Filter,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostsPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
  }>;
}

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const { status, category } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();

  const role = profile?.role || "reporter";

  // Query artikel
  let query = supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      status,
      views_count,
      is_headline,
      is_breaking_news,
      created_at,
      published_at,
      category:categories(name, slug),
      author:profiles!posts_author_id_fkey(full_name, id)
    `)
    .order("created_at", { ascending: false });

  // Filter role: jika reporter, utamakan melihat artikel miliknya
  if (role === "reporter" && user) {
    query = query.eq("author_id", user.id);
  }

  // Filter status jika dipilih di URL
  if (status && ["draft", "in_review", "published", "archived"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: posts } = await query;

  // Hitung jumlah per status untuk filter tab
  const { count: countAll } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: countDraft } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: countReview } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_review");

  const { count: countPublished } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const getStatusBadge = (postStatus: string) => {
    switch (postStatus) {
      case "published":
        return <Badge variant="success">Tayang</Badge>;
      case "in_review":
        return <Badge variant="warning">Dalam Review</Badge>;
      case "draft":
        return <Badge variant="secondary">Draf</Badge>;
      case "archived":
        return <Badge variant="destructive">Arsip</Badge>;
      default:
        return <Badge variant="outline">{postStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {role === "reporter" ? "Naskah Berita Saya" : "Manajemen Naskah Redaksi"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === "reporter"
              ? "Kelola naskah tulisan liputan Anda dan pantau status review dari redaktur."
              : "Tinjau, koreksi naskah wartawan, dan kelola penerbitan berita."}
          </p>
        </div>

        <Link href="/admin/posts/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5">
            <PenSquare className="h-4 w-4" />
            <span>Tulis Berita Baru</span>
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Link href="/admin/posts">
          <Button
            variant={!status ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
          >
            Semua ({countAll ?? 0})
          </Button>
        </Link>

        <Link href="/admin/posts?status=draft">
          <Button
            variant={status === "draft" ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
          >
            Draf ({countDraft ?? 0})
          </Button>
        </Link>

        <Link href="/admin/posts?status=in_review">
          <Button
            variant={status === "in_review" ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Dalam Review ({countReview ?? 0})
          </Button>
        </Link>

        <Link href="/admin/posts?status=published">
          <Button
            variant={status === "published" ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            Sudah Tayang ({countPublished ?? 0})
          </Button>
        </Link>
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {posts && posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Judul Berita</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Pembaca</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="font-semibold text-slate-900 truncate">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400 font-mono">
                              /{post.slug}
                            </span>
                            {post.is_headline && (
                              <Badge variant="default" className="text-[9px] px-1 py-0">
                                Headline
                              </Badge>
                            )}
                            {post.is_breaking_news && (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                Breaking
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {post.category?.name || "Umum"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {post.author?.full_name || "-"}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(post.status)}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {post.views_count.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/posts/edit/${post.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2.5 flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>{role === "reporter" ? "Edit" : "Review"}</span>
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Tidak ada naskah berita pada filter ini
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Ubah filter status atau buat naskah berita baru.
              </p>
              <Link href="/admin/posts/new">
                <Button size="sm" className="bg-blue-600 text-white">
                  Tulis Berita Baru
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
