# Konsep produk: Biondesk

## Ringkasan satu kalimat

Satu workspace untuk freelancer dan agency kecil mengelola workflow client mereka, dari lead, project, dan task, sampai proposal, invoice, reminder, dan payment tracking manual, dipakai lintas platform dan lintas negara.

## Masalah yang diselesaikan

Freelancer dan agency kecil yang bekerja lintas platform (marketplace seperti Upwork/Fiverr/Toptal, referral, LinkedIn, direct outreach) biasanya mengelola lead, proposal, project, dan invoice secara terpisah-pisah: spreadsheet buat tracking lead, Notion atau tool lain buat project, WhatsApp buat komunikasi, template Canva atau Google Docs buat invoice. Tidak ada satu tool yang benar-benar menyatukan seluruh alur ini dengan baik.

Tool sejenis yang sudah ada secara global (Bonsai, HoneyBook, Indy, Plutio, Dubsado, Bloom) sudah menggabungkan CRM, proposal, dan invoicing, tapi project dan task management di tool-tool ini seringnya jadi fitur tempelan, tidak sekomprehensif fitur sales dan billing-nya. Ini celah yang bisa diisi Biondesk.

## Target user

Freelancer solo atau agency kecil (1-5 orang) yang:

- Dapat klien dari berbagai sumber: marketplace (Upwork, Fiverr, Toptal), referral, LinkedIn, direct outreach, klien lama yang balik lagi
- Butuh kelola lead sampai jadi deal, lalu eksekusi project-nya, lalu buat invoice dan follow-up pembayarannya, semua dalam satu tempat
- Kliennya bisa lintas negara dengan mata uang berbeda-beda
- Sudah pernah coba tools sejenis (Bonsai, HoneyBook, dsb) tapi merasa bagian project/task management-nya kurang lengkap
- Sudah punya cara pembayaran sendiri (transfer bank, Stripe/Wise/PayPal link, Midtrans link pribadi, atau instruksi lain) dan butuh tempat untuk mencatat statusnya

## Positioning

"Satu workspace workflow untuk freelancer dan agency kecil, dari lead sampai invoice follow-up, tidak terkunci ke satu platform atau satu negara manapun."

## Diferensiasi

- **Dirancang dari pengalaman langsung menjalankan bisnis freelance**, bukan cuma asumsi dari riset pasar
- **Project dan task management yang setara dengan sales dan billing**, bukan fitur tempelan, ini yang sering jadi kelemahan kompetitor sejenis
- **AI proposal generation yang terhubung ke Profile Library**, bukan generic AI writer, hasilnya disesuaikan dengan skill, portfolio, dan testimonial milik user sendiri
- **Fleksibel soal sumber lead dan metode pembayaran**, tidak diasumsikan selalu dari satu marketplace tertentu, dan tidak memaksa user memakai payment gateway Biondesk

## Pilar fitur utama

1. **Contact management** — lead dan client dalam satu tempat, bisa dikonversi dari lead ke client
2. **Opportunity (lead pipeline)** — Kanban board dengan stage inbox, drafting, sent, negotiation, won, lost. Sumber lead bebas diisi (tidak dikunci ke daftar platform tertentu). Setiap user punya public lead form sendiri (`biondesk.com/p/nama-team`, atau `/p/custom-link` kalau di-custom) yang bisa disematkan di bio media sosial, submission masuk otomatis sebagai Opportunity baru. Halaman lead form ini bisa dikustomisasi lewat Settings — link custom, banner/logo, cover image, warna/gambar latar, judul, pesan sambutan, daftar layanan, toggle upload lampiran, link media sosial (ditampilkan sebagai ikon), dan meta tag SEO (title/description/OG image) — dengan live preview, dan fallback masuk akal (nama team, pesan generic) kalau belum di-custom
3. **Project dan Task management** — fitur inti, bukan tambahan. Project punya pipeline sendiri (not started, in progress, waiting on client, in review, completed, cancelled), tampilan table dan Kanban board, dengan Task di dalamnya. Setiap project juga punya Request Log, tempat mencatat permintaan atau revisi ad-hoc dari klien selama pengerjaan berlangsung
4. **Proposal** — dibuat manual atau di-generate AI dari brief (bisa job post dari marketplace, atau ringkasan hasil discovery call), disesuaikan konteksnya dengan Profile Library
5. **Quote** — dokumen harga formal, bisa dikonversi dari proposal yang di-accept
6. **Invoice** — dibuat manual atau dari quote yang di-accept, dengan opsi otomatis ditawarkan begitu proposal accepted (user tetap yang memilih setiap saat, bukan otomatis penuh)
7. **Payment tracking** — manual, freeform, mendukung banyak payment record per invoice (jadi kasus DP dan pelunasan bisa dicatat dalam satu invoice yang sama). Client membayar langsung ke user lewat payment link atau instruksi pembayaran milik user sendiri
8. **Reminders** — aturan otomatis (mendekati jatuh tempo, sudah lewat jatuh tempo, follow-up quote yang belum direspon)
9. **Profile Library** — portfolio, testimonial, dan snippet teks yang jadi bahan AI generation
10. **PDF export** — proposal, quote, dan invoice bisa dibagikan lewat webview (interaktif, tempat klien accept dan lihat status) sekaligus lampiran PDF (buat diarsipkan, dilampirkan ke email)
11. **BionAI** — asisten chat AI general-purpose terintegrasi ke workspace. Bisa jawab pertanyaan apa saja seperti chatbot pada umumnya, tapi kalau ditanya soal kondisi kerja user sendiri (task yang overdue, jadwal hari ini, invoice belum dibayar, dst), jawabannya diambil dari data workspace asli lewat tool-calling, bukan menebak atau mengarang

