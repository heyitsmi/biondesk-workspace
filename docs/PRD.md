# PRD: Biondesk

*Lihat concept.md untuk latar belakang dan positioning.*

## Problem statement

Freelancer dan agency kecil yang bekerja lintas platform (marketplace, referral, direct outreach) biasanya mengelola lead, proposal, project, dan invoice secara terpisah-pisah, tanpa satu sistem yang menyatukan seluruh alur ini dengan baik. Project dan task management khususnya sering jadi fitur tempelan di tool sejenis yang sudah ada, padahal itu bagian penting dari siklus kerja freelancer/agency.

## Goals

1. Biondesk bisa menjalankan seluruh alur kerja freelancer/agency: lead, project, task, proposal, quote, invoice, payment tracking, dan reminder, dalam satu sistem yang koheren
2. Project dan Task management jadi fitur inti sejak versi pertama, bukan tambahan belakangan
3. Positioning produk konsisten di semua lapisan (data model, UI, copy) sebagai tool untuk freelancer dan agency lintas platform, tidak terkunci ke satu marketplace atau negara tertentu
4. Setelah versi awal stabil, siap dipakai oleh user eksternal untuk validasi distribusi

## Non-goals

- **Bukan payment gateway untuk invoice klien** — tetap manual tracking, BYO payment instructions. Otomatisasi gateway (kalau dibutuhkan nanti) eksplisit di luar scope sekarang
- **Bukan multi-level company/organization di atas Contact** — dicatat sebagai kebutuhan masa depan (lihat Open Questions), belum dibangun sekarang
- **Bukan rilis publik dengan self-serve onboarding penuh** — target fase ini adalah versi inti yang stabil, rilis ke user eksternal dan monetisasi publik itu langkah setelahnya

## User stories

**Sebagai freelancer/agency owner**

- Sebagai user, saya ingin mencatat lead dari sumber manapun (marketplace, referral, direct), supaya tidak terkunci ke satu platform tertentu
- Sebagai user, saya ingin lead yang deal-nya closing otomatis ditawarkan opsi bikin quote atau invoice draft, supaya saya tidak perlu input ulang data yang sama
- Sebagai user, saya ingin project yang sedang dikerjakan punya task breakdown, dengan tampilan table atau Kanban board sesuai kebutuhan saat itu
- Sebagai user, saya ingin proposal bisa di-generate AI dari brief apapun bentuknya, baik itu job post marketplace maupun ringkasan discovery call
- Sebagai user, saya ingin proposal, quote, dan invoice bisa dibagikan ke klien lewat link yang interaktif, sekaligus punya versi PDF yang bisa diunduh atau dilampirkan email
- Sebagai user, saya ingin mencatat pembayaran secara manual dengan metode apapun (transfer bank, Stripe, PayPal, Midtrans, tunai), termasuk pembayaran bertahap dalam satu invoice yang sama
- Sebagai user, saya ingin reminder otomatis terkirim untuk invoice yang mendekati atau lewat jatuh tempo, tanpa saya perlu ingat manual
- Sebagai user, saya ingin punya link public lead form sendiri yang bisa disematkan di bio media sosial, supaya orang bisa langsung kirim inquiry tanpa perlu chat manual dulu
- Sebagai user, saya ingin bisa kustomisasi tampilan lead form saya sendiri (banner, judul, deskripsi), supaya kesannya representasi brand saya, bukan form generic
- Sebagai user, saya ingin mencatat permintaan atau revisi ad-hoc dari klien selama project berjalan, supaya tidak ada yang hilang di riwayat chat

**Sebagai calon user eksternal (fase setelah versi awal stabil)**

- Sebagai freelancer baru yang mencoba Biondesk, saya ingin onboarding yang tidak berasumsi saya kerja lewat platform tertentu
- Sebagai freelancer baru, saya ingin melihat bahwa tool ini fleksibel untuk cara kerja saya sendiri, bukan dirancang khusus untuk satu jenis freelancer saja

## Data model / entitas utama

```
Team (workspace kerja, dengan slug untuk routing)
  └── Contact (lead / client)
        └── Opportunity   (stage: inbox, drafting, sent, negotiation, won, lost)
              └── Project      (status: not_started, in_progress, waiting_on_client, in_review, completed, cancelled)
                    ├── Task        (status: todo, in_progress, done)
                    └── RequestLog  (permintaan/revisi ad-hoc dari klien)
              └── Document     (type: proposal, quote, invoice)
                    ├── DocumentItem (line items)
                    ├── Payment      (manual, banyak record per document)
                    └── ReminderJob
  └── ProfileAsset (portfolio, testimonial, snippet)
  └── Template
```

Document punya dua kemungkinan relasi: ke Opportunity (untuk proposal di fase closing deal) dan ke Project (untuk quote/invoice tambahan selama eksekusi, misalnya milestone atau perubahan scope).

## Requirements

### P0 — must have

