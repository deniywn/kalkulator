# Product Requirements Document (PRD)
## Aplikasi Kalkulator Simple — Browser-Based JavaScript

---

| Atribut | Detail |
|---|---|
| Dokumen | Product Requirements Document |
| Versi | 4.0 |
| Tanggal | Maret 2026 |
| Status | Final — Production |
| Deployment Target | Tencent Cloud EdgeOne Pages |
| URL Produksi | https://[project].edgeone.app (atau custom domain) |

### Riwayat Versi

| Versi | Perubahan |
|---|---|
| v1.0 | Dokumen awal — scope dan fitur dasar |
| v2.0 | Ditambah State Management dan Use Cases |
| v3.0 | Ditambah arsitektur OperationRegistry, prinsip OCP |
| v4.0 | Ditambah deployment target: Tencent Cloud EdgeOne Pages |

---

## 1. Ringkasan Produk

Kalkulator berbasis web yang berjalan sepenuhnya di browser, di-deploy ke **Tencent Cloud EdgeOne Pages** sebagai static site. Tersedia secara publik melalui URL global dengan CDN edge delivery, tanpa server, tanpa backend, dan tanpa biaya hosting.

---

## 2. Tujuan Produk

- Menyediakan alat hitung yang ringan, cepat, dan dapat diakses dari mana saja via URL publik
- Mendemonstrasikan arsitektur JavaScript yang skalabel sebagai referensi pembelajaran
- Berjalan offline setelah halaman dimuat — tidak butuh koneksi internet terus-menerus

---

## 3. Target Pengguna

| Segmen | Kebutuhan Utama | Cara Akses |
|---|---|---|
| Pengguna umum | Perhitungan cepat di browser | Buka URL publik EdgeOne |
| Developer pemula | Belajar arsitektur JS | Lihat kode via GitHub / URL |

---

## 4. Ruang Lingkup (Scope)

### In Scope
- Empat operasi aritmatika dasar: `+`, `−`, `×`, `÷`
- Input angka desimal, tombol `C`, `CE`, `=`
- Input via keyboard penuh
- Responsif desktop dan mobile
- Deploy sebagai static file ke EdgeOne Pages

### Out of Scope
- Fungsi saintifik (sin, cos, log, akar) — arsitektur siap, implementasi belum
- Riwayat kalkulasi tersimpan
- Server-side logic, API, database
- Autentikasi / login user

---

## 5. Arsitektur & Struktur File

```
kalkulator/
├── index.html          → Struktur UI
├── style.css           → Layout, warna, responsif
├── script.js           → Logika: Registry, Calculator, Display, EventHandler
└── ops/
    └── basicOps.js     → Fungsi aritmatika dasar
```

Prinsip arsitektur: Open/Closed Principle via `OperationRegistry` — operasi baru cukup didaftarkan tanpa mengubah komponen lain.

---

## 6. Deployment

### 6.1 Platform

| Atribut | Detail |
|---|---|
| Platform | Tencent Cloud EdgeOne Pages |
| Tipe | Static Site Hosting (CDN Edge) |
| URL | https://[project-name].edgeone.app |
| Custom Domain | Didukung (opsional) |
| SSL | Otomatis — HTTPS gratis |
| Plan | Free Plan (permanen) |
| Biaya | $0/bulan untuk skala penggunaan normal |

### 6.2 Cara Deploy

Tiga opsi yang tersedia:

**Opsi A — Pages Drop (paling cepat):**
```
1. Buka pages.edgeone.ai/drop
2. Upload kalkulator.html (17 KB)
3. Klik Deploy → dapat URL langsung
```

**Opsi B — Git Integration:**
```
1. Push kode ke GitHub / GitLab
2. Hubungkan repo di EdgeOne Pages console
3. Auto-deploy setiap push ke branch main
```

**Opsi C — CLI:**
```bash
npm install -g edgeone
edgeone pages deploy ./kalkulator
```

### 6.3 Estimasi Resource

| Metrik | Nilai |
|---|---|
| Ukuran total file | ≈ 20 KB |
| Bandwidth per kunjungan | ≈ 20 KB |
| Server-side compute | 0 (pure static) |
| Edge Function | Tidak diperlukan |
| Biaya untuk 10.000 user/bulan | $0 (masuk Free tier) |

---

## 7. State Management

Lima state yang mengontrol perilaku tombol: `IDLE`, `INPUT_A`, `OPERATOR_SET`, `INPUT_B`, `RESULT`, `ERROR`. Lihat State Diagram untuk detail transisi.

---

## 8. Komponen Kode

`OperationRegistry`, `Calculator`, `Display`, `EventHandler`, `Bootstrap`. Lihat Class Diagram v2 untuk detail.

---

## 9. Use Cases (8 Aksi User)

UC1–UC8 tidak berubah — deployment ke cloud tidak mempengaruhi aksi yang bisa dilakukan user.

---

## 10. Edge Cases & Error Handling

Tidak berubah dari v3.0. Lihat SRS v2.0 untuk spesifikasi lengkap.

---

## 11. Definition of Done

- [ ] Semua operasi aritmatika dasar berjalan lewat `OperationRegistry`
- [ ] Semua 5 state dan 8 use case berfungsi benar
- [ ] Pembagian nol → ERROR state, hanya `C` aktif
- [ ] Input keyboard penuh berfungsi
- [ ] Tidak ada error di browser console
- [ ] Tampilan responsif di Chrome, Firefox, Safari, Edge
- [ ] **Aplikasi berhasil di-deploy ke EdgeOne Pages**
- [ ] **URL publik dapat diakses dari browser mana pun**
- [ ] **HTTPS aktif otomatis (SSL certificate)**
- [ ] **Waktu muat pertama < 2 detik dari jaringan broadband**

---

## 12. Teknologi & Platform

| Layer | Teknologi |
|---|---|
| Struktur | HTML5 |
| Tampilan | CSS3 — Flexbox + Grid |
| Logika | JavaScript ES6+ — Vanilla, tanpa framework |
| Runtime | Browser modern (Chrome, Firefox, Safari, Edge) |
| Hosting | Tencent Cloud EdgeOne Pages |
| CDN | EdgeOne Global Edge Network |
| SSL | EdgeOne Free Certificate (otomatis) |
| Domain | `*.edgeone.app` atau custom domain |
