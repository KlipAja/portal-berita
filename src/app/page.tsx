import Link from "next/link";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPublishedPosts,
  getBreakingNews,
  getCategories,
} from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  Eye,
  TrendingUp,
  User,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const [posts, breakingNews, categories] = await Promise.all([
    getPublishedPosts({ limit: 12 }),
    getBreakingNews(5),
    getCategories(),
  ]);

  // Data contoh jika database Supabase pengguna masih kosong
  const fallbackHeadlines = [
    {
      id: "f1",
      title: "Transisi Energi Bersih Nasional Capai Rekor Baru di Tahun 2026",
      slug: "transisi-energi-bersih-nasional-capai-rekor-baru",
      excerpt: "Pembangunan pembangkit listrik tenaga surya dan bayu di berbagai provinsi berhasil memasok lebih dari 35 persen kebutuhan listrik nasional.",
      cover_image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      cover_caption: "Foto: Ilustrasi Energi Terbarukan",
      category: { name: "Nasional", slug: "nasional" },
      author: { full_name: "Budi Santoso", slug: "budi-santoso" },
      published_at: new Date().toISOString(),
      views_count: 1420,
    },
    {
      id: "f2",
      title: "Pemerintah Siapkan Regulasi Perlindungan Data Berbasis Kecerdasan Buatan",
      slug: "pemerintah-siapkan-regulasi-ai",
      excerpt: "Regulasi baru ini dirancang untuk memastikan etika pemanfaatan AI sekaligus melindungi privasi warga negara.",
      cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      category: { name: "Teknologi", slug: "teknologi" },
      author: { full_name: "Siti Rahma", slug: "siti-rahma" },
      published_at: new Date().toISOString(),
      views_count: 980,
    },
    {
      id: "f3",
      title: "Pertumbuhan Ekonomi Kuartal Ketiga Tumbuh Solid di Angka 5,2 Persen",
      slug: "pertumbuhan-ekonomi-kuartal-ketiga",
      excerpt: "Konsumsi domestik dan ekspor komoditas hilirisasi menjadi pendorong utama kestabilan fiskal nasional.",
      cover_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      category: { name: "Bisnis", slug: "bisnis" },
      author: { full_name: "Ahmad Fauzi", slug: "ahmad-fauzi" },
      published_at: new Date().toISOString(),
      views_count: 750,
    },
    {
      id: "f4",
      title: "Timnas Garuda Menangi Laga Uji Coba Internasional dengan Skor Meyakinkan",
      slug: "timnas-garuda-menangi-laga-uji-coba",
      excerpt: "Penampilan solid lini pertahanan dan serangan balik cepat memastikan kemenangan 2-0 di hadapan ribuan suporter.",
      cover_image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      category: { name: "Olahraga", slug: "olahraga" },
      author: { full_name: "Budi Santoso", slug: "budi-santoso" },
      published_at: new Date().toISOString(),
      views_count: 2310,
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackHeadlines;
  const mainHeadline = displayPosts[0];
  const secondaryHeadlines = displayPosts.slice(1, 4);
  const latestArticles = displayPosts.slice(4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar categories={categories} breakingNews={breakingNews} />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-12">
        {/* HEADLINE SECTION (HERO GRID) */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <Flame className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase font-sans">
              Sorotan Utama Redaksi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Primary Headline (Large Left) */}
            {mainHeadline && (
              <div className="lg:col-span-7">
                <Link
                  href={`/berita/${mainHeadline.slug}`}
                  className="group block relative rounded-2xl overflow-hidden bg-slate-900 shadow-lg aspect-[16/10] sm:aspect-[16/9]"
                >
                  <img
                    src={
                      mainHeadline.cover_image ||
                      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={mainHeadline.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                    <Badge variant="destructive" className="w-fit mb-3 text-xs uppercase font-bold tracking-wider">
                      {mainHeadline.category?.name || "Nasional"}
                    </Badge>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight font-serif group-hover:text-blue-400 transition-colors">
                      {mainHeadline.title}
                    </h1>
                    {mainHeadline.excerpt && (
                      <p className="text-slate-300 text-xs sm:text-sm mt-2 line-clamp-2 max-w-2xl font-sans">
                        {mainHeadline.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 font-sans">
                      <span className="font-semibold text-slate-200">
                        {mainHeadline.author?.full_name || "Redaksi"}
                      </span>
                      <span>•</span>
                      <span>{formatDate(mainHeadline.published_at)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Secondary Headlines (Right List) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {secondaryHeadlines.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex gap-4 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="w-28 sm:w-36 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={
                        item.cover_image ||
                        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5">
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase mb-1">
                        {item.category?.name || "Umum"}
                      </Badge>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 font-serif leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-2">
                      <span>{item.author?.full_name || "Redaksi"}</span>
                      <span>•</span>
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST NEWS + POPULAR SIDEBAR SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed: Berita Terkini */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Berita Terkini & Analisis
              </h2>
            </div>

            <div className="space-y-4">
              {latestArticles.length > 0 ? (
                latestArticles.map((article: any) => (
                  <Link
                    key={article.id}
                    href={`/berita/${article.slug}`}
                    className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="sm:w-48 aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={
                          article.cover_image ||
                          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Badge variant="outline" className="text-[10px] uppercase mb-1.5">
                          {article.category?.name || "Berita"}
                        </Badge>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 font-serif leading-snug">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-sans">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        <span className="font-medium text-slate-600">
                          {article.author?.full_name || "Redaksi"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                /* Fallback List items */
                fallbackHeadlines.slice(1).map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="sm:w-48 aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Badge variant="outline" className="text-[10px] uppercase mb-1.5">
                          {item.category?.name}
                        </Badge>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 font-serif leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        <span className="font-medium text-slate-600">
                          {item.author?.full_name}
                        </span>
                        <span>•</span>
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Samping: Terpopuler & Banner E-E-A-T */}
          <div className="lg:col-span-4 space-y-6">
            {/* Populer List */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2 pb-3 border-b border-slate-100">
                <TrendingUp className="h-4 w-4 text-red-600" />
                Paling Banyak Dibaca
              </h3>
              <div className="divide-y divide-slate-100">
                {displayPosts.slice(0, 5).map((pop: any, idx: number) => (
                  <Link
                    key={pop.id}
                    href={`/berita/${pop.slug}`}
                    className="group py-3.5 flex items-start gap-3.5 block"
                  >
                    <span className="text-2xl font-black text-slate-300 font-serif group-hover:text-blue-600 transition-colors w-6">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 font-serif line-clamp-2 leading-snug">
                        {pop.title}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {formatDate(pop.published_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Rubrikasi Cepat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight pb-3 border-b border-slate-100">
                Jelajahi Rubrik
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <Link key={c.id} href={`/kategori/${c.slug}`}>
                      <Badge
                        variant="secondary"
                        className="hover:bg-blue-600 hover:text-white cursor-pointer px-3 py-1"
                      >
                        {c.name}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  ["Nasional", "Politik", "Bisnis", "Teknologi", "Olahraga", "Gaya Hidup"].map(
                    (name, i) => (
                      <Link key={i} href={`/kategori/${name.toLowerCase()}`}>
                        <Badge
                          variant="secondary"
                          className="hover:bg-blue-600 hover:text-white cursor-pointer px-3 py-1"
                        >
                          {name}
                        </Badge>
                      </Link>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
