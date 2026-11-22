# Roadmap Pengembangan Website Portal Berita (Full Custom & Multi-Penulis)

Dokumen ini adalah panduan komprehensif, arsitektur sistem, dan rencana tahapan pengembangan portal berita mandiri berbasis **Next.js**, **Supabase**, dan arsitektur **Serverless** (Hosting & Database Rp 0).

---

## 1. Ringkasan Proyek

* **Tipe Proyek:** Portal Berita & Blog Multi-Penulis (*Editorial Multi-Author News Platform*).
* **Target Biaya:** Bebas biaya server/database bulanan (memanfaatkan free tier Vercel & Supabase), hanya biaya domain tahunan (~Rp 15.000 - Rp 165.000/tahun).
* **Kebutuhan Utama:**
  * Kontrol penuh tampilan UI/UX dan alur kode (*100% full custom*).
  * Sistem alur kerja redaksi: **Admin (Pemred)**, **Editor (Redaktur)**, dan **Reporter (Jurnalis)**.
  * Standar SEO media berita (Google News, JSON-LD Schema `NewsArticle`, E-E-A-T kredibilitas jurnalis).

---

## 2. Arsitektur & Tech Stack

```
                        ┌──────────────────────────────────────────────┐
                        │              Cloudflare (DNS & CDN)          │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                      ┌──────────────────────────────────────────────────┐
                      │              Vercel / Cloudflare Pages           │
                      │               Next.js 15 (App Router)            │
                      └──────────────┬───────────────────┬───────────────┘
                                     │                   │
                     ┌───────────────▼────────┐ ┌────────▼──────────────┐
                     │ Halaman Publik Berita  │ │  CMS / Admin Redaksi  │
                     │  (Server Components,   │ │ (Tiptap WYSIWYG,      │
                     │  Fast Caching, SEO)    │ │  Auth & RBAC Client)  │
                     └───────────────┬────────┘ └────────┬──────────────┘
                                     │                   │
                                     ▼                   ▼
                      ┌──────────────────────────────────────────────────┐
                      │                 Supabase (BaaS)                  │
                      │  - PostgreSQL (Database + RLS Security)         │
                      │  - Supabase Auth (Manajemen Sesi & Role)         │
                      │  - Supabase Storage (Gambar & Media Berita)      │
                      └──────────────────────────────────────────────────┘
```

* **Frontend & Backend (Fullstack):** Next.js 15 (App Router, TypeScript).
* **Styling & UI Components:** Tailwind CSS v4 + shadcn/ui + Lucide Icons.
* **Rich Text Editor:** Tiptap Headless Editor (Dukungan embed video YouTube, gambar + caption jurnalis, blockquote kutipan).
* **Database & Authentication:** Supabase (PostgreSQL dengan Row Level Security / RLS).
* **Media Storage:** Supabase Storage (Konversi otomatis format gambar ke `.webp`).
* **Hosting & Deployment:** Vercel (Free Tier) + Cloudflare DNS/DDoS Protection.

---

## 3. Alur Kerja Redaksi & Role-Based Access Control (RBAC)

### Pembagian Peran (Roles)
1. **Admin / Pemimpin Redaksi:**
   * Manajemen anggota redaksi (menambah, menonaktifkan, atau mengubah peran).
   * Hak penuh menyunting, menerbitkan (*publish*), dan menghapus semua artikel.
   * Mengatur susunan kategori, navigasi, dan pengaturan umum situs.
2. **Editor / Redaktur:**
   * Memeriksa draf artikel yang diajukan oleh reporter di antrean *Review*.
   * Mengoreksi naskah (EYD/PUEBI, judul, caption foto).
   * Menerbitkan artikel (`published`) atau mengembalikan ke reporter dengan catatan revisi (`draft` + komentar).
3. **Reporter / Jurnalis:**
   * Menulis artikel baru dan mengunggah foto liputan.
   * Hanya bisa melihat dan mengedit artikel buatannya sendiri.
   * Mengajukan draf ke redaktur (`draft` ➔ `in_review`).

### Siklus Status Artikel
```
[DRAFT] ──────► [IN_REVIEW] ──────► [PUBLISHED]
(Reporter)       (Diajukan)          (Tayang ke Publik oleh Editor/Admin)
                     │
                     ▼
               [REVISION_NEEDED]
             (Dikembalikan dgn catatan)
```

---

## 4. Rencana Tahapan Pengembangan (Milestones)

