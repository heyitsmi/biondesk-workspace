# Biondesk domain

Workspace untuk freelancer dan agency kecil: lead, project, task, proposal, quote, invoice, pembayaran, dalam satu tempat. Detail produk lengkap ada di `docs/concept.md` dan `docs/PRD.md`, token desain di `docs/design-system.md`. Baca itu sebelum mengerjakan task yang menyentuh area terkait.

## Struktur route (monolith, satu domain)

- `/` — landing page marketing, tanpa auth
- `/p/{team:slug}` — public lead form per team, tanpa auth
- `/d/{document:public_token}` — proposal/quote/invoice yang dibagikan ke klien, tanpa auth
- `/app/*` — seluruh halaman Inertia, wajib auth

Halaman di `/p/` dan `/d/` pakai Blade polos, bukan Inertia, karena pengunjung tanpa login tidak perlu React hydration.

## Data model

```
Team (slug untuk routing dan public lead form)
  └── Contact (lead / client)
        └── Opportunity   (stage: inbox, drafting, sent, negotiation, won, lost)
              └── Project      (status: not_started, in_progress, waiting_on_client, in_review, completed, cancelled)
                    ├── Task        (status: todo, in_progress, done)
                    └── RequestLog  (permintaan/revisi ad-hoc dari klien)
              └── Document     (type: proposal, quote, invoice)
                    ├── DocumentItem
                    ├── Payment      (manual, banyak record per document)
                    └── ReminderJob
```

Document boleh punya `opportunity_id` dan/atau `project_id`, keduanya nullable, minimal salah satu terisi.

## Konvensi non-obvious

- Kolom status selalu `string`, bukan native Postgres enum. Dipasangkan PHP native enum via Eloquent cast untuk type safety. Jangan pakai `Schema::enum()`.
- Kolom urutan Kanban namanya `sort_order`, bertipe `double`, pakai fractional indexing (posisi baru = rata-rata dua tetangga), jangan reindex semua row saat reorder.
- Payment tracking untuk invoice klien selalu manual, tidak ada integrasi gateway otomatis. Midtrans di project ini HANYA untuk subscription billing Biondesk sendiri (Free/Pro $5/bulan), jangan pernah dipakai untuk payment invoice klien.
- PDF generation (Browsershot) wajib lewat queued job, tidak sinkron di request utama.

## Yang jangan disentuh tanpa persetujuan

- Jangan ubah dependency di composer.json/package.json tanpa approval.
- Jangan bikin folder base baru di luar struktur yang sudah ada.
