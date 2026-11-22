"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSlug, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Category, EditorialReview } from "@/types/news";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [coverCaption, setCoverCaption] = useState("");
  const [isHeadline, setIsHeadline] = useState(false);
  const [isBreakingNews, setIsBreakingNews] = useState(false);
  const [status, setStatus] = useState<string>("draft");

  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("reporter");

  useEffect(() => {
    async function loadPostData() {
      const supabase = createClient();

      // Load user role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }

      // Load categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (catData) setCategories(catData);

      // Load post data
      const { data: post, error } = await supabase
        .from("posts")
        .select("*, editorial_reviews(*)")
        .eq("id", id)
        .single();

      if (error || !post) {
        setErrorMsg("Artikel berita tidak ditemukan atau Anda tidak memiliki akses.");
        setLoading(false);
        return;
      }

      setTitle(post.title || "");
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content);
      setCategoryId(post.category_id || "");
      setCoverImage(post.cover_image || "");
      setCoverCaption(post.cover_caption || "");
      setIsHeadline(post.is_headline || false);
      setIsBreakingNews(post.is_breaking_news || false);
      setStatus(post.status);
      if (post.editorial_reviews) {
        setReviews(post.editorial_reviews);
      }

      setLoading(false);
    }

    loadPostData();
  }, [id]);

  const handleUpdate = async (targetStatus?: string) => {
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload: any = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage || null,
      cover_caption: coverCaption || null,
      category_id: categoryId || null,
      is_headline: isHeadline,
      is_breaking_news: isBreakingNews,
      updated_at: new Date().toISOString(),
    };

    if (targetStatus) {
      payload.status = targetStatus;
      if (targetStatus === "published") {
        payload.published_at = new Date().toISOString();
        if (user) payload.editor_id = user.id;
      }
    }

    const { error } = await supabase.from("posts").update(payload).eq("id", id);

    if (error) {
      setErrorMsg(error.message || "Gagal memperbarui naskah berita.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/admin/posts");
    router.refresh();
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      alert("Harap tuliskan catatan revisi untuk jurnalis.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Simpan catatan review ke editorial_reviews
    await supabase.from("editorial_reviews").insert([
      {
        post_id: id,
        reviewer_id: user.id,
        action: "revision_requested",
        notes: revisionNotes,
      },
    ]);

    // 2. Kembalikan status berita ke draft
    await supabase
      .from("posts")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", id);

    setSaving(false);
    setShowRevisionModal(false);
    router.push("/admin/posts");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Memuat naskah berita...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {userRole === "reporter" ? "Sunting Naskah Liputan" : "Review & Sunting Naskah"}
              </h1>
              <Badge variant="outline" className="text-xs uppercase">
                {status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              ID Naskah: <span className="font-mono">{id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons based on Role */}
        <div className="flex items-center gap-2">
          {/* Simpan Perubahan Biasa */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => handleUpdate()}
            className="flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Simpan</span>
          </Button>

          {/* Reporter Action: Kirim ke Redaktur */}
          {userRole === "reporter" && status === "draft" && (
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => handleUpdate("in_review")}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Ajukan ke Redaktur</span>
            </Button>
          )}

          {/* Editor/Admin Actions: Minta Revisi / Terbitkan */}
          {(userRole === "editor" || userRole === "admin") && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setShowRevisionModal(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Minta Revisi</span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => handleUpdate("published")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Terbitkan Sekarang</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Revision History Box if any */}
      {reviews.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Catatan Revisi Redaksi ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-800">
                <p className="font-semibold text-slate-900 mb-1">{rev.notes}</p>
                <span className="text-[10px] text-slate-400">
                  {formatDate(rev.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Berita Utama *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Berita (Lead Paragraph)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Isi Naskah Berita *
            </label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Settings */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              Kategori Berita
            </h3>
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
            >
              <option value="">Pilih Kategori...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Foto Utama Liputan
            </h3>
            <div>
              <label className="block text-xs text-slate-600 mb-1">URL Foto</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Kredit Foto / Caption</label>
              <input
                type="text"
                value={coverCaption}
                onChange={(e) => setCoverCaption(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            {coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {(userRole === "admin" || userRole === "editor") && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Pengaturan Penempatan
              </h3>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHeadline}
                  onChange={(e) => setIsHeadline(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Jadikan Berita Utama (Headline)
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreakingNews}
                  onChange={(e) => setIsBreakingNews(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                Tampilkan di Breaking News Banner
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Modal Catatan Revisi */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              Catatan Koreksi & Revisi Redaksi
            </h3>
            <p className="text-xs text-slate-500">
              Tuliskan poin perbaikan (misal: verifikasi narasumber, koreksi judul, atau penambahan data). Naskah akan dikembalikan ke status Draf jurnalis.
            </p>

            <textarea
              rows={4}
              required
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Contoh: Harap tambahkan konfirmasi dari pihak kepolisian di alinea ketiga..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevisionModal(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={saving}
                onClick={handleRequestRevision}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving ? "Mengirim..." : "Kirim Catatan Revisi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