### Fase 1: Inisialisasi Proyek & Konfigurasi Dasar (SELESAI)
- [x] Inisialisasi Next.js 15 dengan TypeScript, ESLint, Tailwind CSS, dan App Router.
- [x] Setup komponen dasar UI menggunakan **shadcn/ui** (`Button`, `Badge`, `Card`, utility `cn`).
- [x] Konfigurasi struktur folder terorganisir (`/app`, `/components`, `/lib`, `/types`, `/hooks`).
- [x] Konfigurasi client Supabase SSR helper (`client.ts`, `server.ts`, `middleware.ts`).
- [x] Konfigurasi environment variables (`.env.local` & `.env.example`).

### Fase 2: Database & Keamanan (Supabase Setup) (SELESAI)
- [x] Inisialisasi skema SQL lengkap di [`supabase/migrations/01_initial_schema.sql`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/supabase/migrations/01_initial_schema.sql):
  - `profiles` (sinkronisasi dengan `auth.users`, role `admin`, `editor`, `reporter`, slug unik E-E-A-T).
  - `categories` (topik berita) & `tags`.
  - `posts` (judul, slug, konten JSON Tiptap, foto cover, caption, status, views, relation author & editor).
  - `editorial_reviews` (catatan revisi redaksi).
- [x] Terapkan kebijakan **Row Level Security (RLS)**:
  - Publik hanya bisa membaca artikel `published`.
  - Reporter hanya bisa mengubah artikel draf miliknya.
  - Editor & Admin dapat membaca, menyunting, dan menyetujui seluruh artikel.
- [x] Storage bucket `news-media` terkonfigurasi untuk upload foto liputan berita.
- [x] Data awal kategori dan tag berita di [`supabase/migrations/02_seed_data.sql`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/supabase/migrations/02_seed_data.sql).
- [x] Modul query data helper Next.js di [`src/lib/supabase/queries.ts`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/lib/supabase/queries.ts).

