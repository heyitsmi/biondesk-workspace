# Tasks: Biondesk — dari halaman stub ke sistem dinamis

*Lihat [concept.md](concept.md) untuk latar belakang produk dan [PRD.md](PRD.md) untuk requirement lengkap. Dokumen ini adalah breakdown eksekusi, bukan pengganti PRD — kalau ada konflik soal *apa* yang harus dibangun, PRD yang menang; dokumen ini hanya mengatur *urutan* dan *cara* membangunnya.*

## Status saat ini

Yang sudah ada:
- Halaman React/Inertia untuk semua modul (Dashboard, Opportunities, Projects, Contacts, Proposals, Quotations, Invoices, Reminders, Profile Library, Settings, public lead form, public document view) — **semua masih pakai data stub** dari `App\Support\Biondesk\StubWorkspaceData`, tidak ada baris data asli yang tersimpan.
- Fondasi auth (Fortify: login, register, 2FA, passkey, password confirmation) dan Team/Membership/TeamInvitation sudah jalan dengan data asli.
- Package Spatie sudah ter-install (`laravel-permission`, `laravel-medialibrary`, `laravel-activitylog`) dan migration tabelnya sudah jalan, tapi belum dipakai di model manapun selain Team/User.
- Belum ada: migration/model untuk Contact, Opportunity, Project, Task, RequestLog, Document, DocumentItem, Payment, ReminderJob, ProfileAsset, Template. Belum ada `laravel/browsershot`, AI SDK package, integrasi Turnstile, atau integrasi Brevo.

Yang mau dikerjakan sekarang: **mengubah setiap modul dari stub ke dinamis, satu per satu**, mengikuti urutan dependency data model di PRD (Contact → Opportunity → Project → Document → Payment → dst), supaya setiap fase bisa langsung dipakai dan dites sebelum lanjut ke fase berikutnya.

## Pendekatan tiap fase

Supaya konsisten, setiap fase mengikuti pola yang sama:
1. Migration + Eloquent model (dengan factory) untuk entity terkait
2. Policy/otorisasi scoped ke team aktif
3. Form Request untuk validasi input
4. Controller diubah dari `StubWorkspaceData::xxx()` ke query Eloquent asli (props Inertia yang dikirim ke halaman **tetap sama bentuknya** supaya halaman React tidak perlu diubah, kecuali memang ada penyesuaian yang perlu)
4. Test Pest (feature test untuk CRUD + otorisasi)
5. Method stub yang sudah tergantikan dihapus dari `StubWorkspaceData` setelah fase itu selesai dan teruji
6. Verifikasi manual di browser (khusus untuk hal yang tidak bisa ditest lewat Pest, misal drag-and-drop Kanban)

---

## Fase 0 — Fondasi & keputusan teknis

Harus selesai duluan karena jadi dasar semua fase berikutnya.

- [ ] 0.1 Tambah kolom `lead_form_banner_path`, `lead_form_title`, `lead_form_description` ke tabel `teams` (dipakai fase 2)
- [x] 0.2 Konvensi status pipeline: kolom `string` + PHP native enum (`ContactType`, `ContactStatus`, `OpportunityStage`, `OpportunityPriority`, dst) dengan `casts()` di tiap model — diterapkan sejak Contact/Opportunity (Fase 1), pola ini dipakai untuk fase-fase berikutnya juga
- [ ] 0.3 Tambah kolom `sort_order` (tipe `double`) di tabel yang butuh reorder drag-and-drop (`projects` sesuai PRD; opportunity tidak disebut butuh reorder, hanya pindah stage)
- [ ] 0.4 `composer require spatie/browsershot` + cek Chrome/Chromium tersedia di environment dev
- [ ] 0.5 Pilih dan pasang AI SDK (Laravel AI SDK atau setara) untuk proposal generation, provider switchable lewat config (lihat pertanyaan klarifikasi di bawah)
- [ ] 0.6 Tambah konfigurasi Brevo di `config/services.php` + `.env` (lihat pertanyaan klarifikasi)
- [ ] 0.7 Tambah konfigurasi Cloudflare Turnstile (lihat pertanyaan klarifikasi)
- [x] 0.8 Validasi `Document`: **boleh berdiri sendiri** — `opportunity_id` dan `project_id` sama-sama nullable, tidak wajib salah satu terisi (mendukung dokumen ad-hoc)
- [x] 0.9 Skema URL dokumen publik: **ikut PRD**, `/d/{document:public_token}` (token unik, tanpa team di URL). Rute stub `/d/{team:slug}/{document}` yang sudah ada akan diganti waktu Fase 6

