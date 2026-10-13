# Adihansyahproduction — Creative Studio Website

Website portofolio modern untuk creative agency: desain Instagram feed, social media management, dan visual branding. Dibangun dengan Next.js dan siap dideploy ke Vercel.

## Fitur
- Responsive landing page dengan visual biru-putih, interaksi hover, animasi marquee, filter kategori, FAQ accordion, dan CTA WhatsApp.
- Tombol WhatsApp dengan template pesan konsultasi yang sudah diisi.
- Panel admin di `/admin` untuk login via magic link, upload gambar portofolio, tambah deskripsi/kategori, dan hapus karya.
- Supabase Storage + database untuk menyimpan portofolio agar tetap tampil setelah deploy dan bisa dikelola dari panel admin.
- SEO metadata dan Open Graph dasar.

## 1. Atur nomor WhatsApp
Salin `.env.example` menjadi `.env.local` dan ganti:
`NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx`

Gunakan kode negara tanpa `+`, spasi, atau tanda baca. Contoh Indonesia: `6281234567890`.
Nomor contoh di project ini perlu diganti dengan nomor bisnis yang benar.

## 2. Setup Supabase (agar upload portofolio tersimpan online)
1. Buat project di [Supabase](https://supabase.com/).
2. Buka **Project Settings → API** dan salin Project URL serta `anon/public` key.
3. Isi di `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
4. Buka **SQL Editor**, jalankan SQL di bawah ini.
5. Buka **Authentication → URL Configuration**. Set Site URL ke URL Vercel kamu. Tambahkan `http://localhost:3000/**` dan URL production `https://NAMA-PROJECT.vercel.app/**` ke Redirect URLs.
6. Login pertama kali di `/admin` dengan email admin. Konfirmasi email/magic link. Untuk membatasi admin, buka Authentication → Users dan pastikan hanya email yang kamu percaya yang punya akun. Matikan sign-up publik jika pengaturan project kamu mengizinkannya; gunakan invite/admin provisioning, bukan pendaftaran terbuka.

### SQL setup
```sql
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Branding',
  description text not null default '',
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;

-- Publik boleh melihat karya di portofolio.
create policy "Public can view portfolio"
on public.portfolio_projects for select
to anon, authenticated using (true);

-- Pengelolaan konten hanya untuk pengguna yang login.
create policy "Authenticated users can add portfolio"
on public.portfolio_projects for insert
to authenticated with check (true);

create policy "Authenticated users can delete portfolio"
on public.portfolio_projects for delete
to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 8388608, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608;

create policy "Public can view portfolio images"
on storage.objects for select
to anon, authenticated using (bucket_id = 'portfolio');

create policy "Authenticated users can upload portfolio images"
on storage.objects for insert
to authenticated with check (bucket_id = 'portfolio');

create policy "Authenticated users can delete portfolio images"
on storage.objects for delete
to authenticated using (bucket_id = 'portfolio');
```

**Catatan keamanan penting:** SQL di atas mengizinkan semua akun Supabase yang terautentikasi untuk menambah/menghapus portofolio. Jangan aktifkan pendaftaran publik. Jika website akan digunakan oleh tim atau untuk bisnis yang lebih besar, batasi kebijakan insert/delete berdasarkan daftar email admin atau role khusus sebelum produksi.

## 3. Jalankan lokal
Butuh Node.js 18.17+.

```bash
npm install
cp .env.example .env.local
# edit .env.local
npm run dev
```
Buka http://localhost:3000. Tanpa Supabase, halaman depan tetap tampil menggunakan contoh portofolio, tetapi upload admin belum aktif.

## 4. Deploy ke Vercel
1. Upload folder project ke GitHub.
2. Di [Vercel](https://vercel.com/), pilih **Add New → Project**, lalu import repository.
3. Tambahkan tiga environment variables di **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**. Setelah deployment, masukkan URL production Vercel ke Supabase Auth URL Configuration.
5. Buka `https://domain-kamu.vercel.app/admin` untuk mengelola portofolio.

## Sebelum diumumkan ke publik
- Ganti nomor WhatsApp placeholder dengan nomor bisnis.
- Ganti gambar demo dengan karya asli dan pastikan kamu memiliki hak penggunaan gambar.
- Perbarui deskripsi layanan, testimoni, harga/paket, email bisnis, dan tautan Instagram.
- Tes link WhatsApp dari perangkat mobile.
- Uji login admin, upload, tampil di halaman utama, dan hapus portofolio di deployment production.

## Struktur
```
app/
  admin/page.tsx   # panel admin upload
  globals.css      # design system responsive
  layout.tsx       # metadata & root layout
  page.tsx         # homepage
lib/
  supabase.ts      # client Supabase
```