### Fase 3: Sistem Autentikasi & Dashboard Redaksi (SELESAI)
- [x] Halaman Login Redaksi ([`/admin/login`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/login/page.tsx)) dengan proteksi sesi dan pesan validasi.
- [x] Layout Dashboard Admin responsif ([`src/components/admin/sidebar.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/components/admin/sidebar.tsx) & [`src/components/admin/header.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/components/admin/header.tsx)).
- [x] Route Groups terisolasi ([`src/app/admin/(dashboard)`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard))) dengan badge peran pengguna aktif.
- [x] Integrasi **Tiptap WYSIWYG Editor** ([`src/components/admin/tiptap-editor.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/components/admin/tiptap-editor.tsx)):
  - Format teks (Bold, Italic, Heading 2-3, Bullet/Ordered List, Blockquote kutipan narasumber).
  - Sisipkan foto liputan berita & URL tautan.
  - Tombol Undo, Redo, dan pembersih format.
- [x] Halaman Overview Dashboard ([`/admin`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard)/page.tsx)) menampilkan metrik statistik draf, antrean review, berita tayang, dan daftar aktivitas terkini.
- [x] Halaman Formulir Berita Baru ([`/admin/posts/new`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard)/posts/new/page.tsx)) dengan slug otomatis, pilihan kategori, foto liputan + caption, dan opsi status (Draf / Kirim ke Redaktur / Terbitkan).

### Fase 4: Sistem Manajemen Artikel & Workflow Redaksi (SELESAI)
- [x] Halaman Daftar Artikel ([`/admin/posts`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard)/posts/page.tsx)):
  - Filter tab status (*Semua, Draf, Dalam Review, Sudah Tayang*).
  - Tampilan indikator badge *Headline*, *Breaking News*, kategori, dan total pembaca.
- [x] Halaman Review & Koreksi Naskah ([`/admin/posts/edit/[id]`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard)/posts/edit/[id]/page.tsx)):
  - Tombol aksi reporter: *Simpan Draf* dan *Ajukan ke Redaktur*.
  - Tombol aksi editor: *Terbitkan Sekarang* atau *Minta Revisi*.
  - Modal interaktif pengiriman catatan koreksi redaksi ke tabel `editorial_reviews`.
- [x] Halaman Rubrikasi & Kategori ([`/admin/categories`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/admin/(dashboard)/categories/page.tsx)):
  - Formulir penambahan rubrik berita baru dengan slug otomatis dan deskripsi SEO.
  - Tabel rubrik aktif beserta aksi penghapusan (khusus admin/editor).

### Fase 5: Tampilan Depan Publik (Public Portal) (SELESAI)
- [x] **Homepage Portal Berita ([`/`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/page.tsx)):**
  - Breaking news banner & running ticker terkini.
  - Headline Hero Grid (1 berita utama besar + 3 kartu sorotan pendukung).
  - Feed berita terkini, seksi rubrikasi, dan daftar terpopuler 01-05.
- [x] **Halaman Detail Berita ([`/berita/[slug]`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/berita/[slug]/page.tsx)):**
  - Byline kredibilitas redaksi: nama reporter (link ke bio) & editor penanggung jawab.
  - Foto liputan utama lengkap dengan caption kredit fotografer.
  - Renderer naskah berita format Tiptap ([`src/components/public/article-content.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/components/public/article-content.tsx)).
  - Tombol Bagikan Cepat ([`src/components/public/share-buttons.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/components/public/share-buttons.tsx)) ke WhatsApp, X/Twitter, Facebook, & salin tautan.
  - Kotak profil jurnalis dan rekomendasi berita terkait.
- [x] **Halaman Rubrikasi Kategori ([`/kategori/[slug]`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/kategori/[slug]/page.tsx)):**
  - Arsip berita terkelompok berdasarkan topik rubrik.
- [x] **Halaman Profil Jurnalis ([`/penulis/[slug]`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/penulis/[slug]/page.tsx)):**
  - Bio jurnalis, badge verifikasi redaksi, dan seluruh rekam jejak artikel yang ditulis (standar Google E-E-A-T).

### Fase 6: Optimasi SEO, Kinerja, & Kredibilitas Media (SELESAI)
- [x] **Metadata Dinamis per Artikel:** Generator metadata Next.js ([`src/app/berita/[slug]/page.tsx`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/berita/[slug]/page.tsx)) yang otomatis menyematkan preview gambar OpenGraph 1200x630 (WhatsApp, Facebook), Twitter Card summary_large_image, dan canonical URL.
- [x] **Data Terstruktur JSON-LD Schema `NewsArticle`:** Skema standar Google News dan Google Discover dengan identitas artikel, jurnalis penulis (*Person*), dan media penerbit (*Organization*).
- [x] **Peta Situs Dinamis ([`/sitemap.xml`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/sitemap.ts)):** Otomatis menghasilkan daftar seluruh artikel berita dan kategori terkini untuk Google Search Console.
- [x] **Sindikasi Berita RSS Feed ([`/rss.xml`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/rss.xml/route.ts)):** Standar feed XML untuk Google Publisher Center, feed reader, dan agregator berita nasional.
- [x] **Pengaturan Crawler ([`/robots.txt`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/src/app/robots.ts)):** Mengizinkan web crawler mesin pencari dan memproteksi rute internal redaksi (`/admin/`, `/auth/`).

### Fase 7: Deployment & Peluncuran (SELESAI)
- [x] Panduan deployment komprehensif di [`DEPLOYMENT.md`](file:///c:/Users/milen/OneDrive/Documents/web%20berita/DEPLOYMENT.md).
- [x] Konfigurasi environment variables produksi untuk Vercel & Supabase.
- [x] Panduan menghubungkan domain custom murah (`.my.id` seharga ~Rp 15.000/thn atau `.com`).
- [x] Panduan setup Cloudflare (DNS, SSL gratis, proteksi anti-DDoS, dan edge caching).
- [x] Langkah pendaftaran ke Google Search Console (`/sitemap.xml`) dan Google Publisher Center (`/rss.xml`).

---

## 5. Ringkasan Estimasi Biaya

| Komponen | Penyedia Layanan | Skema Biaya |
| :--- | :--- | :--- |
| **Domain Utama** | Registrar Domain (Cloudflare / Niagahoster / DomaiNesia) | Rp 15.000/thn (`.my.id`) s.d. Rp 165.000/thn (`.com`) |
| **Hosting Aplikasi** | Vercel (Hobby Tier) | **Rp 0 / Gratis** |
| **Database & Auth** | Supabase (Free Tier: 500MB DB, 50k MAU) | **Rp 0 / Gratis** |
| **Media Storage** | Supabase Storage (Free 1GB) / Cloudflare R2 (10GB) | **Rp 0 / Gratis** |
| **SSL & Proteksi DDoS** | Cloudflare | **Rp 0 / Gratis** |
| **Total Biaya Operasional** | | **Mulai Rp 15.000 – Rp 165.000 per TAHUN** |