## Fase 1 — Contact & Opportunity (fondasi CRM)

Modul paling dasar karena semua entity lain (Project, Document) menggantung ke sini.

- [x] 1.1 Migration + model `Contact` (belongsTo Team; field: type, status, company, first/last name, email, phone, role, location, website, notes, billing_address). Pakai `spatie/laravel-activitylog` untuk activity feed di halaman detail
- [x] 1.2 Migration + model `Opportunity` (belongsTo Contact + Team; stage enum: inbox/drafting/sent/negotiation/won/lost; `source` bebas teks; `priority` enum low/medium/high)
- [x] 1.3 `ContactController` (index/create/store/show/edit/update/destroy) pakai Eloquent, seluruh pemanggilan `StubWorkspaceData::contacts()` dkk. sudah diganti
- [x] 1.4 `OpportunitiesController` + `OpportunityCreateController` + `OpportunityEditController` pakai Eloquent, plus controller baru untuk store/update/destroy/move-stage
- [x] 1.5 Endpoint update stage (drag Kanban + menu "Move to") — update kolom `stage` lewat `PATCH opportunities/{id}/stage`, tanpa `sort_order`
- [ ] 1.6 Opportunity di-mark `won` → tetap tampilkan pilihan bikin Project (bukan otomatis); modal konfirmasi UI-nya sudah ada, tombol "Create Project" masih mengarah ke halaman Project yang **masih stub** (Fase 3) — disambungkan penuh nanti begitu Project jadi entity asli
- [x] 1.7 Pest test: CRUD Contact & Opportunity, scoping per-team (403/404 lintas team), validasi camelCase vs snake_case dari form React, move-stage — `ContactManagementTest` (7 test) + `OpportunityManagementTest` (10 test)
- [x] 1.8 Method stub Contact/Opportunity dihapus dari `StubWorkspaceData` (`contacts()`, `contactCreateContext()`, `contactDetail()`, `contactEditContext()`, `contactDetailRecords()`, `opportunities()`, `opportunityCreateContext()`, `opportunityEditContext()`). `contactOptions()`/`contactRecords()` tetap dipertahankan karena masih dipakai Project & Proposal (belum migrasi ke Fase 3/4)
- [x] 1.9 Halaman React (`contacts/create.tsx`, `contacts/edit.tsx`, `opportunities/create.tsx`, `opportunities/edit.tsx`) disambungkan pakai `useForm` Inertia (submit asli, validation error display, bukan lagi navigasi lokal doang)

**Fase 1 selesai** dan sudah diverifikasi end-to-end di browser (create/edit/delete Contact, create/edit/delete/drag-stage Opportunity, activity log tampil).

## Fase 2 — Public Lead Form

Bergantung ke Fase 1 (submission bikin Contact + Opportunity).

- [ ] 2.1 Migrasi kolom Team dari Fase 0.1 dipakai di halaman Settings (upload banner lewat media library, live preview sudah ada di UI)
- [ ] 2.2 Integrasi Turnstile di form publik (`public/lead-form.tsx`), fail closed kalau secret key tidak ada
- [ ] 2.3 Handler submit: dedupe Contact by email dalam team yang sama, buat Opportunity baru stage `inbox` source `"Public form"`
- [ ] 2.4 Notifikasi email ke owner team saat lead baru masuk (lewat Brevo)
- [ ] 2.5 Fallback tampilan form kalau team belum kustomisasi (nama team + deskripsi generic) — sudah ada di UI, tinggal pastikan konsisten dengan data asli
- [ ] 2.6 Pest test: submission valid → Contact+Opportunity tercipta; submission tanpa Turnstile token → ditolak; dedupe by email teruji

