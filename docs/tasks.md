# Tasks: Biondesk — dari halaman stub ke sistem dinamis

*Lihat [concept.md](concept.md) untuk latar belakang produk dan [PRD.md](PRD.md) untuk requirement lengkap. Dokumen ini adalah breakdown eksekusi, bukan pengganti PRD — kalau ada konflik soal *apa* yang harus dibangun, PRD yang menang; dokumen ini hanya mengatur *urutan* dan *cara* membangunnya.*

## Status saat ini

Dokumen ini awalnya dibuat sebagai breakdown eksekusi untuk mengubah halaman stub menjadi sistem dinamis. Per Juli 2026, fase P0 utama sudah selesai: modul Dashboard, Opportunities, Projects, Contacts, Proposals, Quotations, Invoices, Reminders, Profile Library, Settings, public lead form, dan public document view sudah tersambung ke data asli. `StubWorkspaceData` sudah dihapus.

Yang sudah berjalan:
- Fondasi auth (Fortify: login, register, 2FA, passkey, password confirmation) dan Team/Membership/TeamInvitation.
- Data model utama: Contact, Opportunity, Project, Task, RequestLog, RequestLogMessage, Document, DocumentItem, Payment, ReminderJob, ProfileAsset.
- Public lead form dengan Turnstile fail-closed dan notifikasi email.
- Public document share memakai token `/d/{document:public_token}`.
- Client Portal token-based per Contact (`/c/{contact:portal_token}`), request threads, attachment, dedicated request detail, dan client-visible scoping.
- AI Request Log breakdown dengan structured output, semantic duplicate/related detection memakai OpenAI embeddings + pgvector, dan idempotent task creation dari hasil AI.
- Workflow Automation V1: template-based rules, internal actions only, trigger dari client request/reply, perubahan status request/project, dan scheduler invoice/quote, lengkap dengan idempotent run history.
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
- Tema "Brand Color Auto-Match" untuk `backgroundTheme` saat ini fallback ke tema dark (belum ada data warna brand tersimpan per-team).

### Perluasan Fase 2 (pasca-Fase 9) — kustomisasi lanjutan & SEO

Dikerjakan setelah semua fase P0 selesai, sebagai permintaan langsung user (bukan bagian breakdown asli), tetap dicatat di sini karena masih memperluas modul yang sama (public lead form).

- **Custom link**: kolom `lead_form_slug` (nullable, unik global lintas `slug`/`lead_form_slug` semua team termasuk yang soft-deleted). Route `/p/{team}` diubah dari implicit binding `{team:slug}` jadi string biasa, diresolusi lewat `Team::findByLeadFormSlug()` (cek `lead_form_slug` dulu, fallback ke `slug`).
- **Background & cover banner**: tema `backgroundTheme` dapat opsi baru `custom` (warna hex bebas dan/atau gambar latar), plus cover banner (strip lebar di atas logo). Tiga media library collection baru: `lead-form-background`, `lead-form-cover` (keduanya `singleFile()`).
- **Upload lampiran dari form publik**: gap yang dicatat di atas (toggle `lead_form_allow_attachments` sudah ada kolomnya tapi belum ada UI/handler) **sudah diimplementasikan**. `Opportunity` sekarang `implements HasMedia` dengan collection `attachments` (bukan `singleFile()`, klien bisa upload sampai 5 file/10MB masing-masing); server tetap memvalidasi toggle team sebelum memproses file meski UI publik sudah menyembunyikan input-nya (defense-in-depth). File yang terupload muncul sebagai link download di email notifikasi lead baru.
- **Link media sosial & custom link dengan ikon**: kolom JSON `lead_form_social_links` (maks 8 entri, platform dari enum tertutup `SocialLinkPlatform`: instagram/twitter/linkedin/facebook/tiktok/youtube/github/dribbble/behance/website). Ikon SVG inline per-platform dirender di header form publik (`public/lead-form.tsx` berdiri sendiri tanpa akses ke sprite ikon aplikasi utama, jadi ikonnya di-inline langsung, bukan versi brand yang presisi pixel-perfect).
- **Meta tag SEO**: kolom `lead_form_meta_title`/`lead_form_meta_description` plus media collection `lead-form-og-image`, dengan fallback berjenjang (meta title → judul form; meta description → pesan sambutan, dipotong 160 karakter; OG image → cover banner → logo). Form publik merender `<meta>` description, Open Graph, dan Twitter Card lengkap.
- **Perbaikan bug**: judul tab browser form publik sebelumnya hardcoded `"{nama team} lead form"`, sekarang memakai `settings.title` asli. Validasi file upload (`banner`/`background_image`/`cover_banner`) sebelumnya cuma `sometimes` tanpa `nullable`, menyebabkan error validasi palsu "must be an image" saat menyimpan pengaturan lain tanpa memilih file baru — sudah ditambah `nullable`. Upload file lewat key camelCase (`backgroundImage`/`coverBanner`/`ogImage`, sesuai penamaan `useForm` di React) sekarang dipetakan ke key snake_case *sebelum* kode lain menyentuh `has()`/`input()` di `prepareForValidation()`, karena `Request::allFiles()` di Laravel meng-cache hasilnya di akses pertama — kalau file bag dimutasi setelah cache terbentuk, mutasinya tidak akan pernah terlihat oleh `hasFile()`/`file()` di controller manapun. Upload lewat Spatie Media Library sekarang pakai `addMedia($request->file($key))` (bukan `addMediaFromRequest($key)`), karena helper `addMediaFromRequest()` memanggil `request()` global secara internal yang instance-nya tidak selalu sama dengan FormRequest yang di-inject ke controller.
- Pest test baru mencakup semua di atas (`PublicLeadFormSettingsTest`, `PublicLeadFormTest`, `PublicLeadFormSubmitTest`), full suite 251 test lulus.

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

