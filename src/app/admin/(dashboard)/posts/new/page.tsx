"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Category } from "@/types/news";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [coverCaption, setCoverCaption] = useState("");
  const [isHeadline, setIsHeadline] = useState(false);
  const [isBreakingNews, setIsBreakingNews] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("reporter");

  // Generate slug otomatis dari judul jika tidak diedit manual
  useEffect(() => {
    if (!isManualSlug) {
      setSlug(generateSlug(title));
    }
  }, [title, isManualSlug]);

  // Load kategori & role pengguna
  useEffect(() => {
    async function loadInitialData() {
      const supabase = createClient();

      // Kategori
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (catData) setCategories(catData);

      // User role
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
    }
    loadInitialData();
  }, []);

  const handleSavePost = async (targetStatus: "draft" | "in_review" | "published") => {
    if (!title.trim()) {
      setErrorMsg("Judul berita wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Sesi login Anda telah berakhir. Silakan login kembali.");
      setLoading(false);
      return;
    }

    const payload: any = {
      title,
      slug: slug || generateSlug(title),
      excerpt: excerpt || null,
      content,
      cover_image: coverImage || null,
      cover_caption: coverCaption || null,
      category_id: categoryId || null,
      status: targetStatus,
      is_headline: isHeadline,
      is_breaking_news: isBreakingNews,
      author_id: user.id,
    };

    if (targetStatus === "published") {
      payload.published_at = new Date().toISOString();
      payload.editor_id = user.id;
    }

    const { error } = await supabase.from("posts").insert([payload]);

    if (error) {
      setErrorMsg(error.message || "Gagal menyimpan artikel berita.");
      setLoading(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Tulis Naskah Berita Baru
            </h1>
            <p className="text-xs text-slate-500">
              Gunakan kaidah jurnalistik 5W+1H dan sertakan sumber foto liputan.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSavePost("draft")}
            className="flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Draf</span>
          </Button>

          {userRole === "reporter" ? (
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={() => handleSavePost("in_review")}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Ajukan ke Redaktur</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={() => handleSavePost("published")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Terbitkan Berita</span>
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title & Rich Text Content */}
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
              placeholder="Contoh: Pemerintah Resmikan Jalur Transportasi Baru..."
              className="w-full px-4 py-2.5 text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL (SEO Friendly)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">/berita/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsManualSlug(true);
                  setSlug(e.target.value);
                }}
                placeholder="pemerintah-resmikan-jalur-baru"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Berita (Lead Paragraph / Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Paragraf pembuka ringkas untuk preview berita dan meta description Google..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Isi Naskah Berita (WYSIWYG Editor) *
            </label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Column: Metadata, Photo & Category Settings */}
        <div className="space-y-4">
          {/* Category Card */}
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

          {/* Cover Image Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Foto Utama Liputan
            </h3>
            <div>
              <label className="block text-xs text-slate-600 mb-1">URL Foto Berita</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Kredit Foto / Caption</label>
              <input
                type="text"
                value={coverCaption}
                onChange={(e) => setCoverCaption(e.target.value)}
                placeholder="Foto: ANTARA / Nama Fotografer"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative">
                {/* Preview Image */}
                <img
                  src={coverImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Editorial Badges (Only for Editor/Admin) */}
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
                Tampilkan di Banner Breaking News
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