## Fase 3 — Project & Task

Bergantung ke Fase 1 (Project terhubung ke Opportunity yang won).

- [ ] 3.1 Migration + model `Project` (belongsTo Opportunity, status enum, `sort_order` double)
- [ ] 3.2 Migration + model `Task` (belongsTo Project, status: todo/in_progress/done)
- [ ] 3.3 Migration + model `RequestLog` (belongsTo Project, catatan revisi/permintaan ad-hoc dari klien)
- [ ] 3.4 `ProjectsController`, `ProjectCreateController`, `ProjectEditController`, `ProjectShowController` pakai Eloquent
- [ ] 3.5 Endpoint reorder drag Kanban pakai fractional indexing (`sort_order` = rata-rata dua tetangga), tanpa update semua row lain
- [ ] 3.6 Task CRUD dari halaman Project show (tabel/board yang sudah ada di UI)
- [ ] 3.7 Request Log CRUD dari halaman Project show
- [ ] 3.8 Pest test: CRUD Project/Task/RequestLog, reorder Kanban, scoping per-team
- [ ] 3.9 Hapus method stub Project/Task dari `StubWorkspaceData`

## Fase 4 — Document (Proposal, Quote, Invoice)

Model tunggal `Document` dengan `type` discriminator, sesuai PRD. Bergantung ke Fase 1 (opportunity_id) dan Fase 3 (project_id).

- [ ] 4.1 Migration + model `Document` (type: proposal/quote/invoice; status: draft/sent/viewed/accepted/rejected, plus `overdue` khusus invoice; relasi opsional ke `opportunity_id` dan `project_id` sesuai keputusan 0.8)
- [ ] 4.2 Migration + model `DocumentItem` (line items, belongsTo Document)
- [ ] 4.3 `ProposalsController` + create/edit/show controllers pakai Eloquent
- [ ] 4.4 `QuotationsController` + create/show controllers pakai Eloquent
- [ ] 4.5 `InvoicesController` + create/show controllers pakai Eloquent
- [ ] 4.6 Integrasi AI generation untuk proposal, memakai Profile Library (bergantung ke Fase 8, atau AI generation jalan lebih dulu tanpa personalisasi lalu disempurnakan setelah Fase 8)
- [ ] 4.7 Proposal accepted → tawarkan create quote/invoice draft (user pilih, bukan otomatis) — UI-nya sudah ada di beberapa alur, sambungkan ke data asli
- [ ] 4.8 Quote accepted → buat invoice dengan import line item dari quote tersebut
- [ ] 4.9 Pest test: CRUD tiap tipe Document, transisi status, quote→invoice line item import
- [ ] 4.10 Hapus method stub Proposal/Quote/Invoice dari `StubWorkspaceData`

## Fase 5 — Payment tracking

Bergantung ke Fase 4 (Document harus ada dulu).

- [ ] 5.1 Migration + model `Payment` (belongsTo Document/invoice, banyak record per invoice untuk kasus DP + pelunasan)
- [ ] 5.2 Form pencatatan payment manual di halaman invoice show (field bebas: metode, jumlah, tanggal, catatan)
- [ ] 5.3 Kalkulasi amount paid/amount due otomatis dari total payment record
- [ ] 5.4 Pest test: banyak payment per invoice, kalkulasi amount due benar

## Fase 6 — Share & PDF

Bergantung ke Fase 4 (Document) dan keputusan 0.9 (skema URL).