### Perluasan Fase 5 (pasca-Fase 9) — recurring/retainer invoice

Dikerjakan sebagai permintaan langsung user (ide "modul apa lagi yang menaikkan value Biondesk"), bukan bagian breakdown asli, tapi memperluas modul invoice yang sama jadi dicatat di sini. Batasan eksplisit dari user: Biondesk tidak dan tidak akan punya payment gateway — fitur ini hanya mengotomatiskan pembuatan + pengiriman email invoice sesuai jadwal, status pembayaran tetap 100% manual lewat "Record Payment" yang sudah ada.

- **Model baru**: `RecurringInvoiceTemplate` (belongsTo Team/Contact/Project, punya `interval_months`, `due_days`, `starts_at`, `ends_at` nullable, `next_run_at`, `last_generated_at`, `occurrences_generated`, `auto_send`, `is_active`) + `RecurringInvoiceTemplateItem` (mirror persis `DocumentItem`). Kolom `recurring_invoice_template_id` (nullable, `nullOnDelete`) ditambahkan ke `documents` supaya invoice hasil generate tetap ada meski template-nya dihapus, plus `unique(['recurring_invoice_template_id', 'issued_at'])` sebagai backstop anti double-generate di level DB.
- **Penjadwalan berbasis anchor date, bukan chaining**: `next_run_at` SELALU dihitung ulang dari `starts_at` (`starts_at->addMonthsNoOverflow(occurrences_generated * interval_months)`), bukan dengan menambah bulan dari `next_run_at` sebelumnya berulang kali. Ini krusial untuk tanggal akhir bulan (misal `starts_at` tanggal 31) — kalau chaining dari nilai yang sudah di-clamp ke 28 (Februari), templatenya tidak akan pernah kembali ke tanggal 31 di bulan yang punya 31 hari. Ada regression test khusus untuk kasus ini di `GenerateRecurringInvoicesTest`.
- **Command `invoices:generate-recurring`** (dijadwalkan `->daily()->withoutOverlapping()` di `routes/console.php`, sama seperti `reminders:generate`): generate invoice + advance schedule dibungkus `DB::transaction()`, email dikirim di luar transaction. Template yang `contact_id`-nya null (kontak sudah dihapus) otomatis di-pause, tidak dibiarkan macet diam-diam.
- **Bug yang ditemukan & diperbaiki selama development**: query awal pakai `where('next_run_at', '<=', now()->toDateString())` — ternyata Eloquent cast `'date'` tetap menyimpan nilai dengan sufiks waktu penuh ("2026-01-31 00:00:00") ke kolom DB (perilaku Laravel yang sudah lama ada, bukan spesifik SQLite), sehingga perbandingan string persis di boundary hari yang sama selalu salah (invoice yang jatuh tempo tepat hari ini tidak akan pernah ter-generate sampai besok). Diperbaiki dengan `whereDate('next_run_at', '<=', now())` yang melakukan truncation di level SQL, bukan perbandingan string mentah.
- **Auto-send default aktif** (bisa dimatikan per-template) — invoice yang di-generate otomatis berstatus `Sent` dan email terkirim ke klien (`RecurringInvoiceGeneratedMail`, mirror `DocumentReminderMail`); kalau dimatikan, invoice tetap `Draft` untuk direview manual (belum ada tombol "Send" manual untuk invoice draft manapun di aplikasi ini — gap yang sudah ada sebelumnya, di luar scope perluasan ini).
- **UI**: bukan halaman/nav terpisah, melainkan tab "One-time / Recurring" di dalam `invoices/index.tsx` yang sudah ada (pola tab yang sama seperti di `projects/show.tsx`), plus 3 halaman baru (`invoices/recurring/create.tsx`, `show.tsx`, `edit.tsx`). Invoice yang di-generate dari template tetap muncul di tab "One-time" (data model-nya memang `Document` biasa) dengan badge kecil "Recurring" untuk membedakan.
- **Resume template yang lama di-pause**: kalau `next_run_at` sudah lewat saat di-resume, di-snap maju ke hari ini (bukan generate invoice mundur/backdated untuk periode yang terlewat).
- 20 Pest test baru (`RecurringInvoiceTemplateTest`, `GenerateRecurringInvoicesTest`).

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