**Fondasi**
- Given user baru daftar, when registrasi selesai, then otomatis dapat team sendiri
- Given user login, when akses data apapun, then discope ke team yang sedang aktif
- Auth mencakup email verification, 2FA, passkey, dan password confirmation

**Contact & Opportunity**
- Given user tambah lead baru, when mengisi source, then bebas diisi teks apapun (tidak dikunci ke enum platform tertentu), dengan suggestion dropdown umum di UI
- Given opportunity ada di stage manapun, when user pindahkan ke stage lain lewat Kanban, then perubahan tersimpan dengan label yang platform-agnostic (contoh: "Negotiation", bukan istilah yang terasa spesifik ke satu marketplace)
- Given opportunity di-mark won, when perubahan tersimpan, then user diberi pilihan (bukan otomatis) untuk lanjut bikin Project
- Given team punya slug tertentu, when orang buka `biondesk.com/p/{slug}`, then tampil public lead form yang bisa disematkan di bio media sosial
- Given user berada di Settings, when upload banner (JPG/PNG, maks 2MB) dan isi judul serta deskripsi form, then live preview ter-update sebelum disimpan, dan lead form publik memakai tampilan itu setelah disimpan
- Given team belum kustomisasi lead form-nya, then form tetap tampil dengan fallback nama team dan deskripsi generic, bukan form kosong
- Given public lead form diisi dan lolos verifikasi Turnstile, when disubmit, then otomatis bikin Contact (dedupe by email dalam team yang sama) dan Opportunity baru stage "inbox", source "Public form", plus notifikasi email ke owner team
- Given verifikasi Turnstile gagal atau config tidak lengkap, then request ditolak (fail closed)

**Project & Task**
- Given opportunity won, when user pilih "buat project", then project baru dibuat terhubung ke opportunity dan contact tersebut
- Given user berada di halaman project, when memilih tampilan tabel atau Kanban board, then data yang sama ditampilkan sesuai pilihan
- Given user drag project card ke kolom status lain, when drop terjadi, then status dan urutan (`sort_order`) ter-update tanpa reload halaman penuh
- Given project ada, when user tambah task, then task tersimpan terhubung ke project tersebut dengan status default "todo"
- Given project sedang berjalan, when klien minta revisi atau ada permintaan ad-hoc, then user bisa catat sebagai Request Log yang terhubung ke project tersebut, terpisah dari Task

**Proposal, Quote, Invoice**
- Given user isi brief (job post atau ringkasan diskusi), when generate proposal, then AI menghasilkan draft yang menyesuaikan Profile Library user, bukan generic template
- Given proposal accepted, when status tersimpan, then muncul pilihan (create quote draft / create invoice draft / nanti saja), user yang memutuskan setiap saat
- Given quote accepted, when user buat invoice, then bisa import line item dari quote tersebut
- Given document ditolak klien, when status diubah, then tersimpan sebagai status `rejected` yang jelas, terpisah dari status `overdue` yang khusus berarti invoice lewat jatuh tempo

**Payment tracking**
- Given invoice terkirim, when user catat pembayaran manual, then bisa lebih dari satu payment record per invoice (menangani DP dan pelunasan dalam satu dokumen yang sama)
- Given invoice punya field payment instructions, then user bebas isi link Midtrans, Stripe, nomor rekening, atau kombinasi apapun

**Share & PDF**
- Given proposal/quote/invoice dikirim, when klien buka link publik, then tampil sebagai webview interaktif yang ringan (tanpa perlu login)
- Given dokumen perlu di-generate PDF, when proses berjalan, then dilakukan lewat queued job, tidak sinkron di request utama
- Given PDF sudah pernah di-generate dan konten belum berubah, when diminta ulang, then pakai cache, tidak generate ulang dari nol

**Reminder & Email**
- Given reminder rule aktif, when kondisi terpenuhi (mendekati jatuh tempo, lewat jatuh tempo, quote belum direspon), then reminder job terjadwal dan terkirim

### P1 — nice to have

- Subscription billing Biondesk sendiri (Free dan Pro, $5/bulan) lewat Midtrans, dipakai untuk monetisasi setelah rilis ke user eksternal
- Activity log lengkap di semua entity utama
- AI cost/estimate calculator untuk bantu user menentukan harga project
- Refinement reminder rules (custom template per rule)
- Multi-user per team dengan role granular
- Light/dark theme switcher, tersimpan per akun (bukan cuma per browser), default mengikuti preferensi OS
- Field tambahan di Opportunity: `win_probability` dan `expected_close_date`, untuk reporting pipeline yang lebih berguna

### P2 — future considerations

