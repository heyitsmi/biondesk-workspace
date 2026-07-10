# Tasks: Biondesk — dari halaman stub ke sistem dinamis

*Lihat [concept.md](concept.md) untuk latar belakang produk dan [PRD.md](PRD.md) untuk requirement lengkap. Dokumen ini adalah breakdown eksekusi, bukan pengganti PRD — kalau ada konflik soal *apa* yang harus dibangun, PRD yang menang; dokumen ini hanya mengatur *urutan* dan *cara* membangunnya.*

## Status saat ini

Dokumen ini awalnya dibuat sebagai breakdown eksekusi untuk mengubah halaman stub menjadi sistem dinamis. Per Juli 2026, fase P0 utama sudah selesai: modul Dashboard, Opportunities, Projects, Contacts, Proposals, Quotations, Invoices, Reminders, Profile Library, Settings, public lead form, dan public document view sudah tersambung ke data asli. `StubWorkspaceData` sudah dihapus.

Yang sudah berjalan:
- Fondasi auth (Fortify: login, register, 2FA, passkey, password confirmation) dan Team/Membership/TeamInvitation.
- Data model utama: Contact, Opportunity, Project, Task, RequestLog, Document, DocumentItem, Payment, ReminderJob, ProfileAsset.
- Public lead form dengan Turnstile fail-closed dan notifikasi email.
- Public document share memakai token `/d/{document:public_token}`.
- PDF generation via queued job dan Spatie Browsershot.
- Payment tracking invoice bersifat manual. Client membayar langsung ke user lewat payment link atau instruksi pembayaran milik user; Biondesk tidak memproses, menahan, routing, escrow, atau reconcile otomatis pembayaran client.

Fokus setelah P0:
- Membuka early access untuk 5-10 user eksternal sebagai validasi distribusi dan workflow nyata.
- Menyempurnakan landing page, onboarding, dan positioning agar jelas bahwa Biondesk adalah workflow workspace, bukan payment processor.
- Menunda subscription billing Biondesk sampai ada sinyal willingness-to-pay yang cukup kuat.

Riwayat fase di bawah tetap dipertahankan sebagai catatan keputusan dan implementasi.

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
- [x] 0.9 Skema URL dokumen publik: **ikut PRD**, `/d/{document:public_token}` (token unik, tanpa team di URL). Diimplementasikan di Fase 6, menggantikan rute stub `/d/{team:slug}/{document}`

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

- [x] 2.1 Migrasi kolom Team dari Fase 0.1 dipakai di halaman Settings (upload banner lewat media library, live preview sudah ada di UI)
- [x] 2.2 Integrasi Turnstile di form publik (`public/lead-form.tsx`), fail closed kalau secret key tidak ada
- [x] 2.3 Handler submit: dedupe Contact by email dalam team yang sama, buat Opportunity baru stage `inbox` source `"Public form"`
- [x] 2.4 Notifikasi email ke owner team saat lead baru masuk (lewat Brevo)
- [x] 2.5 Fallback tampilan form kalau team belum kustomisasi (nama team + deskripsi generic) — sudah ada di UI, tinggal pastikan konsisten dengan data asli
- [x] 2.6 Pest test: submission valid → Contact+Opportunity tercipta; submission tanpa Turnstile token → ditolak; dedupe by email teruji

**Fase 2 selesai.** Backend: `PublicLeadFormSubmitController` (dedupe Contact + create Opportunity di stage Inbox + email owner), `ValidTurnstileToken` rule (fail closed), `PublicLeadFormController`/`PublicLeadFormSettingsController` pakai data Team asli (`Team::leadFormSettings()`), upload banner lewat Spatie Media Library. Frontend: `public/lead-form.tsx` pakai `useForm` + Turnstile widget kondisional (disembunyikan/nonaktif kalau site key belum diisi) + tema latar per-team; `settings/lead-form.tsx` submit ke endpoint asli (toggle enabled auto-save, form appearance & fields terpisah, upload banner). 13 Pest test baru (`PublicLeadFormSubmitTest`, `PublicLeadFormSettingsTest`) plus 2 test lama di-update.