## Fase 10 — Calendar

Modul baru genuine (bukan perluasan fase lain), dikerjakan atas permintaan langsung user setelah Fase 9 selesai — ide dari brainstorm "modul apa lagi yang menaikkan value Biondesk", lalu user secara eksplisit memperluas scope-nya jadi kalender penuh (freeform event, recurring, drag-resize) yang juga menggabungkan tanggal yang sudah dilacak sistem (due date invoice, deadline project, expiry quote, expected close opportunity), dibangun di atas FullCalendar v6.

- [x] 10.1 `npm install` paket FullCalendar (`core`, `react`, `daygrid`, `timegrid`, `list`, `interaction`, `rrule`) + `rrule` — semua MIT, tanpa plugin premium
- [x] 10.2 Migration `events` + enum `EventRecurrence` (daily/weekly/monthly/yearly) dan `EventColor` (accent/success/danger/info/muted, masing-masing punya `hex()` untuk dipakai backend maupun sinkron dengan token `--bion-*`)
- [x] 10.3 Model `Event` (belongsTo Team) dengan `toCalendarArray()` yang bercabang: non-recurring mengirim `start`/`end`, recurring mengirim `rrule` (`freq` + `dtstart`) + `duration` (string `HH:mm:ss` untuk event berwaktu, `{days: N}` untuk all-day)
- [x] 10.4 `App\Support\Calendar\CalendarAggregator` — 4 sumber read-only (invoice due date, quote expiry, project deadline, opportunity expected close), status exclusion masing-masing dicocokkan ke precedent yang sudah ada di `DashboardSummary` (bukan aturan baru)
- [x] 10.5 `DashboardSummary::upcomingEvents()` — gabungan event asli + hasil aggregator, window 14 hari ke depan (event recurring selalu ikut tanpa dibatasi window, karena tidak ada expansi RRULE di PHP untuk widget 5 item), dibatasi 5 item terurut tanggal
- [x] 10.6 Controller + FormRequest + route single-action untuk CRUD Event (`CalendarController`, `EventStoreController`, `EventUpdateController`, `EventMoveController`, `EventDestroyController`), pola manual team-scoping yang sama seperti seluruh controller lain di app ini
- [x] 10.7 Halaman `calendar/index.tsx` — `<FullCalendar>` dengan 5 plugin, sidebar checkbox filter per sumber, modal Add/Edit Event (reuse `MODAL_*` constants dari `projects/show.tsx`), drag-drop/resize lewat `router.patch` ke endpoint move
- [x] 10.8 Nav item Calendar di `app-shell.tsx` + widget "Upcoming events" di dashboard
- [x] 10.9 Pest test: `EventManagementTest`, `EventCalendarArrayTest`, `CalendarAggregatorTest`, tambahan di `DashboardSummaryTest` (31 test baru, total suite 295 test)

**Fase 10 selesai — keputusan desain yang dikonfirmasi lewat AskUserQuestion**: (1) edit/hapus recurring event berlaku untuk **seluruh seri saja** — tidak ada exception per-occurrence gaya Google Calendar ("this event"/"this and following"/"all events"). Konsekuensinya, event recurring `editable: false` di FullCalendar (tidak bisa di-drag/resize), diperkuat backstop server-side (`abort_if($event->recurrence !== null, 422)` di `EventMoveController`) karena `editable: false` di client saja tidak bisa dipercaya. (2) UI recurrence hanya preset sederhana (Does not repeat/Daily/Weekly/Monthly/Yearly), dianchor ke `starts_at` event — tidak ada custom interval, tidak ada pilihan hari-per-minggu, tidak ada kondisi berhenti (count/until). Client tidak pernah mengirim raw RRULE string, server cuma validasi enum 4 nilai. (3) Semua 4 sumber aggregasi dipakai (bukan subset).

**Keputusan desain teknis lain**: seluruh datetime event (baik `dtstart` recurring maupun `start`/`end` non-recurring) diserialisasi **tanpa timezone offset** (`format('Y-m-d\TH:i:s')`, bukan `toIso8601String()`) — floating local time yang deliberate, karena FullCalendar rrule plugin membaca `dtstart` sebagai instant UTC absolut kalau ada offset, atau sebagai wall-clock literal kalau tidak ada. Aplikasi ini tidak punya requirement multi-timezone (single-team/agency kecil), jadi ini keterbatasan v1 yang didokumentasikan, bukan bug — jangan "diperbaiki" dengan konversi timezone browser. Warna kalender butuh palet ke-5 (`info`) yang tidak ada di union `BiondeskTone` (`accent|success|danger|muted`) yang dipakai 6 file lain lewat `Record<BiondeskTone,...>` — dibuat type baru `CalendarColor` di `resources/js/types/calendar.ts` yang scoped ke modul ini saja, alih-alih melebarkan `BiondeskTone` bersama dan memaksa perubahan di file-file yang tidak terkait; batas antara keduanya ada di `DashboardSummary::upcomingEvents()` yang melipat `info` → `accent` sebelum dikirim ke tipe dashboard yang sudah ada. Record yang aggregator lacak **hilang dari kalender begitu statusnya closed** (invoice paid/rejected, quote accepted, project completed/cancelled, opportunity won/lost) — tidak ada mode "sticky/grayed-out", konsisten dengan cara `priorityActions()`/`stats()` di `DashboardSummary` sudah lama drop record closed.

