# Panduan Lengkap Deployment & Peluncuran Portal Berita (Biaya Server Rp 0)

Dokumen ini berisi panduan langkah demi langkah untuk meluncurkan portal berita Anda ke internet (*Production / Go-Live*) menggunakan **Vercel** dan **Cloudflare**, dengan total biaya operasional hanya seharga domain tahunan (mulai Rp 15.000/tahun).

---

## 1. Persiapan Repositori Git (GitHub)

1. Buat repositori baru di [github.com](https://github.com) (misal: `portal-berita`).
2. Di terminal komputer Anda, inisialisasi Git dan dorong (*push*) seluruh kode proyek ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi lengkap portal berita multi-penulis"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/portal-berita.git
   git push -u origin main
   ```

---

## 2. Deploy ke Vercel (Hosting Gratis / Rp 0)

1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** ➔ **"Project"**.
3. Pilih repositori `portal-berita` dari daftar akun GitHub Anda dan klik **"Import"**.
4. Pada bagian **Environment Variables**, tambahkan 4 variabel penting berikut (diambil dari dashboard Supabase):
   * `NEXT_PUBLIC_SUPABASE_URL`: `https://ID-PROYEK-ANDA.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOi...` *(Anon public key)*
   * `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOi...` *(Secret service role key)*
   * `NEXT_PUBLIC_SITE_URL`: `https://namadomainanda.com` *(Atau domain gratis sementara dari Vercel: `https://portal-berita.vercel.app`)*
5. Klik **"Deploy"**. Dalam waktu sekitar 1-2 menit, website berita Anda sudah aktif di internet dan dapat diakses publik.

---

## 3. Pembelian & Pemilihan Domain Murah

Untuk portal berita Indonesia, Anda memiliki 2 opsi domain terbaik:

| Ekstensi | Estimasi Biaya | Rekomendasi Registrar | Karakteristik |
| :--- | :--- | :--- | :--- |
| **`.my.id`** | **~Rp 12.000 – Rp 20.000 / TAHUN** | DomaiNesia / Niagahoster / IDCloudHost | Sangat murah, identitas lokal Indonesia yang kuat, persyaratan hanya KTP. |
| **`.com`** | **~Rp 150.000 – Rp 175.000 / TAHUN** | Cloudflare Registrar / Namecheap / DomaiNesia | Standar internasional, paling populer untuk media umum. |

---

## 4. Menghubungkan Domain Custom ke Vercel

1. Di dashboard proyek Vercel Anda, masuk ke tab **Settings** ➔ **Domains**.
2. Masukkan nama domain Anda (misal: `portalberita.com` atau `www.portalberita.com`) lalu klik **Add**.
3. Vercel akan memberikan konfigurasi DNS Records:
   * **Untuk Domain Utama (`@` / apex):**
     * Type: `A`
     * Name: `@`
     * Value: `76.76.21.21`
   * **Untuk Subdomain (`www`):**
     * Type: `CNAME`
     * Name: `www`
     * Value: `cname.vercel-dns.com`
4. Masuk ke panel DNS registrar tempat Anda membeli domain, lalu buat DNS Records sesuai petunjuk di atas.

---

## 5. Optimalisasi CDN & Proteksi Anti-DDoS via Cloudflare (Opsional tapi Sangat Disarankan)

Agar portal berita Anda tahan terhadap lonjakan pengunjung (*viral traffic*), hemat bandwidth, dan aman dari serangan hacker:
1. Daftarkan akun gratis di [cloudflare.com](https://cloudflare.com).
2. Tambahkan domain Anda di Cloudflare (pilih **Free Plan**).
3. Ubah *Nameservers* di registrar domain Anda ke Nameservers yang diberikan Cloudflare.
4. Pada menu **SSL/TLS**, pilih mode **Full** atau **Full (strict)** agar koneksi HTTPS terenkripsi sempurna.
5. Aktifkan **Automatic HTTPS Rewrites** dan **Brotli Compression** untuk kecepatan maksimal.

---

## 6. Pendaftaran ke Mesin Pencari & Agregator Berita

Setelah website tayang dengan domain utama:

1. **Google Search Console:**
   * Buka [search.google.com/search-console](https://search.google.com/search-console).
   * Verifikasi kepemilikan domain.
   * Masuk ke menu **Sitemaps**, lalu kirimkan link:
     ```
     https://domainanda.com/sitemap.xml
     ```
2. **Google Publisher Center (Google News):**
   * Buka [publishercenter.google.com](https://publishercenter.google.com).
   * Daftarkan media Anda dengan menyertakan nama portal, logo, dan URL RSS Feed:
     ```
     https://domainanda.com/rss.xml
     ```
3. **Akun Redaksi Pertama:**
   * Buat akun jurnalis pertama Anda melalui Supabase Auth (atau menu register).
   * Di tabel `public.profiles`, ubah nilai kolom `role` menjadi `'admin'` untuk akun utama Anda agar memiliki hak penuh memimpin redaksi.

---

## 7. Rekapitulasi Biaya Operasional Riil

```
+------------------------------------+--------------------------+
| Komponen Sistem                    | Biaya per Bulan / Tahun  |
+------------------------------------+--------------------------+
| Hosting Vercel (Hobby Tier)        | Rp 0 (Gratis)            |
| Database PostgreSQL (Supabase)     | Rp 0 (Gratis)            |
| Storage Media Foto Berita          | Rp 0 (Gratis)            |
| CDN, SSL, & Anti-DDoS (Cloudflare) | Rp 0 (Gratis)            |
| Domain .my.id (Opsional)           | Rp 15.000 / TAHUN        |
| Domain .com (Alternatif)           | Rp 165.000 / TAHUN       |
+------------------------------------+--------------------------+
| TOTAL BIAYA TAHUNAN                | Rp 15.000 - Rp 165.000   |
+------------------------------------+--------------------------+
```
