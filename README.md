# Kalkulator Simple

Aplikasi kalkulator berbasis browser — HTML + CSS + Vanilla JavaScript. Di-deploy ke Tencent Cloud EdgeOne Pages.

**Live:** https://[project-name].edgeone.app

---

## Fitur

- Empat operasi aritmatika: `+`, `−`, `×`, `÷`
- Input via tombol dan keyboard penuh
- State machine eksplisit — perilaku tombol predictable
- Error handling untuk pembagian nol
- Responsif — desktop dan mobile

## Struktur File

```
kalkulator/
├── index.html        → Struktur UI
├── style.css         → Layout & tampilan
├── script.js         → Logika aplikasi (4 class + bootstrap)
└── ops/
    └── basicOps.js   → Fungsi aritmatika dasar
```

## Arsitektur

```
EventHandler → Calculator → OperationRegistry
                          ↘ Display → DOM
```

`OperationRegistry` memungkinkan penambahan operasi baru (sin, cos, %) tanpa mengubah komponen lain (Open/Closed Principle).

## Menjalankan Secara Lokal

```bash
# Cara paling sederhana — buka langsung di browser
open index.html

# Atau dengan server lokal (opsional)
npx serve .
python3 -m http.server 8000
```

## Deploy ke EdgeOne Pages

**Opsi A — Pages Drop (paling cepat):**
1. Buka [pages.edgeone.ai/drop](https://pages.edgeone.ai/drop)
2. Upload folder `kalkulator/` atau file `kalkulator.html`
3. Klik Deploy

**Opsi B — Git Integration:**
1. Push repo ini ke GitHub / GitLab
2. Hubungkan repo di [EdgeOne Pages console](https://console.tencentcloud.com/edgeone/pages)
3. Auto-deploy aktif setiap push ke `main`

**Opsi C — CLI:**
```bash
npm install -g edgeone
edgeone pages deploy .
```

## Keyboard Shortcut

| Tombol | Fungsi |
|---|---|
| `0`–`9`, `.` | Input angka |
| `+`, `-`, `*`, `/` | Operator |
| `Enter` atau `=` | Hitung |
| `Escape` | Reset (C) |
| `Backspace` | Hapus entry (CE) |

## Dokumentasi

Dokumentasi lengkap SDLC tersedia terpisah:
- `PRD-v4-Kalkulator.md` — Product Requirements
- `SRS-v2-Kalkulator.md` — System Requirements Specification
- `arc42-v2-Kalkulator.md` — Architecture Documentation
- `C4-Model-v2-Kalkulator.md` — C4 Architecture Diagrams
- `TestCase-Kalkulator.md` — Test Cases

## Teknologi

Pure Vanilla JavaScript ES6+ — tanpa framework, tanpa dependency, tanpa build step.

## Lisensi

MIT