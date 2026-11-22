import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { getPublishedPosts, getCategories } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import { FolderTree, ChevronRight } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPublishedPosts({ categorySlug: slug, limit: 20 }),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const categoryName =
    currentCategory?.name ||
    slug.charAt(0).toUpperCase() + slug.slice(1);

  // Fallback demo posts jika database masih kosong
  const fallbackCategoryPosts = [
    {
      id: `cat-${slug}-1`,
      title: `Sorotan Terkini Rubrik ${categoryName}: Dinamika Perkembangan dan Analisis Mendalam`,
      slug: `sorotan-terkini-rubrik-${slug}`,
      excerpt: `Laporan komprehensif dari meja redaksi mengenai peristiwa terhangat seputar ${categoryName} yang patut Anda cermati hari ini.`,
      cover_image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
      published_at: "2026-11-23T10:00:00.000Z",
      author: { full_name: "Tim Redaksi" },
    },
    {
      id: `cat-${slug}-2`,
      title: `Kebijakan dan Tantangan Baru di Sektor ${categoryName} Menjelang Akhir Tahun`,
      slug: `kebijakan-dan-tantangan-baru-${slug}`,
      excerpt: `Wawancara eksklusif bersama para pakar dan pemangku kepentingan mengenai prospek pertumbuhan di sektor ini.`,
      cover_image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80",
      published_at: "2026-11-23T08:30:00.000Z",
      author: { full_name: "Budi Santoso" },
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackCategoryPosts;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar categories={categories} />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-800">Rubrik: {categoryName}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 mb-8 shadow-sm">
          <Badge variant="default" className="text-xs uppercase mb-2">
            Rubrik Berita
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl">
            {currentCategory?.description ||
              `Kumpulan liputan berita terkini, peristiwa hangat, dan analisis terpercaya seputar ${categoryName}.`}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/berita/${post.slug}`}
              className="group flex flex-col justify-between bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div>
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={
                      post.cover_image ||
                      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 font-serif leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-sans">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>{post.author?.full_name || "Redaksi"}</span>
                <span>{formatDate(post.published_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
