import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { ShareButtons } from "@/components/public/share-buttons";
import { ArticleContent } from "@/components/public/article-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostBySlug, getPublishedPosts, getCategories } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Eye,
} from "lucide-react";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMIC METADATA (OPEN GRAPH & TWITTER CARDS)
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Berita Tidak Ditemukan - Portal Berita",
      description: "Halaman berita yang Anda cari tidak tersedia.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const articleUrl = `${siteUrl}/berita/${post.slug}`;
  const images = post.cover_image ? [post.cover_image] : [];

  return {
    title: `${post.title} - Portal Berita`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: articleUrl,
      siteName: "Portal Berita Indonesia",
      type: "article",
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.full_name] : ["Redaksi"],
      images: images.map((img) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: post.title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.title,
      images,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const [post, categories, recentPosts] = await Promise.all([
    getPostBySlug(slug),
    getCategories(),
    getPublishedPosts({ limit: 4 }),
  ]);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${siteUrl}/berita/${post.slug}`;

  // 2. JSON-LD STRUCTURED DATA SCHEMA (GOOGLE NEWS & DISCOVER)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
    author: {
      "@type": "Person",
      name: post.author?.full_name || "Redaksi",
      url: post.author ? `${siteUrl}/penulis/${post.author.slug}` : siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Portal Berita Indonesia",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Schema Markup JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNavbar categories={categories} />

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          {post.category && (
            <>
              <Link
                href={`/kategori/${post.category.slug}`}
                className="hover:text-blue-600"
              >
                {post.category.name}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </>
          )}
          <span className="text-slate-800 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 mb-6">
          {post.category && (
            <Badge variant="default" className="text-xs uppercase px-2.5 py-0.5">
              {post.category.name}
            </Badge>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 font-serif leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 font-sans leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Byline Jurnalis & Editor (Google E-E-A-T Credibility) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {post.author?.full_name?.charAt(0) || "W"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    Jurnalis:{" "}
                    {post.author ? (
                      <Link
                        href={`/penulis/${post.author.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {post.author.full_name}
                      </Link>
                    ) : (
                      "Tim Redaksi"
                    )}
                  </span>
                </div>
                {post.editor && (
                  <p className="text-slate-500 text-[11px]">
                    Editor: {post.editor.full_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.views_count.toLocaleString("id-ID")} kali dibaca
              </span>
            </div>
          </div>
        </header>

        {/* Cover Photo & Caption */}
        {post.cover_image && (
          <figure className="mb-8 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full max-h-[500px] object-cover"
            />
            {post.cover_caption && (
              <figcaption className="text-center text-xs text-slate-500 py-2.5 px-4 bg-white border-t border-slate-100 font-sans">
                {post.cover_caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Share Buttons Top */}
        <ShareButtons title={post.title} url={shareUrl} />

        {/* Main Article Content Body */}
        <article className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm my-6">
          <ArticleContent content={post.content} />
        </article>

        {/* Share Buttons Bottom */}
        <ShareButtons title={post.title} url={shareUrl} />

        {/* Journalist Bio Box (Google E-E-A-T) */}
        {post.author && (
          <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 my-8">
            <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
              {post.author.full_name.charAt(0)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="font-bold text-slate-900 text-base">
                  {post.author.full_name}
                </h4>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {post.author.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {post.author.bio ||
                  "Jurnalis berita yang meliput perkembangan peristiwa terkini dengan dedikasi tinggi pada akurasi dan etika jurnalistik."}
              </p>
              <Link
                href={`/penulis/${post.author.slug}`}
                className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Lihat seluruh karya berita penulis →
              </Link>
            </div>
          </div>
        )}

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 font-serif">
            Berita Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentPosts
              .filter((p) => p.id !== post.id)
              .slice(0, 2)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex gap-3"
                >
                  <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={
                        item.cover_image ||
                        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug font-serif">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