Catatan/gap yang diketahui:
- Turnstile site key & secret key, serta kredensial SMTP Brevo, sengaja dikosongkan di `.env`/`.env.example` — user mengisi sendiri. Tanpa site key, widget Turnstile disembunyikan dan tombol submit dinonaktifkan (submission akan selalu ditolak server, sesuai kebijakan fail-closed).
- Upload file attachment dari form publik (toggle `lead_form_allow_attachments`) belum diimplementasikan — kolomnya sudah ada di database tapi tidak ada input file di UI publik. Tidak ada di PRD sebagai requirement P0.
- Tema "Brand Color Auto-Match" untuk `backgroundTheme` saat ini fallback ke tema dark (belum ada data warna brand tersimpan per-team).

## Fase 3 — Project & Task

Bergantung ke Fase 1 (Project terhubung ke Opportunity yang won).

- [x] 3.1 Migration + model `Project` (belongsTo Opportunity, status enum, `sort_order` double)
- [x] 3.2 Migration + model `Task` (belongsTo Project, status: backlog/todo/in_progress/in_review/done)
- [x] 3.3 Migration + model `RequestLog` (belongsTo Project, catatan revisi/permintaan ad-hoc dari klien)
- [x] 3.4 `ProjectsController`, `ProjectCreateController`, `ProjectEditController`, `ProjectShowController` pakai Eloquent
- [x] 3.5 Endpoint reorder drag Kanban pakai fractional indexing (`sort_order` = max item lain di kolom tujuan + 1000), tanpa update semua row lain
- [x] 3.6 Task CRUD dari halaman Project show (tabel/board yang sudah ada di UI)
- [x] 3.7 Request Log CRUD dari halaman Project show
- [x] 3.8 Pest test: CRUD Project/Task/RequestLog, reorder Kanban, scoping per-team
- [x] 3.9 Hapus method stub Project/Task dari `StubWorkspaceData`

**Fase 3 selesai.** Backend: `Project`/`Task`/`RequestLog` model + migration baru, `ProjectStoreController`/`UpdateController`/`DestroyController`/`MoveController`, `TaskStoreController`/`UpdateController`/`MoveController`/`DestroyController`, `RequestLogStoreController`/`UpdateController`/`DestroyController`/`ConvertToTaskController`. Aktivitas manual (`Project::logActivity()`) dicatat lewat `spatie/laravel-activitylog` untuk setiap perubahan task/request log, ditampilkan real di tab Activity Log. Attachment task & request log pakai Spatie Media Library asli (bukan lagi nama file saja). Frontend: `projects/index.tsx` drag-and-drop kolom kanban sekarang benar-benar memanggil endpoint move (status + sort_order); `projects/create.tsx` & `projects/edit.tsx` pakai `useForm` dengan opportunity picker asli (opportunity yang sudah ada project-nya otomatis disembunyikan dari pilihan); `projects/show.tsx` (4 tab: Details/Tasks/Request Log/Activity Log) sepenuhnya disambungkan ke backend asli, termasuk fitur "Extract with AI" (saran task tetap fake/lokal sesuai PRD P2, tapi task yang dikonfirmasi user beneran tersimpan). Tombol "Create Project" di modal "deal won" opportunities/index.tsx sekarang navigasi ke halaman create dengan opportunity ter-pre-fill. 24 Pest test baru (`ProjectManagementTest`, `TaskManagementTest`, `RequestLogManagementTest`), plus `AppScaffoldPagesTest` diperbarui dari stub ke data asli.

Keputusan yang diambil untuk konflik stub vs PRD (lihat sesi klarifikasi):
- **Task status**: tetap 5 status (backlog/todo/in_progress/in_review/done) sesuai UI yang sudah dibangun, bukan 3 status versi PRD.
- **RequestLog fields**: semua field stub (source/classification/notes/attachments) disimpan; "Extract with AI" tetap fitur lokal/fake (bukan real AI call), sesuai catatan PRD bahwa versi AI adalah upgrade P2.
- **Project fields**: ikut PRD — `opportunity_id` sebagai relasi utama (client ditampilkan lewat opportunity→contact), field `leadId`/`leads` (project lead/assignee) dihapus karena tidak ada infrastruktur assignee di aplikasi ini.

