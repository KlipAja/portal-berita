import { createClient as createServerClient } from "@/lib/supabase/server";
import { Post, Category, Tag, UserProfile, EditorialReview } from "@/types/news";

/**
 * Mengambil daftar berita yang sudah tayang (Published) untuk tampilan publik
 */
export async function getPublishedPosts({
  limit = 10,
  categorySlug,
  tagSlug,
  isHeadline,
}: {
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  isHeadline?: boolean;
} = {}): Promise<Post[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*),
      category:categories(*),
      editor:profiles!posts_editor_id_fkey(*)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (isHeadline !== undefined) {
    query = query.eq("is_headline", isHeadline);
  }

  if (categorySlug) {
    query = query.eq("category.slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching published posts:", error);
    return [];
  }

  return (data as Post[]) || [];
}

/**
 * Mengambil satu artikel berita berdasarkan slug untuk halaman detail berita
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*),
      category:categories(*),
      editor:profiles!posts_editor_id_fkey(*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Post;
}

/**
 * Mengambil daftar berita Breaking News berjalan
 */
export async function getBreakingNews(limit = 5): Promise<Post[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, published_at")
    .eq("status", "published")
    .eq("is_breaking_news", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as Post[]) || [];
}

/**
 * Mengambil semua kategori berita aktif
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) return [];
  return (data as Category[]) || [];
}

/**
 * Mengambil profil jurnalis berdasarkan slug (Untuk halaman /author/[slug] Google E-E-A-T)
 */
export async function getAuthorBySlug(slug: string): Promise<UserProfile | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

/**
 * Mengambil semua artikel yang ditulis oleh seorang jurnalis
 */
export async function getPostsByAuthor(authorId: string, limit = 20): Promise<Post[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("author_id", authorId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as Post[]) || [];
}
