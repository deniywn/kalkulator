# C4 Model v2.0 — Dokumentasi Arsitektur Visual
## Aplikasi Kalkulator Simple

---

| Atribut | Detail |
|---|---|
| Dokumen | C4 Model Architecture Documentation |
| Versi | 2.0 |
| Tanggal | Maret 2026 |
| Status | Final — Production |
| Deployment Target | Tencent Cloud EdgeOne Pages |
| URL Produksi | https://[project].edgeone.app |
| Dokumen terkait | PRD v4.0, SRS v2.0, arc42 v2.0 |

### Riwayat Versi

| Versi | Perubahan |
|---|---|
| v1.0 | Empat level diagram + Dynamic Diagram — aplikasi berjalan lokal |
| v2.0 | Level 1 dan Level 2 diupdate mencerminkan deployment ke EdgeOne Pages |

---

## Ringkasan Perubahan v1.0 → v2.0

Deployment ke EdgeOne Pages mengubah **infrastruktur**, bukan logika aplikasi.
Dampak pada diagram C4:

| Diagram | Status | Perubahan |
|---|---|---|
| Level 1 — Context | **Diupdate** | EdgeOne ditambahkan sebagai External System |
| Level 2 — Container | **Diupdate** | EdgeOne CDN layer ditambahkan, akses via HTTPS |
| Level 3 — Component | Tidak berubah | Isi script.js identik |
| Level 4 — Code | Tidak berubah | Detail class identik |
| Dynamic Diagram | Tidak berubah | Alur kalkulasi di browser identik |

---

## Level 1 — Context Diagram (v2)

**Pertanyaan:** Siapa yang berinteraksi dengan sistem, dan sistem eksternal apa yang terlibat?

**Yang baru di v2:** EdgeOne muncul sebagai External System. User kini mengakses via HTTPS ke URL publik, bukan membuka file lokal.

```
      ┌──────────────┐
      │ Pengguna     │
      │ Umum         │
      │ [Person]     │
      └──────┬───────┘
   HTTPS req │    ┌─ System Boundary ──────────────────┐
             ▼    │                                    │
      ┌─────────────────────────┐                      │
      │   Kalkulator Simple     │                      │
      │   [Software System]     │                      │
      │                         │                      │
      │   Kalkulasi aritmatika  │                      │
      │   di-hosting EdgeOne    │                      │
      │   *.edgeone.app         │                      │
      └───────────┬─────────────┘                      │
                  │ hosted on                          │
                  ▼                                    │
      ┌─────────────────────────┐                      │
      │  Tencent Cloud EdgeOne  │                      │
      │  [External System]      │                      │
      │  CDN + SSL + Hosting    │                      │
      └─────────────────────────┘                      │
                                                       │
      ┌──────────────┐                                 │
      │  Developer   │──── deploy (git/CLI/drop) ──────┼──▶ EdgeOne
      │  [Person]    │                                 │
      └──────────────┘                                 │
                                 └────────────────────-┘
```

**Aktor dan sistem:**

| Entitas | Tipe | Peran |
|---|---|---|
| Pengguna Umum | Person | Mengakses kalkulator via URL EdgeOne |
| Developer | Person | Men-deploy kode ke EdgeOne Pages |
| Tencent Cloud EdgeOne | External System | CDN, SSL, static hosting |

---

## Level 2 — Container Diagram (v2)

**Pertanyaan:** Sistem terdiri dari container (file/teknologi) apa, dan bagaimana alur request?

**Yang baru di v2:** EdgeOne CDN layer ditambahkan. Semua request masuk lewat HTTPS ke edge node EdgeOne, bukan langsung ke filesystem.

```
Developer ──deploy──▶ EdgeOne Pages Platform
                           │
                    ┌──────┴──────────────────────────────────┐
                    │  Tencent Cloud EdgeOne  [External]       │
                    │  ┌──────────────────────────────────┐    │
                    │  │  Kalkulator Simple [System]      │    │
                    │  │                                  │    │
                    │  │  ┌──────────┐  ┌──────────┐     │    │
                    │  │  │index.html│  │style.css │     │    │
                    │  │  │[HTML5]   │─▶│[CSS3]    │     │    │
                    │  │  └────┬─────┘  └──────────┘     │    │
                    │  │       │<script>                  │    │
                    │  │  ┌────▼──────────────────┐       │    │
                    │  │  │      script.js         │       │    │
                    │  │  │      [JavaScript]      │       │    │
                    │  │  └────────────────────────┘       │    │
                    │  │       ▲                           │    │
                    │  │  ┌────┴──────────────────┐       │    │
                    │  │  │   ops/basicOps.js      │       │    │
                    │  │  │   [JavaScript]         │       │    │
                    │  │  └────────────────────────┘       │    │
                    │  └──────────────────────────────────┘    │
                    │  CDN Edge · Auto HTTPS · *.edgeone.app    │
                    └──────────────────────────────────────────┘
                           │ HTTPS
                    User Browser
```

**Container dalam sistem:**

| Container | Teknologi | Tanggung Jawab |
|---|---|---|
| `index.html` | HTML5 | Struktur UI, tombol, link ke CSS dan JS |
| `style.css` | CSS3 | Layout grid, warna, responsif |
| `script.js` | JavaScript ES6+ | Semua logika: Registry, Calculator, Display, EventHandler |
| `ops/basicOps.js` | JavaScript | Fungsi aritmatika murni |
| EdgeOne Edge Network | CDN | Melayani file via HTTPS dari edge node terdekat |

**Urutan muat setelah deployment:**
```
1. User buka https://[project].edgeone.app
2. DNS resolve → EdgeOne edge node terdekat
3. EdgeOne serve index.html (dari cache atau origin)
4. Browser parse HTML → request style.css, basicOps.js, script.js
5. Semua file dilayani via HTTP/2 dari EdgeOne
6. DOMContentLoaded → Bootstrap berjalan di browser
7. Kalkulator siap digunakan
```

---

## Level 3 — Component Diagram (tidak berubah dari v1.0)

Zoom ke dalam `script.js` — lima komponen: `EventHandler`, `Calculator`, `OperationRegistry`, `Display`, `Bootstrap`.

Tidak berubah karena deployment hanya mengubah cara file dikirim ke browser, bukan isi file-nya.

Lihat C4 Model v1.0 Level 3 untuk diagram lengkap.

---

## Level 4 — Code Diagram (tidak berubah dari v1.0)

Detail class, property, method, dan relasi dependency. Identik dengan v1.0.

Lihat C4 Model v1.0 Level 4 untuk diagram lengkap.

---

## Dynamic Diagram (tidak berubah dari v1.0)

Skenario `8 + 3 =` — urutan interaksi antar komponen di dalam browser.

Tidak berubah karena alur kalkulasi di sisi browser identik, terlepas dari platform hosting.

Lihat C4 Model v1.0 Dynamic Diagram untuk diagram lengkap.

---

## Catatan Arsitektur

Keputusan deployment ke EdgeOne tidak mempengaruhi arsitektur internal aplikasi sama sekali. Ini adalah salah satu manfaat dari desain pure static site — deployment platform bisa diganti (EdgeOne → Netlify → GitHub Pages → Vercel) tanpa mengubah satu baris kode pun. Satu-satunya yang berubah adalah URL akses dan konfigurasi DNS.

Detail keputusan ini didokumentasikan di arc42 v2.0 §9 ADR-07.