Catatan/gap yang diketahui:
- Halaman "Details" di project show hanya bisa edit title/status/description inline; ubah opportunity, tanggal, atau budget harus lewat halaman "Edit Project" khusus (karena opportunity terkait sebuah project tidak dirancang untuk berubah setelah dibuat).
- Deletion attachment task/request log yang sudah ter-upload belum didukung (hanya bisa menambah, belum ada tombol hapus attachment lama) — gap yang sama seperti banner lead form di Fase 2.

## Fase 4 — Document (Proposal, Quote, Invoice)

Model tunggal `Document` dengan `type` discriminator, sesuai PRD. Bergantung ke Fase 1 (opportunity_id) dan Fase 3 (project_id).

- [x] 4.1 Migration + model `Document` (type: proposal/quote/invoice; status: draft/sent/viewed/accepted/rejected, plus `overdue` khusus invoice; relasi opsional ke `opportunity_id` dan `project_id` sesuai keputusan 0.8)
- [x] 4.2 Migration + model `DocumentItem` (line items, belongsTo Document)
- [x] 4.3 `ProposalsController` + create/edit/show controllers pakai Eloquent
- [x] 4.4 `QuotationsController` + create/show controllers pakai Eloquent
- [x] 4.5 `InvoicesController` + create/show controllers pakai Eloquent
- [x] 4.6 Integrasi AI generation untuk proposal (tombol "Generate with AI" di proposals/create.tsx) — provider **configurable** lewat `AI_PROVIDER` env (openai/anthropic/deepseek), abstraksi di `app/Support/Ai/` (tanpa dependency Composer baru, pakai `Http` facade langsung, sama seperti pola Turnstile/Brevo). Personalisasi dari Profile Library belum disambungkan (Fase 8 belum ada model Eloquent-nya) — generation jalan tanpa konteks tambahan dulu sesuai kontingensi di atas.
- [x] 4.7 Proposal accepted → tawarkan create quote/invoice draft (user pilih, bukan otomatis) — modal di proposals/index.tsx disambungkan ke `proposals.convert-to-quote`/`proposals.convert-to-invoice`
- [x] 4.8 Quote accepted → buat invoice dengan import line item dari quote tersebut (`quotations.convert-to-invoice`)
- [x] 4.9 Pest test: CRUD tiap tipe Document, transisi status, quote→invoice line item import (`tests/Feature/DocumentManagementTest.php`)
- [x] 4.10 Hapus method stub create/edit-context Proposal/Quote/Invoice dari `StubWorkspaceData` (method list/detail dipertahankan karena `PublicDocumentController` — Fase 6 — masih memakainya)

**Fase 4 selesai sepenuhnya**: Document/DocumentItem model dengan total dihitung dari line item (bukan kolom tersimpan), nomor dokumen auto-generate per tipe per tahun (`P-2026-0001`, dst), status "overdue" untuk invoice adalah state turunan (bukan kolom persisten) karena pelacakan lunas/belum baru ada di Fase 5. Skema URL publik (`/d/{team:slug}/{document}`) belum diubah ke token-based — itu bagian Fase 6 dan `PublicDocumentController` masih memakai `StubWorkspaceData::publicDocumentContext()`. Halaman quotations/invoices belum punya form edit terpisah (mengikuti stub asli yang juga tidak punya), hanya create + show dengan aksi status. AI provider dikonfirmasi user: configurable (openai/anthropic/deepseek via `AI_PROVIDER`), user sudah punya key untuk ketiganya (diisi manual di `.env` lokal).

## Fase 5 — Payment tracking

Bergantung ke Fase 4 (Document harus ada dulu).

- [x] 5.1 Migration + model `Payment` (belongsTo Document/invoice, banyak record per invoice untuk kasus DP + pelunasan)
- [x] 5.2 Form pencatatan payment manual di halaman invoice show (field bebas: metode, jumlah, tanggal, catatan)
- [x] 5.3 Kalkulasi amount paid/amount due otomatis dari total payment record
- [x] 5.4 Pest test: banyak payment per invoice, kalkulasi amount due benar (`tests/Feature/PaymentTrackingTest.php`)