## Yang bukan tujuan Biondesk

- Bukan payment processor. Biondesk tidak pernah memegang dana klien, murni pencatatan manual
- Bukan escrow, payment router, atau auto-reconciliation tool untuk pembayaran invoice klien
- Bukan accounting software lengkap, tidak menggantikan software pembukuan resmi
- Bukan marketplace pencari klien baru
- Bukan tool yang terkunci ke satu platform freelance tertentu

## Monetisasi

Untuk fase publik saat ini, Biondesk diposisikan sebagai **early access**, bukan produk dengan paid plan self-serve yang sudah aktif. User yang tertarik boleh mulai menggunakan produk untuk validasi workflow dan feedback nyata.

Monetisasi Free/Pro tetap opsi masa depan, tetapi ditunda sampai ada sinyal willingness-to-pay yang jelas dari user eksternal. Jika subscription billing Biondesk nanti diaktifkan, payment gateway seperti Midtrans hanya dipakai untuk pembayaran subscription Biondesk sendiri. Ini tetap terpisah total dari payment tracking invoice klien pengguna Biondesk, yang manual dan tidak melibatkan uang lewat Biondesk sama sekali.

## Siapa yang cocok / tidak cocok

**Cocok untuk:**
- Freelancer dan agency kecil yang menjalankan client work dari inquiry sampai delivery dan invoice follow-up
- Service business yang butuh satu operating workspace untuk lead, proposal, project, task, document, reminder, dan invoice tracking
- User yang ingin membawa payment link atau instruksi bank sendiri, lalu mencatat status payment secara manual

**Tidak cocok untuk:**
- Tim yang butuh Biondesk memproses, menahan, escrow, atau merekonsiliasi pembayaran klien otomatis
- Enterprise sales team yang butuh CRM berat dengan operasi sales kompleks
- Bisnis yang hanya butuh accounting software, tanpa kebutuhan pipeline lead/project/client workflow
- Marketplace yang berharap Biondesk mencarikan klien atau menjadi perantara antara user dan klien

## Risiko utama yang perlu divalidasi

Risiko terbesar kemungkinan ada di **distribusi**: apakah orang lain di luar founder mau memakai Biondesk untuk workflow client mereka secara rutin. Freelancer dan agency tool itu kategori yang kompetitif dan penggunanya price-sensitive. Prioritas berikutnya adalah mendapat 5-10 user eksternal early access untuk validasi nyata, sebelum mendorong paid plan atau menambah fitur lebih jauh.

## Catatan founder

Biondesk dibangun oleh Hilmi Hidayat dari kebutuhan menjalankan client work yang sering pecah di banyak tempat: lead di spreadsheet atau chat, proposal di dokumen terpisah, project task di tool lain, request klien di WhatsApp, dan invoice follow-up mengandalkan ingatan. Arah produknya adalah membuat workflow itu lebih tenang, jelas, dan mudah dijalankan dari satu workspace.

## Nama

**biondesk.com**. Nama ini coined (bukan kata dari bahasa tertentu), jadi netral secara geografis dan cocok untuk positioning global, tidak menyiratkan produk ini spesifik untuk satu negara atau kelompok pengguna tertentu.
