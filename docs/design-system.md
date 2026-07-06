# Design system: Biondesk

## Arah desain

Modern, tenang, dan presisi, ditujukan untuk audiens developer/freelancer yang terbiasa dengan tools kelas atas (Linear, Vercel, Stripe Dashboard). Dark mode jadi default karena cocok dengan kebiasaan kerja audiens, tapi light mode dirancang setara, bukan sekadar fallback terbalik warna.

**Elemen signature**: status pill. Badge kecil berbentuk pill, titik warna plus label teks, dipakai konsisten di semua tempat status muncul (lead di Kanban, project di Kanban maupun tabel, status document). Ini bukan hiasan, ini bahasa visual inti produk, karena value utama Biondesk adalah "tidak pernah kehilangan jejak status apapun".

## Warna

Base gelap bukan hitam pekat polos, tapi slate dengan sedikit sentuhan biru, dipasangkan satu aksen amber hangat, bukan biru-ungu yang jadi default hampir semua SaaS dashboard.

### Dark mode (default)

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg` | `#0B0E14` | Background halaman |
| `--surface` | `#12161F` | Card, sidebar, modal |
| `--surface-raised` | `#1A1F2B` | Dropdown, popover, elemen di atas surface |
| `--border` | `#232838` | Border, divider |
| `--text` | `#EDEFF3` | Teks utama |
| `--text-muted` | `#8B93A6` | Teks sekunder, label, placeholder |
| `--accent` | `#E8A33D` | Primary action, link, focus ring, elemen aktif |
| `--accent-text` | `#12161F` | Teks di atas elemen ber-background accent (bukan putih, biar kontras cukup) |
| `--success` | `#34A87C` | Status positif (won, paid, completed) |
| `--danger` | `#E5484D` | Status negatif (lost, overdue, rejected) |

### Light mode

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg` | `#F6F7F9` | Background halaman |
| `--surface` | `#FFFFFF` | Card, sidebar, modal |
| `--surface-raised` | `#FFFFFF` (dengan shadow lebih kuat) | Dropdown, popover |
| `--border` | `#E4E6EB` | Border, divider |
| `--text` | `#12161F` | Teks utama |
| `--text-muted` | `#6B7280` | Teks sekunder |
| `--accent` | `#C77F1F` | Primary action (di-gelapkan dari versi dark supaya tetap kontras di atas putih) |
| `--accent-text` | `#FFFFFF` | Teks di atas elemen ber-background accent |
| `--success` | `#1F8A5F` | Status positif |
| `--danger` | `#D6383D` | Status negatif |

Catatan penting soal kontras: di dark mode, tombol ber-background `--accent` pakai teks warna `--accent-text` gelap (`#12161F`), bukan putih, karena amber itu warna terang, teks putih di atasnya kontrasnya jelek. Di light mode kebalikannya, accent sudah digelapkan jadi teks putih di atasnya aman.

Jangan tambah warna semantic baru di luar `accent`, `success`, `danger`. Status yang netral (draft, todo, backlog) pakai `--text-muted` dan `--border`, bukan warna baru, biar tidak terlalu ramai.

## Tipografi

| Role | Font | Pemakaian |
|---|---|---|
| Display & UI | Instrument Sans | Heading, label, button, nav, body text |
| Data & mono | JetBrains Mono | Nominal invoice, tanggal, nomor dokumen, kode status |

Satu keluarga font (Instrument Sans) dipakai untuk display maupun body lewat variasi weight, bukan dua typeface berbeda, biar konsisten dan tidak berat. Font mono khusus dipakai untuk angka dan data presisi (nominal, ID, tanggal), memberi kesan "ledger" yang pas buat tool yang berurusan dengan invoice dan tracking, dan membedakan data dari teks naratif secara visual.

| Skala | Ukuran | Weight | Pemakaian |
|---|---|---|---|
| Display | 32px | 600 | Judul halaman utama |
| H1 | 24px | 600 | Judul section |
| H2 | 18px | 600 | Judul card, subsection |
| Body | 14px | 400 | Teks utama |
| Small | 13px | 400 | Label, caption, metadata |
| Mono data | 13px | 500 | Nominal, tanggal, ID (JetBrains Mono) |

## Spacing, radius, shadow

- Unit dasar 4px, skala: 4, 8, 12, 16, 24, 32, 48, 64
- Radius: `sm` 6px (input, button kecil), `md` 10px (card, button), `lg` 16px (modal, panel besar), `full` (pill, avatar)
- Shadow dipakai fungsional buat elevasi (dropdown, modal, popover), bukan dekorasi. Satu level shadow saja per konteks: `0 4px 16px rgba(0,0,0,0.24)` di dark mode, `0 4px 16px rgba(0,0,0,0.08)` di light mode

## Layout inti

### Sidebar (wajib collapse/expand)

- Lebar expanded: 240px, isi icon + label
- Lebar collapsed: 64px, isi icon saja, label muncul sebagai tooltip saat hover
- Toggle collapse ada di bagian bawah sidebar, ikon panah
- State collapse disimpan sebagai preferensi user di database (bukan cuma localStorage), supaya konsisten lintas device, bukan cuma di satu browser
- Transisi collapse/expand 200ms ease, dinonaktifkan kalau `prefers-reduced-motion` aktif

### Topbar