- [ ] 6.1 Tambah kolom `public_token` (unik) ke tabel `documents`
- [ ] 6.2 Route publik `/d/{document:public_token}` (ganti/selaraskan dengan yang sudah dibangun di versi stub)
- [ ] 6.3 Migrasi `public/document.tsx` dari data stub ke data asli lewat token
- [ ] 6.4 Job queued (`ShouldQueue`) generate PDF lewat Browsershot dari route print khusus (halaman polos, tanpa tombol aksi)
- [ ] 6.5 Simpan hasil PDF lewat media library, cache berdasarkan hash konten — tidak generate ulang kalau konten belum berubah
- [ ] 6.6 Tombol "Download PDF" di halaman share dan di halaman internal disambungkan ke job ini
- [ ] 6.7 Pest test: token invalid → 404; PDF ter-cache tidak generate ulang saat konten sama

## Fase 7 — Reminder & Email

Bergantung ke Fase 4/5 (butuh Document dan status Payment).

- [ ] 7.1 Migration + model `ReminderJob` (belongsTo Document)
- [ ] 7.2 Scheduled command: cek invoice mendekati/lewat jatuh tempo, quote belum direspon → buat/jadwalkan reminder job
- [ ] 7.3 Kirim email reminder lewat Brevo
- [ ] 7.4 Halaman `reminders/index.tsx` disambungkan ke data asli (bukan stub)
- [ ] 7.5 Pest test: reminder ter-generate sesuai kondisi tanggal, tidak dobel kirim

## Fase 8 — Profile Library

Bisa dikerjakan paralel kapan saja setelah Fase 0, karena tidak bergantung ke modul lain — tapi hasil AI proposal generation (4.6) idealnya menunggu fase ini supaya personalisasinya bermakna.

- [ ] 8.1 Migration + model `ProfileAsset` (portfolio, testimonial, snippet teks; upload gambar lewat media library)
- [ ] 8.2 `ProfileLibraryController` (index/create/edit) pakai Eloquent
- [ ] 8.3 Sambungkan Profile Library ke AI proposal generation (4.6) sebagai konteks
- [ ] 8.4 Pest test: CRUD ProfileAsset, scoping per-team

## Fase 9 — Setelah semua P0 dinamis

- [ ] 9.1 Regresi penuh: jalankan seluruh Pest suite + smoke test manual tiap halaman
- [ ] 9.2 Hapus `StubWorkspaceData` sepenuhnya kalau sudah tidak ada method yang dipakai
- [ ] 9.3 Review ulang P1 (billing Midtrans, activity log di semua entity, AI cost calculator, multi-user per team dengan role granular, theme switcher per akun, field `win_probability`/`expected_close_date`) — baru dikerjakan setelah P0 stabil dipakai harian, sesuai PRD

---

## Keputusan yang sudah diambil

- **Urutan mulai**: Fase 1 (Contact & Opportunity) duluan, sesuai urutan dependency di atas.
- **Skema URL dokumen publik (0.9)**: ikut PRD, token-based (`/d/{public_token}`).
- **Validasi Document (0.8)**: boleh berdiri sendiri, `opportunity_id`/`project_id` nullable.
- **Role & permission**: ditunda sampai P1. Fase 1-9 cukup pakai akses single-owner per team lewat `EnsureTeamMembership` yang sudah ada, `spatie/laravel-permission` belum dipakai policy-nya dulu.

## Masih perlu klarifikasi (belum menghalangi Fase 1, baru relevan waktu masuk fase terkait)

1. **Provider AI untuk proposal generation (poin 0.5, relevan di Fase 4)** — mau mulai dengan provider apa (OpenAI/Anthropic/DeepSeek/lainnya), dan apakah API key-nya sudah ada atau perlu disiapkan dulu?
2. **Cloudflare Turnstile (poin 0.7, relevan di Fase 2)** — perlu site key + secret key dari akun Cloudflare kamu. Sudah ada, atau perlu dibuat dulu?
3. **Brevo (poin 0.6, relevan di Fase 2/7)** — perlu API key Brevo untuk transactional email (reminder, notifikasi lead baru, notifikasi dokumen terkirim). Sudah ada akunnya?
