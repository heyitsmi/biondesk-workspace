# Konsep produk: Biondesk

## Ringkasan satu kalimat

Satu workspace untuk freelancer dan agency kecil mengelola seluruh siklus kerja mereka, dari lead, project, dan task, sampai proposal, invoice, dan pembayaran, dipakai lintas platform dan lintas negara.

## Masalah yang diselesaikan

Freelancer dan agency kecil yang bekerja lintas platform (marketplace seperti Upwork/Fiverr/Toptal, referral, LinkedIn, direct outreach) biasanya mengelola lead, proposal, project, dan invoice secara terpisah-pisah: spreadsheet buat tracking lead, Notion atau tool lain buat project, WhatsApp buat komunikasi, template Canva atau Google Docs buat invoice. Tidak ada satu tool yang benar-benar menyatukan seluruh alur ini dengan baik.

Tool sejenis yang sudah ada secara global (Bonsai, HoneyBook, Indy, Plutio, Dubsado, Bloom) sudah menggabungkan CRM, proposal, dan invoicing, tapi project dan task management di tool-tool ini seringnya jadi fitur tempelan, tidak sekomprehensif fitur sales dan billing-nya. Ini celah yang bisa diisi Biondesk.

## Target user

Freelancer solo atau agency kecil (1-5 orang) yang:

- Dapat klien dari berbagai sumber: marketplace (Upwork, Fiverr, Toptal), referral, LinkedIn, direct outreach, klien lama yang balik lagi
- Butuh kelola lead sampai jadi deal, lalu eksekusi project-nya, lalu ditagih dan dibayar, semua dalam satu tempat
- Kliennya bisa lintas negara dengan mata uang berbeda-beda
- Sudah pernah coba tools sejenis (Bonsai, HoneyBook, dsb) tapi merasa bagian project/task management-nya kurang lengkap

## Positioning

"Satu workspace untuk freelancer dan agency kecil, dari lead sampai cash, tidak terkunci ke satu platform atau satu negara manapun."

## Diferensiasi

- **Dirancang dari pengalaman langsung menjalankan bisnis freelance**, bukan cuma asumsi dari riset pasar
- **Project dan task management yang setara dengan sales dan billing**, bukan fitur tempelan, ini yang sering jadi kelemahan kompetitor sejenis
- **AI proposal generation yang terhubung ke Profile Library**, bukan generic AI writer, hasilnya disesuaikan dengan skill, portfolio, dan testimonial milik user sendiri
- **Fleksibel soal sumber lead dan metode pembayaran**, tidak diasumsikan selalu dari satu marketplace tertentu

## Pilar fitur utama

1. **Contact management** — lead dan client dalam satu tempat, bisa dikonversi dari lead ke client
2. **Opportunity (lead pipeline)** — Kanban board dengan stage inbox, drafting, sent, negotiation, won, lost. Sumber lead bebas diisi (tidak dikunci ke daftar platform tertentu). Setiap user punya public lead form sendiri (`biondesk.com/link/nama-team`) yang bisa disematkan di bio media sosial, submission masuk otomatis sebagai Opportunity baru. Halaman lead form ini bisa dikustomisasi (banner, judul, deskripsi) lewat Settings, dengan live preview, dan fallback ke nama team kalau belum di-custom
3. **Project dan Task management** — fitur inti, bukan tambahan. Project punya pipeline sendiri (not started, in progress, waiting on client, in review, completed, cancelled), tampilan table dan Kanban board, dengan Task di dalamnya. Setiap project juga punya Request Log, tempat mencatat permintaan atau revisi ad-hoc dari klien selama pengerjaan berlangsung
4. **Proposal** — dibuat manual atau di-generate AI dari brief (bisa job post dari marketplace, atau ringkasan hasil discovery call), disesuaikan konteksnya dengan Profile Library
5. **Quote** — dokumen harga formal, bisa dikonversi dari proposal yang di-accept
6. **Invoice** — dibuat manual atau dari quote yang di-accept, dengan opsi otomatis ditawarkan begitu proposal accepted (user tetap yang memilih setiap saat, bukan otomatis penuh)
7. **Payment tracking** — manual, freeform, mendukung banyak payment record per invoice (jadi kasus DP dan pelunasan bisa dicatat dalam satu invoice yang sama)
8. **Reminders** — aturan otomatis (mendekati jatuh tempo, sudah lewat jatuh tempo, follow-up quote yang belum direspon)
9. **Profile Library** — portfolio, testimonial, dan snippet teks yang jadi bahan AI generation
10. **PDF export** — proposal, quote, dan invoice bisa dibagikan lewat webview (interaktif, tempat klien accept dan lihat status) sekaligus lampiran PDF (buat diarsipkan, dilampirkan ke email)

## Yang bukan tujuan Biondesk

- Bukan payment processor. Biondesk tidak pernah memegang dana klien, murni pencatatan manual
- Bukan accounting software lengkap, tidak menggantikan software pembukuan resmi
- Bukan marketplace pencari klien baru
- Bukan tool yang terkunci ke satu platform freelance tertentu

## Monetisasi

Biondesk monetisasinya lewat dua tier: Free dan Pro (Rp79rb-an atau $5/bulan), dengan Midtrans sebagai payment gateway untuk billing subscription tersebut. Ini terpisah total dari payment tracking invoice klien pengguna Biondesk, yang tetap manual dan tidak melibatkan uang lewat Biondesk sama sekali.

## Risiko utama yang perlu divalidasi

Risiko terbesar kemungkinan ada di **distribusi**: apakah orang lain di luar founder mau pakai dan bayar. Freelancer dan agency tool itu kategori yang kompetitif dan penggunanya price-sensitive. Setelah versi awal siap pakai, prioritas berikutnya adalah mendapat 5-10 user eksternal untuk validasi nyata, bukan menambah fitur lebih jauh.

## Nama

**biondesk.com**. Nama ini coined (bukan kata dari bahasa tertentu), jadi netral secara geografis dan cocok untuk positioning global, tidak menyiratkan produk ini spesifik untuk satu negara atau kelompok pengguna tertentu.
