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

  // Jika nama kategori default
  const categoryName =
    currentCategory?.name ||
    slug.charAt(0).toUpperCase() + slug.slice(1);

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
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <FolderTree className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Belum ada artikel di rubrik {categoryName}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Naskah berita untuk rubrik ini sedang dalam proses penyusunan oleh redaksi.
            </p>
            <Link href="/">
              <span className="text-xs font-semibold text-blue-600 hover:underline">
                ← Kembali ke Beranda
              </span>
            </Link>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