**Fase 5 selesai**: `Payment` belongsTo `Document`, hanya bisa dicatat untuk document bertipe invoice (controller memfilter `type = invoice` sebelum findOrFail, 404 kalau bukan invoice atau beda team). `Document::amountPaidValue()`/`amountDueValue()` dihitung dari relasi `payments` (bukan kolom tersimpan), `amountDueValue()` di-clamp minimal 0 kalau total pembayaran melebihi total invoice (overpayment tidak menghasilkan angka negatif). Form pencatatan pakai `useForm` inline di sidebar invoice show (toggle show/hide), bukan modal — konsisten dengan pola sidebar-form yang sudah ada di halaman itu. Belum ada fitur edit/hapus payment yang sudah tercatat (gap yang sama seperti attachment di Fase 3).

## Fase 6 — Share & PDF

Bergantung ke Fase 4 (Document) dan keputusan 0.9 (skema URL).

- [x] 6.1 Tambah kolom `public_token` (unik) ke tabel `documents` (sudah ada sejak Fase 4; ditambah `creating` hook di model + migration backfill untuk row lama yang belum punya token)
- [x] 6.2 Route publik `/d/{document:public_token}` (ganti dari stub `/d/{team:slug}/{document}`)
- [x] 6.3 Migrasi `public/document.tsx` dari data stub ke data asli lewat token (`Document::toPublicArray()`, unifikasi proposal/quotation/invoice)
- [x] 6.4 Job queued (`GenerateDocumentPdfJob implements ShouldQueue`) generate PDF lewat Browsershot dari route print khusus `/d/{token}/print` (Blade polos, tanpa tombol aksi, CSS inline)
- [x] 6.5 Simpan hasil PDF lewat media library (collection `pdf`, `singleFile()`), cache berdasarkan `content_hash` (SHA-256 dari seluruh field + line item) disimpan sebagai custom property media — tidak generate ulang kalau hash sama
- [x] 6.6 Tombol "Download PDF" di halaman share dan tiga halaman internal (proposal/quotation/invoice show) disambungkan lewat hook `useDocumentPdfDownload` (generate → poll status → download)
- [x] 6.7 Pest test: token invalid → 404; PDF ter-cache tidak generate ulang saat hash sama; regenerate saat konten berubah (`DocumentPdfTest`, `PublicDocumentPageTest`)

**Fase 6 selesai**: install `spatie/browsershot` (Composer) + `puppeteer` (npm, dengan Chrome headless-shell terpasang lewat `npx puppeteer browsers install chrome-headless-shell`) — disetujui user sebelum instalasi. PDF generation genuinely queued (bukan `dispatchSync`), diverifikasi lewat `queue:listen` yang jalan di `composer run dev`; endpoint generate mengembalikan `{status: ready}` langsung kalau cache valid, atau `{status: queued}` lalu frontend polling `/pdf/status` sampai selesai baru redirect ke `/pdf/download`. `DocumentPdfRenderer` diekstrak jadi class terpisah supaya bisa di-mock di test (tidak butuh Chrome di CI). Diverifikasi manual end-to-end di browser: generate pertama kali lewat job asli + Browsershot asli (45KB PDF), klik kedua kali langsung `ready` tanpa job baru (caching bekerja).

## Fase 7 — Reminder & Email

Bergantung ke Fase 4/5 (butuh Document dan status Payment).