## Fase 11 — BionAI

Modul chat AI baru, ide dari brainstorm "menu apa lagi yang menaikkan value Biondesk". User secara eksplisit memilih pendekatan tool-calling (bukan RAG klasik) supaya asisten tetap bisa menjawab pertanyaan umum di luar data workspace, sekaligus meminta pelacakan penggunaan token per user sebagai persiapan halaman AI usage di Super Admin (ditunda, bukan bagian fase ini).

- [x] 11.1 Migration + model `BionAiConversation` (belongsTo Team & User, per-user bukan shared-team), `BionAiMessage` (belongsTo Conversation; kolom `role`/`content`/`tool_calls`/`tool_name`/`tool_call_id`), `BionAiUsageLog` (belongsTo Team, nullable User & Conversation supaya histori cost tetap ada walau user/percakapan dihapus)
- [x] 11.2 `app/Support/AiChat/` — abstraksi chat multi-turn dengan tool-calling + usage capture (`OpenAiChatClient`, `DeepSeekChatClient extends OpenAiChatClient`, `AnthropicChatClient`), **dibangun paralel** dengan `app/Support/Ai/` yang sudah ada (dipakai `ProposalAiDraftController`, single-turn tanpa tools) — tidak disatukan karena beda kontrak (`generate(system,user):string` vs `send(system,messages,tools):AiChatResult`) dan mengubahnya berisiko merusak proposal drafting tanpa manfaat
- [x] 11.3 `ToolRegistry` + 7 tool konkret, semua team-scoped, dipanggil model lewat function-calling: `get_overdue_invoices`, `get_today_schedule`, `get_upcoming_deadlines`, `get_open_tasks`, `get_project_status_summary`, `get_pipeline_summary`, `get_invoice_payment_status`. `ToolRegistry::call()` tidak pernah throw ke luar — tool unknown atau exception internal jadi `{error: ...}` supaya model bisa recover di round berikutnya, bukan job crash
- [x] 11.4 `config/ai_pricing.php` + `AiCostEstimator` — estimasi cost per round-trip berdasar token usage nyata dari response provider
- [x] 11.5 `RunBionAiChatTurnJob` (queued) — loop tool-calling sampai 4 round, log satu `BionAiUsageLog` per round-trip, fallback message kalau round habis tanpa jawaban final, idempotent (no-op kalau pesan terakhir sudah assistant reply tanpa tool_calls)
- [x] 11.6 Controller + route single-action (index/show gabung satu controller, store/rename/destroy conversation, store message + status polling) — pola manual team-scoping yang sama seperti controller lain, ditambah `where('user_id', ...)` karena percakapan per-user
- [x] 11.7 Frontend: sidebar multi-percakapan (`bion-ai/index.tsx`), `use-bion-ai-chat.ts` (queued + polling, mirip `use-document-pdf-download.ts`), rename inline + delete di sidebar, nav item + contoh prompt di empty state
- [x] 11.8 Pest test: `BionAiToolTest`, `BionAiConversationTest`, `BionAiMessageTest`, `RunBionAiChatTurnJobTest` (23 test, termasuk satu smoke test khusus Anthropic untuk batching `tool_result` multi-tool-call dalam satu giliran)
- [x] 11.9 Verifikasi browser end-to-end dengan live API key OpenAI: pertanyaan umum di luar data (tanpa tool call), pertanyaan workspace ("tugas apa yang overdue?") yang benar memanggil tool dan menjawab dari data asli, switch antar percakapan, rename, delete, serta cek `bion_ai_usage_logs` — dua bug ditemukan dan diperbaiki saat verifikasi ini (lihat di bawah)

**Fase 11 selesai — dua bug ditemukan lewat verifikasi manual, bukan lewat test otomatis (test yang ada tidak mengeset ulang state antar navigasi halaman)**: (1) `useBionAiChat` menyimpan pesan awal lewat `useState(initialMessages)` yang cuma dibaca sekali saat mount — karena halaman `bion-ai/index.tsx` tidak di-remount saat Inertia pindah dari satu percakapan ke percakapan lain (route pattern sama), state pesan lama nyangkut dan menampilkan thread percakapan sebelumnya. Diperbaiki dengan `useEffect` yang me-reset `messages`/`sending`/`error` setiap kali `urls.send` berubah (unik per conversation id). (2) Rename conversation punya `FormRequest` + controller + route lengkap sejak awal tapi **tidak ada UI sama sekali** di sidebar — gap ketahuan pas verifikasi manual mengikuti checklist plan ("confirm rename/delete"). Ditambahkan tombol edit (ikon `i-edit`, muncul on-hover di sebelah tombol delete) yang mengubah baris jadi input inline, commit lewat Enter/blur, cancel lewat Escape.