- Company-level grouping di atas Contact, untuk agency yang punya beberapa contact person dalam satu perusahaan klien
- BYO payment gateway penuh untuk invoice (kalau ada sinyal kuat dari user eksternal)
- Self-serve onboarding publik dan landing page pemasaran
- Request Log versi AI: extraction otomatis dari chat yang di-paste, dengan deteksi duplikat/kontradiksi pakai semantic search (pgvector + embedding). Ini upgrade signifikan dari Request Log manual di P0, worth dipertimbangkan serius sebagai diferensiator, tapi butuh infrastruktur tambahan (pgvector, API AI terpisah untuk extraction) yang belum jadi prioritas sekarang
- Ops portal terpisah (subdomain sendiri) untuk kelola organisasi, user, dan subscription lintas tenant, relevan begitu ada banyak user eksternal yang perlu dikelola

## Arsitektur teknis

**Stack**: Laravel 13, Inertia.js, React, PostgreSQL.

**Package Spatie yang dipakai**:
- `spatie/laravel-permission` — role dan permission per team member
- `spatie/laravel-medialibrary` — file upload (logo, bukti pembayaran, portfolio image)
- `spatie/laravel-activitylog` — audit trail semua perubahan penting
- `spatie/browsershot` — generate PDF dari webview, dipilih karena render-nya pakai headless Chrome asli, hasilnya identik pixel-perfect dengan tampilan browser, tidak seperti DomPDF/Snappy yang dukungan CSS modern-nya terbatas

**Status pipeline**: kolom `string`, bukan native Postgres enum, dipasangkan dengan PHP native enum cast di Eloquent model untuk type safety di kode, supaya fleksibel menambah status baru tanpa migration rumit.

**Kanban ordering**: kolom `sort_order` bertipe `double`, teknik fractional indexing (posisi baru = rata-rata dua item tetangga), supaya reorder tidak perlu update semua row lain.

**AI provider**: pakai Laravel AI SDK, provider (OpenAI, Anthropic, DeepSeek) switchable lewat config, tidak perlu ubah kode di setiap fungsi AI.

**PDF generation**: job queued (`ShouldQueue`), hasil disimpan lewat media library, di-generate dari route print khusus (halaman polos tanpa tombol aksi interaktif) yang terpisah dari halaman share utama.

**Struktur route (monolith, satu domain)**: root domain (`biondesk.com`) melayani tiga zona lewat route group, bukan subdomain terpisah:
- `/` — landing page marketing, tanpa auth
- `/p/{team:slug}` — public lead form, tanpa auth
- `/d/{document:public_token}` — proposal/quote/invoice yang dibagikan ke klien, tanpa auth
- `/app/*` — seluruh halaman Inertia, wajib auth

Prefix `/p/` dan `/d/` sengaja dipisah biar tidak ambigu, satu untuk halaman publik per team, satu untuk dokumen per token.

**Public lead form**: pakai `Team.slug` sebagai identifier URL (`/p/{team:slug}`). Verifikasi Cloudflare Turnstile fail closed kalau secret key tidak ter-konfigurasi. Team punya kolom tambahan `lead_form_banner_path`, `lead_form_title`, `lead_form_description` untuk kustomisasi, disimpan lewat media library, dengan fallback ke nama team kalau kosong.

**Email**: Brevo untuk semua transactional email (reminder, notifikasi dokumen terkirim, notifikasi lead baru).

**Payment gateway**: Midtrans, khusus untuk subscription billing Biondesk sendiri. Tidak dipakai untuk payment invoice klien, itu tetap manual.

**Deploy**: DigitalOcean Droplet + Laravel Forge.

## Success metrics

**Leading indicators**
- Seluruh fitur P0 berjalan stabil dan dipakai aktif dalam pemakaian sehari-hari dalam 2 minggu setelah rilis versi awal
- Project dan Task management jadi bagian rutin dari alur kerja, bukan fitur yang jarang disentuh

**Lagging indicators (setelah rilis ke user eksternal)**
- Jumlah user eksternal yang benar-benar mencoba (bukan cuma daftar)
- Feedback soal apakah pain point yang jadi dasar produk ini juga dirasakan freelancer/agency lain dengan cara yang sama

## Open questions

- **[Product]** Kapan waktu yang tepat untuk mulai menawarkan akses ke user eksternal pertama, dan berapa target jumlahnya untuk validasi awal?
- **[Product]** Company-level grouping di atas Contact, seberapa mendesak ini dibutuhkan? Perlu ditunggu sinyal dari user eksternal dulu atau dibangun preventif?
- **[Engineering]** Apakah Document perlu validasi supaya minimal salah satu dari `opportunity_id` atau `project_id` terisi, atau boleh dua-duanya kosong (dokumen berdiri sendiri)?
- **[Business]** Subscription billing Midtrans, apakah diaktifkan bareng dengan rilis ke user eksternal, atau ditunda sampai ada sinyal willingness-to-pay yang jelas?

## Timeline considerations

Tidak ada hard deadline eksternal. Dikerjakan sampai seluruh alur P0 stabil dan bisa dipakai sehari-hari. Setelah itu, baru dipertimbangkan untuk membuka akses ke user eksternal sebagai langkah validasi distribusi, sebelum menambah fitur P1/P2 lebih jauh.