- Minimal: breadcrumb/judul halaman di kiri, search (shortcut `Cmd+K` / `Ctrl+K`) di tengah atau kanan, theme switcher dan avatar user di kanan
- Tidak ada tab atau nav sekunder di topbar, itu tugas sidebar

### Theme switcher

- Toggle tiga posisi: Light, Dark, System, bukan cuma on/off
- Default ikut preferensi OS di kunjungan pertama
- Setelah user pilih eksplisit, preferensi disimpan ke akun (database), bukan cuma browser, biar konsisten kalau login dari device lain
- Transisi ganti tema pakai fade halus (150ms), dinonaktifkan kalau `prefers-reduced-motion` aktif

### Board / List toggle

Berlaku untuk semua halaman yang datanya punya status pipeline (Opportunity, Project):

- Segmented control kecil di kanan atas halaman, dua opsi ikon: Board dan List
- Board: kanban, kolom per status, card bisa di-drag antar kolom
- List: tabel biasa, kolom status ditampilkan sebagai status pill, bisa di-sort dan difilter
- Pilihan tampilan disimpan per halaman per user (misalnya user bisa suka List untuk Opportunity tapi Board untuk Project), bukan satu preferensi global

## Komponen inti

### Status pill

```
[● dot] Label
```

- Dot 6px, warna sesuai kategori status (accent untuk in-progress/active, success untuk won/paid/completed, danger untuk lost/overdue/rejected, text-muted untuk draft/todo/backlog)
- Background pill: warna dot dengan opacity 12%, teks pakai warna dot solid, bukan putih/hitam, biar tetap terbaca dan tetap dalam keluarga warna yang sama
- Radius full, padding horizontal 10px, vertical 4px

### Kanban card

- Card dengan radius `md`, border tipis, padding 12px
- Judul di baris atas (bold, ukuran body), metadata (client, nilai, tanggal) di baris bawah pakai `text-muted` dan font mono untuk nominal/tanggal
- Status pill kalau relevan ditampilkan sebagai badge kecil di pojok, bukan warna background card (background card tetap netral, biar tidak terlalu ramai kalau banyak status berbeda dalam satu kolom)
- Saat di-drag: elevasi naik satu level (shadow lebih kuat), sedikit rotasi 1-2 derajat, dilepas kalau `prefers-reduced-motion` aktif

### Tabel

- Header sticky saat scroll
- Baris punya hover state halus (`--surface-raised`)
- Kolom status pakai status pill, bukan teks polos
- Kolom nominal/tanggal pakai font mono, rata kanan untuk angka

### Button

- Primary: background `--accent`, teks `--accent-text`
- Secondary: background `--surface`, border `--border`, teks `--text`
- Destructive: border `--danger`, teks `--danger`, background transparan sampai hover
- Radius `sm`, padding 8px 14px untuk ukuran default

### Form input

- Border `--border`, radius `sm`, background `--surface`
- Focus state: border berubah jadi `--accent`, ring halus 2px opacity 20% dari accent
- Label di atas input, ukuran `Small`, warna `--text-muted`

### Modal & dropdown

- Modal: radius `lg`, muncul dengan fade + scale halus dari 96% ke 100% (150ms)
- Dropdown/popover: radius `md`, muncul dengan fade + slide kecil 4px dari arah trigger

## Responsive

- Breakpoint: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Sidebar di mobile berubah jadi bottom sheet/drawer yang muncul dari kiri saat tombol menu di topbar ditekan, bukan collapse ke icon rail (icon rail tidak cukup berguna di layar sempit)
- Board view di mobile: kolom Kanban di-scroll horizontal, satu kolom kira-kira selebar layar
- Tabel di mobile: kolom yang tidak esensial disembunyikan lebih dulu (metadata sekunder), kolom judul dan status tetap selalu terlihat
- Topbar search menyusut jadi ikon saja di mobile, buka full-screen search saat ditekan

## Aksesibilitas & motion

- Kontras semua kombinasi teks-di-atas-background di tabel warna ini sudah dicek memenuhi WCAG AA minimal
- Semua elemen interaktif (button, link, card yang bisa diklik) punya focus state yang terlihat jelas (ring 2px warna accent), bukan cuma outline browser default
- Semua transisi dan animasi (drag kanban, collapse sidebar, fade modal, ganti tema) menghormati `prefers-reduced-motion`, langsung tanpa animasi kalau itu aktif
- Drag-and-drop Kanban tetap punya cara alternatif tanpa mouse (misalnya dropdown "Ubah status" di card), tidak boleh drag jadi satu-satunya cara ubah status

## Implementasi teknis

Pakai CSS custom properties per tema (`:root` untuk light, `[data-theme="dark"]` untuk dark), bukan dua set class Tailwind terpisah, supaya switching tema tinggal toggle satu atribut di `<html>`, dan semua komponen React otomatis ikut tanpa perlu logic kondisional di tiap komponen.

```css
:root {
  --bg: #F6F7F9;
  --accent: #C77F1F;
  /* ... */
}
[data-theme="dark"] {
  --bg: #0B0E14;
  --accent: #E8A33D;
  /* ... */
}
```

Tailwind config extend `colors` supaya merujuk ke CSS variable ini (`bg: 'var(--bg)'`, dst), bukan hardcode hex di config, biar satu sumber kebenaran warna cuma di file CSS variable ini.