**Keputusan desain teknis**: `estimated_cost_cents` (integer) yang direncanakan di awal ternyata **selalu membulat ke 0** untuk trafik nyata — satu giliran chat gpt-4o-mini dengan ~500 token cuma senilai ~$0.00008, jauh di bawah 1 sen. Kolom diganti jadi `estimated_cost_micros` (1 USD = 1.000.000 micro, pola yang sama dipakai Google Ads API untuk masalah presisi serupa) sebelum fitur ini dianggap selesai — kalau dibiarkan integer cents, halaman AI usage Super Admin yang direncanakan nanti akan menampilkan $0.00 untuk semua user, gagal total di tujuan intinya. Karena migration ini masih dalam batch yang sama dan belum pernah di-commit, kolom diedit langsung di migration aslinya (rollback + re-migrate), bukan migration baru di atasnya. Tools sengaja tidak mengklaim "task overdue" — `Task` tidak punya kolom due date sendiri di data model (lihat CLAUDE.md), jadi `get_open_tasks` cuma melampirkan `due_date` milik project induk dan membiarkan model menyimpulkan urgensi dari situ, bukan memalsukan field yang tidak ada. Percakapan bersifat **per-user, bukan shared-team** — beda dari kebanyakan entity lain di app ini yang team-scoped tapi bisa diakses semua member tim, karena chat history bersifat personal.

## Fase 12 — Ops Portal

Portal admin platform-wide, diminta langsung oleh user untuk melihat daftar user, AI usage log, dan activity log lintas tim — sesuatu yang tidak bisa ditampilkan zona `/app/{team}` manapun karena semuanya team-scoped by design. Sempat dibahas apakah perlu mengaktifkan `spatie/laravel-permission` (sudah jadi dependency composer tapi belum pernah dipakai) untuk ini; user setuju dengan rekomendasi flag boolean sederhana karena kebutuhannya cuma "apakah user ini staf Biondesk", bukan matriks role bertingkat. Fase ini juga akhirnya mengonsumsi `BionAiUsageLog` — tabel yang sengaja dibangun di Fase 11 sebagai persiapan untuk halaman ini.

- [x] 12.1 Migration `is_super_admin` boolean (default false) di tabel `users`, sengaja **tidak** dimasukkan ke `#[Fillable]` (tidak boleh pernah bisa di-mass-assign dari request, cuma lewat `tinker`)
- [x] 12.2 `EnsureSuperAdmin` middleware — pola `abort_if` sederhana meniru persis `EnsureTeamMembership`, bukan `Gate::define()` baru (tidak ada satupun Gate dipakai di codebase ini sebelumnya, jadi middleware biasa lebih konsisten daripada memperkenalkan pola otorisasi baru untuk satu boolean check)
- [x] 12.3 `RedirectsToCurrentTeam` (trait yang sama dipakai `LoginResponse`/`TwoFactorLoginResponse`/`PasskeyLoginResponse`) — ditambah short-circuit di awal: user `is_super_admin` selalu diarahkan ke `/ops/dashboard`, tidak pernah masuk logika pencarian current-team. Satu edit ini otomatis meng-cover ketiga jalur login sekaligus
- [x] 12.4 Route `/ops/*` (file terpisah `routes/ops.php`, mengikuti pola split `routes/settings.php`) — zona ke-5 di monolith ini (setelah `/`, `/p/`, `/d/`, `/app/*`), auth+verified+`EnsureSuperAdmin`, **tidak** team-scoped
- [x] 12.5 4 controller single-action (`OpsDashboardController`, `OpsUserIndexController`, `OpsAiUsageLogIndexController`, `OpsActivityLogIndexController`) + `OpsDashboardSummary` support class meniru pola `DashboardSummary`
- [x] 12.6 Frontend: `ops-shell.tsx` (layout baru, bukan reuse `BiondeskAppShell` karena itu terikat erat ke `currentTeam` — `navSections`-nya balik `[]` tanpa team), sprite ikon + `IconUse` diekstrak ke `icon-sprite.tsx` supaya kedua shell pakai sumber yang sama, `pagination.tsx` (paginasi pertama di seluruh app — semua list lain sejauh ini team-scoped dan cukup kecil untuk unpaginated), link "Ops Portal" kondisional di dropdown user `BiondeskAppShell` (`auth.user.is_super_admin`)
- [x] 12.7 4 halaman Inertia (`ops/dashboard`, `ops/users/index`, `ops/ai-usage-logs/index`, `ops/activity-logs/index`) — Users read-only di v1 (tidak ada UI promote/demote admin, tetap lewat `tinker` untuk kasus jarang nambah admin kedua), Activity Logs sengaja tidak menampilkan kolom "team" per baris (butuh cross-reference 6 tipe subject polymorphic berbeda, tidak sepadan untuk v1), dicatat eksplisit di halaman bukan didiamkan
- [x] 12.8 `BionAiUsageLog::formatCost()` — selalu 4 desimal (bukan 2) untuk cost per baris maupun total, konsisten dengan keputusan `estimated_cost_micros` di Fase 11 (kalau 2 desimal, banyak baris akan tetap tampil "$0.00" walau ada biaya riil)
- [x] 12.9 Pest test: `OpsAccessTest` (403 non-admin, redirect guest, 200 admin di keempat route), `OpsDashboardTest`, `OpsUserIndexTest`, `OpsAiUsageLogIndexTest`, `OpsActivityLogIndexTest`, plus satu test baru di `AuthenticationTest.php` untuk redirect login super admin (18 test baru)
- [x] 12.10 Verifikasi browser end-to-end: flag `is_super_admin` di akun test lewat tinker, konfirmasi redirect ke `/ops/dashboard` setelah login, keempat halaman menampilkan data asli (termasuk 70 baris activity log asli dari histori development, paginasi "Page 1 of 3" berfungsi lewat query string `?page=`), link "Ops Portal" cuma muncul di dropdown user untuk akun admin, non-admin dapat 403 — flag dikembalikan ke `false` setelah verifikasi selesai

