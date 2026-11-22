-- ==============================================================================
-- DATA AWAL (SEED DATA): KATEGORI & TAG BERITA
-- ==============================================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Nasional', 'nasional', 'Berita terkini seputar peristiwa dan kabar nasional dari seluruh Indonesia.'),
  ('Politik', 'politik', 'Kabar perpolitikan, pemilu, parlemen, dan dinamika kebijakan pemerintahan.'),
  ('Bisnis & Ekonomi', 'bisnis', 'Informasi pasar modal, makroekonomi, perbankan, dan perkembangan startup.'),
  ('Teknologi', 'teknologi', 'Perkembangan kecerdasan buatan (AI), gawai terbaru, internet, dan sains.'),
  ('Gaya Hidup', 'gaya-hidup', 'Tren kesehatan, kuliner, pariwisata, dan inspirasi kehidupan sehari-hari.'),
  ('Olahraga', 'olahraga', 'Kabar sepak bola nasional, liga internasional, bulutangkis, dan arena olahraga dunia.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES
  ('Breaking News', 'breaking-news'),
  ('Pemerintah', 'pemerintah'),
  ('Investasi', 'investasi'),
  ('Gadget', 'gadget'),
  ('Kecerdasan Buatan', 'kecerdasan-buatan'),
  ('Timnas Indonesia', 'timnas-indonesia'),
  ('Otomotif', 'otomotif')
ON CONFLICT (slug) DO NOTHING;