- [x] 7.1 Migration + model `ReminderJob` (belongsTo Document; kolom `type`, `scheduled_at`, `sent_at`, `dismissed_at`; unique `[document_id, type]`)
- [x] 7.2 Scheduled command `reminders:generate` (daily): invoice sent/viewed dengan `due_at` dalam 3 hari → `invoice_due_soon`; invoice sent/viewed dengan `due_at` sudah lewat → `invoice_overdue`; quote sent/viewed dengan `valid_until` sudah lewat → `quote_unresponded`. Dedup lewat `firstOrCreate` + unique constraint DB
- [x] 7.3 Kirim email reminder lewat Brevo (`DocumentReminderMail`, markdown mailable, dikirim ke `document->contact->email`; skip diam-diam kalau document tidak punya contact); `sent_at` dicatat supaya tidak pernah dikirim dua kali
- [x] 7.4 Halaman `reminders/index.tsx` disambungkan ke data asli (`RemindersController` + `ReminderJob::toReminderArray()`)
- [x] 7.5 Pest test: kondisi tanggal (due soon/overdue/quote expired vs belum), tidak dobel generate/kirim saat command dijalankan dua kali, document tanpa contact tidak crash, dismiss toggle + team scoping (`ReminderGenerationTest`, 9 test)

**Fase 7 selesai**: `ReminderJob` murni terhubung ke Document (bukan freeform to-do) — sesuai data model yang sudah didokumentasikan di CLAUDE.md, tidak ada entity "reminder manual" terpisah. Fitur "Add Reminder" bebas teks + edit judul yang ada di UI stub **dihapus** karena tidak ada entity yang mendukungnya; diganti checkbox dismiss/undismiss yang tersambung ke `dismissed_at` sungguhan. `ReminderLinkKind` disederhanakan jadi `invoice | quotation` saja (sebelumnya juga ada `proposal`/`project`/`contact` yang tidak pernah dipakai reminder asli). Threshold "due soon" di-hardcode 3 hari (belum ada setting per-team untuk ini, sesuai PRD yang tidak menyebutkan angka spesifik).

## Fase 8 — Profile Library

Bisa dikerjakan paralel kapan saja setelah Fase 0, karena tidak bergantung ke modul lain — tapi hasil AI proposal generation (4.6) idealnya menunggu fase ini supaya personalisasinya bermakna.

- [x] 8.1 Migration + model `ProfileAsset` (belongsTo Team; kategori company/team/case/asset; upload gambar lewat media library, collection `image` singleFile)
- [x] 8.2 `ProfileLibraryController` (index/create/store/edit/update/destroy/duplicate) pakai Eloquent
- [x] 8.3 Sambungkan Profile Library ke AI proposal generation (4.6) sebagai konteks — entri `ProfileAsset` tim ditambahkan ke system prompt `ProposalAiDraftController`
- [x] 8.4 Pest test: CRUD ProfileAsset, scoping per-team, context AI (`ProfileLibraryTest`, tambahan test di `ProposalAiDraftTest`)

**Fase 8 selesai**: Kategori `ProfileAsset` dipertahankan mengikuti taksonomi UI stub yang sudah ada (company/team/case/asset — "Company Info"/"Team Bio"/"Case Study"/"Assets") alih-alih taksonomi longgar "portfolio/testimonial/snippet" di PRD, karena keduanya menjelaskan hal yang sama dan UI-nya sudah jadi/diverifikasi sejak fase awal — tidak ada alasan membongkar ulang. Fitur duplicate profile (ada di stub asli) dipertahankan sebagai aksi backend sungguhan (`profiles.duplicate`, menyalin record + gambar via `Media::copy()`), bukan dihapus, karena sepenuhnya didukung entity yang sudah ada. Toolbar format teks (Bold/Italic/List/Link) di editor body dihapus karena dekoratif belaka (textarea polos, tidak ada rich text rendering di baliknya). AI context memakai `ProfileAsset::contextLine()` (ringkasan `[kategori] judul: excerpt`) yang di-append ke system prompt, bukan ke user prompt, supaya brief asli klien tetap terpisah dari data internal studio.

## Fase 9 — Setelah semua P0 dinamis

- [x] 9.1 Regresi penuh: seluruh Pest suite (217 test, semua lulus) + smoke test manual tiap halaman utama (dashboard, opportunities, projects, proposals/quotations/invoices, contacts, reminders, profile library, settings lead-form) lewat browser, tanpa error console
- [x] 9.2 Hapus `StubWorkspaceData` sepenuhnya — ternyata masih dipakai satu method (`dashboard()`) yang belum pernah masuk checklist fase manapun, jadi sebelum dihapus, dashboard landing page terlebih dulu disambungkan ke data asli (lihat catatan di bawah)
- [x] 9.3 Review ulang P1 — tidak ada perubahan kode, semua item (billing Midtrans, activity log di semua entity, AI cost calculator, multi-user per team dengan role granular, theme switcher per akun, field `win_probability`/`expected_close_date`) tetap ditunda sesuai PRD, tidak ada blocker P0 yang ditemukan yang mengharuskan salah satu item ini dikerjakan lebih awal