**Fase 12 selesai**: karena ini paginated list pertama di seluruh aplikasi, tidak ada konvensi lama untuk ditiru — `Pagination` component baru dibuat sesederhana mungkin (Prev/Next + indikator halaman, bukan picker nomor halaman penuh) karena ini tool admin internal, bukan UX publik. Tidak ada rate limiting atau audit trail tambahan untuk siapa yang mengakses ops portal di v1 — ini portal read-only untuk satu orang (founder), risiko rendah untuk skala saat ini, bisa direvisit kalau jumlah admin bertambah.

## Fase 13 — Fitur Tambahan (Post-Launch)

Pembaruan yang dilakukan setelah seluruh Fase 1-12 selesai (merupakan item P1 di PRD yang sebelumnya sempat ditunda).

- [x] 13.1 **Pipeline Forecasting**: Menambahkan kolom `win_probability` (0-100) di database untuk entitas `Opportunity`, beserta validasi backend dan field input di frontend (`create.tsx` dan `edit.tsx`).
- [x] 13.2 Memperbarui kalkulasi `DashboardSummary` untuk menampilkan *Weighted Pipeline Value* pada stat *Pipeline Value* (menghitung jumlah (amount_value * win_probability) dari setiap opportunity yang masih open).

## Fase 14 — Insights / Blog & Content Engine

Modul marketing publik untuk akuisisi organik, dikerjakan setelah Ops Portal tersedia supaya manajemen konten tetap berada di zona staf Biondesk, bukan workspace team user. Scope ini mencakup CRUD blog/kategori, halaman publik dinamis, generator konten terjadwal, dan sitemap realtime untuk Search Console.

- [x] 14.1 Migration + model `BlogCategory` dan `Blog` (author `User`, kategori nullable, slug unik, metadata SEO, `is_published`, thumbnail lewat Spatie Media Library collection `thumbnail`)
- [x] 14.2 Seeder kategori blog awal (`BlogCategorySeeder`) dan registrasi ke `DatabaseSeeder`
- [x] 14.3 Ops Portal: `BlogCategoryController` + halaman `ops/blog-categories` untuk CRUD kategori, termasuk validasi slug unik dan UI create/edit
- [x] 14.4 Ops Portal: `BlogController` + halaman `ops/blogs` untuk CRUD artikel, publish/unpublish, kategori, meta title/description, content HTML, dan thumbnail upload
- [x] 14.5 Komponen editor konten (`rich-text-editor.tsx`) dan komponen UI pendukung (`textarea`, `table`, `alert-dialog`) untuk kebutuhan halaman ops blog
- [x] 14.6 Halaman publik `/blog` (`BlogIndexController` + `resources/js/pages/blog/index.tsx`) menampilkan data dinamis dari artikel published, featured article, filter kategori, author, tanggal, excerpt, dan thumbnail
- [x] 14.7 Halaman publik `/blog/{slug}` (`BlogShowController` + `resources/js/pages/blog/show.tsx`) menampilkan artikel published saja, metadata SEO, thumbnail, author, related articles, table of contents, reading progress, dan share actions
- [x] 14.8 Navbar marketing diekstrak ke `frontend-navbar.tsx` dan dipakai konsisten di landing page, blog index, dan blog detail; menu `Insights` mengarah ke `/blog`
- [x] 14.9 `OpenAIService` untuk generator artikel + thumbnail: `generateArticle()` memakai Chat Completions JSON output untuk artikel SEO/GEO/AEO, `generateImage()` memakai `gpt-image-1`, dan menyimpan usage response terakhir
- [x] 14.10 Command `blog:generate`: pilih kategori acak, generate artikel, generate thumbnail, buat slug unik, publish blog, simpan thumbnail via media library, hapus file temp, dan catat dua `BionAiUsageLog` (artikel + thumbnail) dengan estimasi cost micros
- [x] 14.11 Scheduler `blog:generate` dijalankan Senin dan Kamis pukul 08:00 lewat `routes/console.php`
- [x] 14.12 Sitemap realtime: `SitemapController` + route `/sitemap.xml` dan `/sitemap`, berisi home, blog index, dan semua blog published dengan `lastmod` dari `updated_at`
- [x] 14.13 Pest test: `BlogTest` mencakup halaman blog dan usage log generator; `SitemapTest` mencakup XML sitemap, route shortcut, artikel published masuk, draft tidak masuk

