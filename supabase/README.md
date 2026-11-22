# Panduan Setup Database & Keamanan Supabase

File migrasi SQL pada folder ini dirancang untuk dieksekusi di database Supabase (PostgreSQL).

## Langkah Menjalankan Migrasi di Supabase:

1. **Buka Dashboard Supabase:**
   * Buka [supabase.com](https://supabase.com) dan masuk ke project Anda (jika belum ada, buat project gratis baru).
2. **Buka SQL Editor:**
   * Pada menu navigasi sebelah kiri, klik menu **SQL Editor** (ikon terminal/query).
   * Klik tombol **New Query**.
3. **Eksekusi File 1 (Skema Inti & Keamanan RLS):**
   * Salin seluruh isi file [`supabase/migrations/01_initial_schema.sql`](01_initial_schema.sql).
   * Tempel (*paste*) ke dalam SQL Editor dan klik tombol **Run** (atau tekan `Ctrl + Enter`).
   * Pastikan muncul pesan `Success. No rows returned`.
4. **Eksekusi File 2 (Kategori & Tag Awal):**
   * Buat query baru, salin isi file [`supabase/migrations/02_seed_data.sql`](02_seed_data.sql).
   * Tempel dan klik **Run**.
5. **Ambil Kredensial API:**
   * Masuk ke menu **Project Settings** (ikon gerigi) -> **API**.
   * Salin:
     * `Project URL` -> masukkan ke `NEXT_PUBLIC_SUPABASE_URL` di file `.env.local`
     * `anon public key` -> masukkan ke `NEXT_PUBLIC_SUPABASE_ANON_KEY` di file `.env.local`
     * `service_role secret key` -> masukkan ke `SUPABASE_SERVICE_ROLE_KEY` di file `.env.local`

---

## Fitur yang Telah Diterapkan:
* **Enums:** `user_role` (`admin`, `editor`, `reporter`), `post_status`, `review_action`.
* **Tabel:** `profiles`, `categories`, `tags`, `posts`, `post_tags`, `editorial_reviews`.
* **Row Level Security (RLS):**
  * Publik hanya dapat membaca artikel berstatus `published`.
  * Reporter hanya bisa menyunting draf artikel miliknya sendiri.
  * Editor & Admin memiliki hak penuh menyunting, meninjau, dan menyetujui artikel tayang.
* **Storage Bucket:** Bucket `news-media` otomatis terdaftar untuk media gambar berita dengan format WebP.
* **Trigger Otomatis:** Pembuatan profil jurnalis otomatis saat user baru terdaftar di Supabase Auth.