**Fase 9 selesai — termasuk penambahan di luar checklist awal**: dashboard (`/app/{team}/dashboard`) ternyata belum pernah disambungkan ke data asli di fase manapun (gap yang baru ketahuan saat cek pemakaian `StubWorkspaceData`). Dikonfirmasi ke user, lalu dikerjakan sebagai bagian Fase 9: `app/Support/Dashboard/DashboardSummary.php` menghitung 4 stat tile dari data asli (Pipeline Value dari opportunity yang belum won/lost, To Be Collected dari `Document::amountDueValue()` invoice yang belum draft/rejected, Active Projects dari status project, Win Rate dari 12 deal won/lost terakhir), priority actions dari invoice overdue + project waiting-on-client + opportunity tanpa aktivitas (masing-masing ada threshold hari, diurutkan berdasarkan urgensi), recent opportunities dari opportunity terbaru, dan activity feed lintas-entity dari `spatie/laravel-activitylog` (query polymorphic ke Contact/Opportunity/Project/Document/ProfileAsset/Payment, dibatasi ke team yang sedang aktif). `Payment` model ditambahkan `LogsActivity` (sebelumnya belum ada) supaya "Payment received" muncul di feed; `Contact`/`Opportunity`/`ProfileAsset` ditambahkan `setDescriptionForEvent` supaya deskripsi activity log-nya enak dibaca di feed (sebelumnya cuma teks mentah "created"/"updated"). Tidak ada percobaan menghitung tren "vs bulan lalu" karena tidak ada snapshot historis — angka yang ditampilkan semuanya real-time, bukan fabrikasi. `StubWorkspaceData` (beserta 8 method lain yang sudah mati sejak fase-fase sebelumnya) dihapus total setelah dashboard tersambung.

---

## Keputusan yang sudah diambil

- **Urutan mulai**: Fase 1 (Contact & Opportunity) duluan, sesuai urutan dependency di atas.
- **Skema URL dokumen publik (0.9)**: ikut PRD, token-based (`/d/{public_token}`).
- **Validasi Document (0.8)**: boleh berdiri sendiri, `opportunity_id`/`project_id` nullable.
- **Role & permission**: ditunda sampai P1. Fase 1-9 cukup pakai akses single-owner per team lewat `EnsureTeamMembership` yang sudah ada, `spatie/laravel-permission` belum dipakai policy-nya dulu.
- **Cloudflare Turnstile (poin 0.7, Fase 2)**: user sudah punya key sendiri, diisi manual di `.env` lokal (slot `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` sudah disiapkan kosong di `.env.example`). Tanpa key terisi, form publik fail closed (submit ditolak).
- **Brevo (poin 0.6, Fase 2)**: user sudah punya API key Brevo, dipakai lewat SMTP relay bawaan Laravel (`MAIL_MAILER=smtp` ke `smtp-relay.brevo.com:587`), bukan paket API terpisah. `MAIL_USERNAME`/`MAIL_PASSWORD` diisi manual di `.env` lokal.
- **Provider AI (poin 0.5, Fase 4)**: configurable, bukan satu provider tetap. User sudah punya API key OpenAI, Anthropic, dan DeepSeek — provider aktif dipilih lewat `AI_PROVIDER` di `.env` (`openai`/`anthropic`/`deepseek`), abstraksi ada di `app/Support/Ai/` (`AiTextGeneratorFactory`), tanpa dependency Composer baru (pakai `Http` facade langsung, konsisten dengan pola Turnstile/Brevo).

## Masih perlu klarifikasi (belum menghalangi fase saat ini, baru relevan waktu masuk fase terkait)

Tidak ada item terbuka saat ini.