**Fase 14 selesai**: Blog sengaja diperlakukan sebagai kanal konten Biondesk sendiri ("Insights"), bukan CMS multi-tenant untuk user. Admin berada di `/ops/*` dan protected oleh `EnsureSuperAdmin`. Generator konten memakai OpenAI langsung karena use case-nya spesifik OpenAI (`gpt-image-1` untuk thumbnail), sementara BionAI dan proposal generation tetap memakai abstraksi masing-masing yang sudah ada. Semua pemakaian AI dari generator blog dicatat ke `bion_ai_usage_logs`, sehingga Ops AI Usage Logs tetap menjadi satu tempat untuk melihat biaya AI lintas fitur. Sitemap tidak disimpan ke file statis; response XML dibuat realtime dari database supaya Search Console selalu melihat artikel published terbaru tanpa job tambahan.

## Fase 15 — Client Portal & AI Request Collaboration

Modul kolaborasi klien, dikerjakan di atas Project/Request Log yang sudah ada. Tujuannya memberi client satu link rahasia per Contact untuk melihat project/dokumen/request yang aman dibagikan, sekaligus menaikkan Request Log dari catatan internal menjadi collaboration thread dan sumber task breakdown berbantuan AI.

- [x] 15.1 `contacts.portal_token` — token stabil seperti `Document.public_token`, dibuat otomatis untuk Contact existing dan baru, dipakai untuk URL Client Portal
- [x] 15.2 Public routes token-only: `GET /c/{contact:portal_token}`, `POST /c/{contact:portal_token}/projects/{project}/requests`, `POST /c/{contact:portal_token}/projects/{project}/requests/{requestLog}/messages`, dan dedicated detail `GET /c/{contact:portal_token}/projects/{project}/requests/{requestLog:uuid}`
- [x] 15.3 Client-safe request visibility: `request_logs.visible_to_client`, `RequestLogSource::ClientPortal`, `RequestLogStatus` (`submitted`, `reviewing`, `in_progress`, `resolved`, `declined`), dan default internal request tetap hidden dari portal
- [x] 15.4 `request_log_messages` + model `RequestLogMessage` dengan author `client`/`team`, nullable `user_id`/`contact_id`, body, timestamps, dan media library collection `attachments`
- [x] 15.5 Portal UI: `client/portal` dan `client/request-log-show`, layout publik app-style tanpa authenticated app shell, project list, documents, request cards short preview, request detail, reply form, upload progress, dan attachment list
- [x] 15.6 Internal Request Log upgrade: status selector/filter, source `Client portal`, thread reply composer di modal/detail page, dedicated internal request log detail by UUID, sticky request metadata card, dan link "View full page" dari modal
- [x] 15.7 AI task breakdown V1.3: endpoint `projects.request-logs.ai-breakdown` memakai OpenAI structured output strict JSON schema, menghasilkan classification/confidence/summary/related IDs/duplicate IDs/proposed tasks/warnings; task dibuat lewat endpoint kedua `projects.request-logs.ai-tasks.store` hanya setelah user memilih task yang mau dibuat
- [x] 15.8 Idempotent AI task creation: tombol Create selected tasks dikunci instan di frontend dengan ref lock, backend memakai `firstOrCreate` berdasarkan project/request/title agar repeated click/retry tidak membuat task duplikat, dan toast success/duplicate state dikirim lewat Inertia flash
- [x] 15.9 Embedding index V1.4: `embedding_index_entries` dengan pgvector `vector(1536)` di Postgres dan JSON fallback untuk SQLite test, `OpenAIEmbeddingService`, `EmbeddingTextBuilder`, `EmbeddingIndexService`, `RequestLogSemanticMatcher`, job `RefreshEmbeddingIndexEntry`, dan command `embedding-index:backfill`
- [x] 15.10 AI breakdown sekarang memakai semantic top matches dari task existing sebelum memanggil LLM, menampilkan `Semantic matches` di panel internal, tetap fallback ke all project tasks kalau embedding gagal, dan seluruh usage embedding/chat dicatat ke `BionAiUsageLog`
- [x] 15.11 Config khusus embedding: `OPENAI_EMBEDDING_API_KEY` (fallback `OPENAI_API_KEY`), `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`, `OPENAI_EMBEDDING_DIMENSIONS=1536`, plus pricing entry untuk estimasi cost embedding
- [x] 15.12 Pest/verification: `ClientPortalTest`, `RequestLogManagementTest`, `RequestLogAiBreakdownTest`, `EmbeddingIndexTest`; targeted ESLint untuk page/type terkait; `npm run build`; migration pgvector diverifikasi di Postgres lokal

