import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { getAuthorBySlug, getPostsByAuthor, getCategories } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import { User, FileText, ChevronRight, ShieldCheck } from "lucide-react";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const [author, categories] = await Promise.all([
    getAuthorBySlug(slug),
    getCategories(),
  ]);

  if (!author) {
    notFound();
  }

  const posts = await getPostsByAuthor(author.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar categories={categories} />

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-800">Jurnalis: {author.full_name}</span>
        </nav>

        {/* Journalist Profile Header Card (Google E-E-A-T) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-md shrink-0">
              {author.full_name.charAt(0)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">
                  {author.full_name}
                </h1>
                <Badge variant="default" className="w-fit mx-auto sm:mx-0 uppercase text-[10px]">
                  {author.role === "reporter" ? "Wartawan / Reporter" : author.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {author.bio ||
                  "Jurnalis berita berlisensi yang berdedikasi meliput peristiwa aktual dengan mematuhi Kode Etik Jurnalistik dan Pedoman Pemberitaan Media Siber."}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Profil Jurnalis Terverifikasi
                </span>
                <span>•</span>
                <span>{posts.length} Karya Berita Diterbitkan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Published Articles List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="h-4 w-4 text-blue-600" />
            Rekam Jejak Berita Karya {author.full_name}
          </h2>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/berita/${post.slug}`}
                  className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex gap-3"
                >
                  <div className="w-28 aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={
                        post.cover_image ||
                        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase mb-1">
                        {post.category?.name || "Berita"}
                      </Badge>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug font-serif">
                        {post.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2">
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
              Belum ada berita yang dipublikasikan oleh jurnalis ini.
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
