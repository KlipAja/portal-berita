-- ==============================================================================
-- SKEMA DATABASE PORTAL BERITA MULTI-PENULIS (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. ENUM DEFINITIONS
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'reporter');
CREATE TYPE public.post_status AS ENUM ('draft', 'in_review', 'published', 'archived');
CREATE TYPE public.review_action AS ENUM ('revision_requested', 'approved', 'rejected');

-- 2. TABEL PROFILES (Tersinkronisasi dengan auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'reporter'::public.user_role NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index untuk performa pencarian slug penulis (SEO E-E-A-T)
CREATE INDEX idx_profiles_slug ON public.profiles(slug);

-- 3. TABEL KATEGORI
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_categories_slug ON public.categories(slug);

-- 4. TABEL TAGS
CREATE TABLE public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_tags_slug ON public.tags(slug);

-- 5. TABEL POSTS (ARTIKEL BERITA)
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB,
  cover_image TEXT,
  cover_caption TEXT,
  status public.post_status DEFAULT 'draft'::public.post_status NOT NULL,
  is_headline BOOLEAN DEFAULT false NOT NULL,
  is_breaking_news BOOLEAN DEFAULT false NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  editor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  views_count INT DEFAULT 0 NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_posts_category_id ON public.posts(category_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_headline ON public.posts(is_headline) WHERE is_headline = true;
CREATE INDEX idx_posts_breaking ON public.posts(is_breaking_news) WHERE is_breaking_news = true;

-- 6. TABEL RELASI POST_TAGS
CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 7. TABEL EDITORIAL REVIEWS (CATATAN REVISI DARI EDITOR KE REPORTER)
CREATE TABLE public.editorial_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  action public.review_action NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_editorial_reviews_post_id ON public.editorial_reviews(post_id);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Fungsi keamanan untuk mengecek peran pengguna tanpa terjadi rekursi RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger otomatis membuat profile ketika user baru mendaftar di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Generate slug dasar dari nama atau email
  base_slug := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), '[^a-zA-Z0-9]+', '-', 'g'));
  final_slug := base_slug;

  -- Pastikan slug unik
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, role, avatar_url, slug)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'reporter'::public.user_role),
    new.raw_user_meta_data->>'avatar_url',
    final_slug
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger update otomatis kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- KEAMANAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan RLS Profiles:
-- Publik bisa melihat profil penulis (untuk byline berita & kredibilitas E-E-A-T)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- User bisa update profil sendiri
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin bisa mengupdate peran atau profil siapa saja
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 2. Kebijakan RLS Categories & Tags:
-- Publik bisa melihat kategori & tag
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Tags viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

-- Hanya Editor & Admin yang bisa menambah/mengubah kategori & tag
CREATE POLICY "Editors and admins can manage categories"
  ON public.categories FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can manage tags"
  ON public.tags FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('editor', 'admin'));

-- 3. Kebijakan RLS Posts:
-- Publik (anonim/user) hanya bisa membaca artikel yang SUDAH PUBLISHED dan tanggal tayangnya <= waktu sekarang
CREATE POLICY "Published posts viewable by everyone"
  ON public.posts FOR SELECT
  USING (
    status = 'published' AND (published_at IS NULL OR published_at <= timezone('utc'::text, now()))
    OR
    (auth.uid() IS NOT NULL AND author_id = auth.uid())
    OR
    (public.get_user_role(auth.uid()) IN ('editor', 'admin'))
  );

-- Reporter hanya bisa membuat artikel miliknya sendiri
CREATE POLICY "Reporters can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Reporter hanya bisa mengedit artikel miliknya jika statusnya masih 'draft'
CREATE POLICY "Reporters can update their own drafts"
  ON public.posts FOR UPDATE
  USING (
    author_id = auth.uid() AND status IN ('draft')
  );

-- Editor dan Admin bisa menyunting artikel apapun (termasuk mengubah status jadi published)
CREATE POLICY "Editors and Admins can update all posts"
  ON public.posts FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('editor', 'admin'));

-- Hanya Admin yang berhak menghapus artikel
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 4. Kebijakan RLS Post Tags:
CREATE POLICY "Post tags viewable by everyone"
  ON public.post_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage post tags"
  ON public.post_tags FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 5. Kebijakan RLS Editorial Reviews:
CREATE POLICY "Reviews viewable by authors and editors"
  ON public.editorial_reviews FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('editor', 'admin')
    OR
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = editorial_reviews.post_id AND posts.author_id = auth.uid())
  );

CREATE POLICY "Only editors and admins can create reviews"
  ON public.editorial_reviews FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('editor', 'admin'));

-- ==============================================================================
-- STORAGE BUCKET UNTUK MEDIA FOTO BERITA
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-media', 'news-media', true)
ON CONFLICT (id) DO NOTHING;

-- Siapa saja bisa melihat foto berita yang sudah diunggah
CREATE POLICY "Public media access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-media');

-- Hanya akun redaksi (terotentikasi) yang dapat mengunggah media
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'news-media' AND auth.role() = 'authenticated');