**Fase 15 selesai**: Client Portal sengaja tetap unauthenticated dan token-only di versi ini — tidak ada client account, OTP, session, atau approval workflow penuh. Semua scoping portal divalidasi server-side lewat contact token → opportunity contact → project/request, dan portal hanya mengirim data client-safe (tidak ada notes internal). Request Log kini punya dua lapisan: internal workspace tetap bisa menyimpan notes/source/classification/status, sementara thread message bersifat client-visible by design. AI breakdown tidak pernah auto-create task; model hanya memberi preview terstruktur, user memilih task, dan endpoint task creation dibuat idempotent untuk menghindari double input. Embedding dipakai sebagai retrieval/candidate layer, bukan sebagai keputusan final — LLM structured output tetap menentukan classification dan proposed task setelah melihat kandidat teratas.

## Fase 16 — Workflow Automation V1

Rules engine kecil untuk mengurangi pekerjaan follow-up internal berulang, dikerjakan setelah Client Portal dan request workflow stabil. Scope V1 sengaja dibatasi ke template rules + internal actions only; tidak ada email automation, webhook, external integration, visual builder penuh, atau AI natural-language builder.

- [x] 16.1 Migration + model `WorkflowAutomation` dan `WorkflowAutomationRun`, scoped ke `Team`, dengan `trigger`, `conditions`, `actions`, `is_active`, `last_run_at`, status run, context, subject, dan `idempotency_key`
- [x] 16.2 Enum `WorkflowAutomationTrigger`, `WorkflowAutomationAction`, dan `WorkflowAutomationRunStatus` untuk menjaga trigger/action/status tetap type-safe tanpa native database enum
- [x] 16.3 Template V1: new client request → create triage task, client replied → create follow-up task, request submitted → set status Reviewing, project waiting on client → create calendar event, invoice overdue → create follow-up task, quote unresponded → create follow-up task, project completed → add activity log note
- [x] 16.4 `WorkflowAutomationRunner` menjalankan automation aktif per team/trigger/subject, memvalidasi subject ownership, mengecek condition sederhana, menjalankan action internal, dan mencatat success/skipped/failed run
- [x] 16.5 Idempotency: automation yang sama tidak membuat task/event duplikat untuk subject yang sama; `create_task` juga memakai `firstOrCreate` berdasarkan project/request/title
- [x] 16.6 `RunWorkflowAutomation` queued job untuk trigger event-driven dengan `WithoutOverlapping`, dipanggil dari client request submitted, client request replied, request status changed, dan project status changed
- [x] 16.7 Command scheduled `workflow-automations:run-due` untuk trigger dokumen berbasis waktu (`invoice_due_soon`, `invoice_overdue`, `quote_unresponded`), dijalankan daily lewat scheduler dengan `withoutOverlapping()`
- [x] 16.8 UI `/app/{team}/automations`: menu Automations di sidebar Workspace, metrics active/inactive/recent runs, active rules, template cards, enable/pause, edit/delete, dan recent run history
- [x] 16.9 Halaman create/edit template-based: pilih template, preview "When X, do Y", active toggle, validasi trigger/action/status, lalu simpan rule ke team aktif
- [x] 16.10 Sidebar counter `automations` ditambahkan agar menu Workspace tetap menampilkan jumlah automation aktif
- [x] 16.11 Pest test: `WorkflowAutomationTest` mencakup scoped index/CRUD/toggle/delete, invalid trigger/action/status, inactive automation, idempotent request/reply task creation, status update action, calendar event action, scheduled invoice/quote trigger, run logs success/skipped/failed, dan foreign team subject rejection
- [x] 16.12 Verification: Pint dirty PHP files, targeted Pest untuk WorkflowAutomation + ClientPortal/RequestLog/Project/Document/SidebarCounter, targeted ESLint automation pages/types/sidebar, `npm run build`, dan `git diff --check`

**Fase 16 selesai**: Workflow Automation V1 adalah productivity layer internal, bukan platform automation eksternal. Semua trigger/action tetap team-scoped dan subject-scoped; inactive rule tidak menghasilkan run; failed/skipped/success dicatat di `workflow_automation_runs` untuk audit ringan. Action yang tersedia sengaja terbatas ke operasi internal yang sudah ada di Biondesk: create task, create calendar event, update request status, update project status, dan add activity log. Scheduler dokumen memakai query status/date yang sama semangatnya dengan Reminder, tetapi tidak menggantikan Reminder email yang sudah ada.

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
