# Test Case Document
## Aplikasi Kalkulator Simple — Browser-Based JavaScript

---

| Atribut | Detail |
|---|---|
| Dokumen | Test Case Document |
| Versi | 1.0 |
| Tanggal | Maret 2026 |
| Status | Final |
| Deployment Target | Tencent Cloud EdgeOne Pages |
| URL Produksi | https://[project].edgeone.app |
| Diturunkan dari | SRS v2.0, PRD v4.0 |
| Jenis Testing | Manual Functional Testing |

---

## Daftar Isi

1. Ruang Lingkup Testing
2. Lingkungan Testing
3. Test Suite A — Operasi Aritmatika
4. Test Suite B — State Machine
5. Test Suite C — Error Handling & Edge Case
6. Test Suite D — Input Keyboard
7. Test Suite E — Tampilan & UI
8. Test Suite F — Deployment & Aksesibilitas (baru — EdgeOne)
9. Traceability Matrix

---

## 1. Ruang Lingkup Testing

Dokumen ini mencakup dua kelompok test case:

**Kelompok 1 — Logika Aplikasi** (Test Suite A–E): Menguji fungsionalitas kalkulator yang berjalan di browser. Tidak terpengaruh oleh deployment ke EdgeOne — hasilnya sama di lokal maupun di cloud.

**Kelompok 2 — Deployment** (Test Suite F): Menguji aksesibilitas dan kondisi non-fungsional yang hanya dapat diverifikasi setelah aplikasi live di EdgeOne Pages.

---

## 2. Lingkungan Testing

### 2.1 Browser yang Diuji

| Browser | Versi Minimum | Platform |
|---|---|---|
| Google Chrome | ≥ 115 | Windows, macOS |
| Mozilla Firefox | ≥ 115 | Windows, macOS |
| Apple Safari | ≥ 16 | macOS, iOS |
| Microsoft Edge | ≥ 115 | Windows |

### 2.2 URL Testing

| Lingkungan | URL |
|---|---|
| Lokal (development) | `file:///path/to/index.html` atau `http://localhost` |
| Production (EdgeOne) | `https://[project-name].edgeone.app` |

### 2.3 Konvensi Hasil

| Simbol | Arti |
|---|---|
| PASS | Test berhasil, sistem berperilaku sesuai ekspektasi |
| FAIL | Test gagal, sistem tidak berperilaku sesuai ekspektasi |
| SKIP | Test dilewati (kondisi prasyarat tidak terpenuhi) |

---

## 3. Test Suite A — Operasi Aritmatika

**Diturunkan dari:** SRS v2.0 FR-01–FR-08, NFR-05

### TC-A-01: Penjumlahan bilangan bulat

| Field | Detail |
|---|---|
| ID | TC-A-01 |
| Referensi SRS | FR-01, FR-05 |
| Precondition | Aplikasi terbuka, display menampilkan `0` |
| Langkah | 1. Klik `8` → 2. Klik `+` → 3. Klik `3` → 4. Klik `=` |
| Expected Result | Display menampilkan `11` |
| Tipe | Functional — Positive |

### TC-A-02: Pengurangan bilangan bulat

| Field | Detail |
|---|---|
| ID | TC-A-02 |
| Referensi SRS | FR-02, FR-05 |
| Precondition | Aplikasi terbuka, display menampilkan `0` |
| Langkah | 1. Klik `9` → 2. Klik `−` → 3. Klik `4` → 4. Klik `=` |
| Expected Result | Display menampilkan `5` |
| Tipe | Functional — Positive |

### TC-A-03: Perkalian bilangan bulat

| Field | Detail |
|---|---|
| ID | TC-A-03 |
| Referensi SRS | FR-03, FR-05 |
| Precondition | Aplikasi terbuka, display menampilkan `0` |
| Langkah | 1. Klik `6` → 2. Klik `×` → 3. Klik `7` → 4. Klik `=` |
| Expected Result | Display menampilkan `42` |
| Tipe | Functional — Positive |

### TC-A-04: Pembagian bilangan bulat

| Field | Detail |
|---|---|
| ID | TC-A-04 |
| Referensi SRS | FR-04, FR-05 |
| Precondition | Aplikasi terbuka, display menampilkan `0` |
| Langkah | 1. Klik `1` → Klik `5` → 2. Klik `÷` → 3. Klik `3` → 4. Klik `=` |
| Expected Result | Display menampilkan `5` |
| Tipe | Functional — Positive |

### TC-A-05: Operasi dengan desimal

| Field | Detail |
|---|---|
| ID | TC-A-05 |
| Referensi SRS | FR-06, NFR-07 |
| Precondition | Aplikasi terbuka |
| Langkah | 1. Klik `0` → `.` → `1` → 2. Klik `+` → 3. Klik `0` → `.` → `2` → 4. Klik `=` |
| Expected Result | Display menampilkan `0.3` (bukan `0.30000000000000004`) |
| Tipe | Functional — Floating Point |

### TC-A-06: Hasil kalkulasi berlanjut

| Field | Detail |
|---|---|
| ID | TC-A-06 |
| Referensi SRS | FR-05 |
| Precondition | Aplikasi terbuka |
| Langkah | 1. Input `5 + 3 =` → 2. Klik `×` → 3. Klik `2` → 4. Klik `=` |
| Expected Result | Display menampilkan `16` (hasil sebelumnya `8` dipakai sebagai operand pertama) |
| Tipe | Functional — Chained Operation |

### TC-A-07: Operasi dengan angka negatif

| Field | Detail |
|---|---|
| ID | TC-A-07 |
| Referensi SRS | FR-01 |
| Precondition | Aplikasi terbuka |
| Langkah | 1. Input `3 − 8 =` |
| Expected Result | Display menampilkan `-5` |
| Tipe | Functional — Negative Result |

---

## 4. Test Suite B — State Machine

**Diturunkan dari:** SRS v2.0 FR-09–FR-12, State Diagram

### TC-B-01: State IDLE → INPUT_A (digit pertama)

| Field | Detail |
|---|---|
| ID | TC-B-01 |
| Referensi SRS | FR-09 |
| Precondition | State = IDLE, display = `0` |
| Langkah | Klik angka `7` |
| Expected Result | Display menampilkan `7`, state berubah ke INPUT_A |
| Tipe | State Transition |

### TC-B-02: State RESULT → INPUT_A (mulai kalkulasi baru)

| Field | Detail |
|---|---|
| ID | TC-B-02 |
| Referensi SRS | FR-09, FR-05 |
| Precondition | State = RESULT setelah `5 + 3 =` (display = `8`) |
| Langkah | Klik angka `4` |
| Expected Result | Display menampilkan `4`, state berubah ke INPUT_A (kalkulasi baru dimulai) |
| Tipe | State Transition |

### TC-B-03: Tombol CE di state INPUT_A

| Field | Detail |
|---|---|
| ID | TC-B-03 |
| Referensi SRS | FR-11 |
| Precondition | State = INPUT_A, user sudah input `123` |
| Langkah | Klik `CE` |
| Expected Result | Display kembali ke `0`, state kembali ke IDLE |
| Tipe | State Transition |

### TC-B-04: Tombol C dari state manapun → IDLE

| Field | Detail |
|---|---|
| ID | TC-B-04 |
| Referensi SRS | FR-10 |
| Precondition | State = INPUT_B setelah input `5 + 3` |
| Langkah | Klik `C` |
| Expected Result | Display menampilkan `0`, sub-display kosong, state = IDLE |
| Tipe | State Transition |

### TC-B-05: Operator aktif di-highlight

| Field | Detail |
|---|---|
| ID | TC-B-05 |
| Referensi SRS | FR-09 |
| Precondition | Aplikasi terbuka |
| Langkah | 1. Klik `5` → 2. Klik `+` |
| Expected Result | Tombol `+` tampak aktif/ter-highlight, sub-display menampilkan `5 +` |
| Tipe | UI State |

---

## 5. Test Suite C — Error Handling & Edge Case

**Diturunkan dari:** SRS v2.0 FR-13–FR-16, NFR-05, NFR-06

### TC-C-01: Pembagian dengan nol

| Field | Detail |
|---|---|
| ID | TC-C-01 |
| Referensi SRS | FR-13 |
| Precondition | Aplikasi terbuka |
| Langkah | 1. Klik `5` → 2. Klik `÷` → 3. Klik `0` → 4. Klik `=` |
| Expected Result | Display menampilkan `Error`, sub-display menampilkan `5 ÷ 0 =` |
| Tipe | Error Handling |

### TC-C-02: Tombol operasi nonaktif saat ERROR

| Field | Detail |
|---|---|
| ID | TC-C-02 |
| Referensi SRS | FR-13, FR-14 |
| Precondition | State = ERROR (setelah TC-C-01) |
| Langkah | Klik semua tombol angka dan operator |
| Expected Result | Semua tombol tidak bereaksi kecuali `C` |
| Tipe | Error Handling |

### TC-C-03: Pemulihan dari ERROR via tombol C

| Field | Detail |
|---|---|
| ID | TC-C-03 |
| Referensi SRS | FR-10, FR-14 |
| Precondition | State = ERROR |
| Langkah | Klik `C` |
| Expected Result | Display kembali `0`, state = IDLE, semua tombol aktif kembali |
| Tipe | Error Recovery |

### TC-C-04: Titik desimal ganda dicegah

| Field | Detail |
|---|---|
| ID | TC-C-04 |
| Referensi SRS | FR-06 |
| Precondition | User sudah input `3.14` |
| Langkah | Klik `.` lagi |
| Expected Result | Titik kedua diabaikan, display tetap `3.14` |
| Tipe | Input Validation |

### TC-C-05: Tidak ada error di browser console

| Field | Detail |
|---|---|
| ID | TC-C-05 |
| Referensi SRS | NFR-06 |
| Precondition | Browser DevTools console terbuka |
| Langkah | Lakukan semua operasi termasuk bagi nol, input berulang, klik cepat |
| Expected Result | Tidak ada pesan error (merah) di console |
| Tipe | Non-Functional |

---

## 6. Test Suite D — Input Keyboard

**Diturunkan dari:** SRS v2.0 FR-17–FR-19

### TC-D-01: Input angka via keyboard

| Field | Detail |
|---|---|
| ID | TC-D-01 |
| Referensi SRS | FR-17 |
| Precondition | Aplikasi terbuka, fokus di window |
| Langkah | Tekan tombol `8` di keyboard |
| Expected Result | Display menampilkan `8`, tombol `8` di UI ter-flash |
| Tipe | Functional — Keyboard |

### TC-D-02: Operasi via keyboard

| Field | Detail |
|---|---|
| ID | TC-D-02 |
| Referensi SRS | FR-17 |
| Precondition | Aplikasi terbuka |
| Langkah | Tekan `5`, `+`, `3`, `Enter` |
| Expected Result | Display menampilkan `8` |
| Tipe | Functional — Keyboard |

### TC-D-03: Escape = C (reset)

| Field | Detail |
|---|---|
| ID | TC-D-03 |
| Referensi SRS | FR-18 |
| Precondition | User sudah input beberapa angka |
| Langkah | Tekan `Escape` |
| Expected Result | Display kembali ke `0`, state = IDLE |
| Tipe | Functional — Keyboard |

### TC-D-04: Backspace = CE (hapus entry)

| Field | Detail |
|---|---|
| ID | TC-D-04 |
| Referensi SRS | FR-19 |
| Precondition | State = INPUT_A, display = `123` |
| Langkah | Tekan `Backspace` |
| Expected Result | Display kembali ke `0`, state = IDLE |
| Tipe | Functional — Keyboard |

---

## 7. Test Suite E — Tampilan & UI

**Diturunkan dari:** SRS v2.0 NFR-07, NFR-08

### TC-E-01: Tampilan responsif — desktop

| Field | Detail |
|---|---|
| ID | TC-E-01 |
| Referensi SRS | NFR-07 |
| Precondition | Browser di desktop (lebar ≥ 768px) |
| Langkah | Buka aplikasi, periksa layout |
| Expected Result | Grid tombol rapi 3×6, display proporsional, tidak ada elemen yang terpotong |
| Tipe | Non-Functional — UI |

### TC-E-02: Tampilan responsif — mobile

| Field | Detail |
|---|---|
| ID | TC-E-02 |
| Referensi SRS | NFR-07 |
| Precondition | Browser di mobile (lebar ≤ 480px) atau DevTools mobile view |
| Langkah | Buka aplikasi, periksa layout |
| Expected Result | Semua tombol terlihat dan dapat diklik tanpa scroll horizontal |
| Tipe | Non-Functional — UI |

### TC-E-03: Animasi ripple pada klik tombol

| Field | Detail |
|---|---|
| ID | TC-E-03 |
| Referensi SRS | NFR-08 |
| Precondition | Aplikasi terbuka |
| Langkah | Klik tombol angka apapun |
| Expected Result | Efek ripple visual muncul di tombol yang diklik |
| Tipe | UI — Visual Feedback |

### TC-E-04: Flash result pada hasil kalkulasi

| Field | Detail |
|---|---|
| ID | TC-E-04 |
| Referensi SRS | NFR-08 |
| Precondition | Aplikasi terbuka |
| Langkah | Input `5 + 3 =` |
| Expected Result | Display hasil `8` menampilkan animasi flash singkat |
| Tipe | UI — Visual Feedback |

---

## 8. Test Suite F — Deployment & Aksesibilitas

**Diturunkan dari:** SRS v2.0 NFR-11–NFR-14, PRD v4.0 §6, TC-06, TC-07

> Test suite ini **hanya dapat dieksekusi setelah deployment ke EdgeOne Pages selesai**. Tidak relevan di lingkungan lokal.

---

### TC-F-01: URL publik dapat diakses

| Field | Detail |
|---|---|
| ID | TC-F-01 |
| Referensi SRS | NFR-11, TC-06 |
| Precondition | Deployment ke EdgeOne Pages telah selesai |
| Langkah | 1. Buka browser baru (mode incognito) → 2. Ketik URL `https://[project-name].edgeone.app` → 3. Tekan Enter |
| Expected Result | Halaman kalkulator termuat sempurna — display menampilkan `0`, semua tombol terlihat |
| Catatan | Uji dari perangkat berbeda (laptop, HP) untuk konfirmasi akses publik |
| Tipe | Deployment — Accessibility |

### TC-F-02: HTTPS aktif otomatis

| Field | Detail |
|---|---|
| ID | TC-F-02 |
| Referensi SRS | NFR-12, TC-07 |
| Precondition | Deployment selesai |
| Langkah | 1. Lihat address bar browser → 2. Periksa ikon gembok (🔒) di address bar |
| Expected Result | Ikon gembok terlihat, koneksi menunjukkan "Secure" atau "Connection is secure" |
| Tipe | Deployment — Security |

### TC-F-03: HTTP redirect ke HTTPS

| Field | Detail |
|---|---|
| ID | TC-F-03 |
| Referensi SRS | NFR-12 |
| Precondition | Deployment selesai |
| Langkah | Ketik `http://[project-name].edgeone.app` (tanpa S) di address bar |
| Expected Result | Browser otomatis redirect ke `https://...` — halaman tetap termuat |
| Tipe | Deployment — Security |

### TC-F-04: Waktu muat pertama < 2 detik

| Field | Detail |
|---|---|
| ID | TC-F-04 |
| Referensi SRS | NFR-01, NFR-13 |
| Precondition | Deployment selesai, koneksi broadband (≥ 10 Mbps) |
| Langkah | 1. Buka Chrome DevTools → Network tab → 2. Centang "Disable cache" → 3. Reload halaman → 4. Catat nilai `DOMContentLoaded` |
| Expected Result | `DOMContentLoaded` ≤ 2000ms |
| Catatan | File total hanya ±20 KB — dari EdgeOne CDN harus sangat cepat |
| Tipe | Non-Functional — Performance |

### TC-F-05: Semua file termuat dari EdgeOne (bukan cache lokal)

| Field | Detail |
|---|---|
| ID | TC-F-05 |
| Referensi SRS | NFR-13 |
| Precondition | Deployment selesai, DevTools Network tab terbuka |
| Langkah | 1. Buka DevTools Network → 2. Reload halaman → 3. Periksa setiap request: `index.html`, `style.css`, `script.js`, `basicOps.js` |
| Expected Result | Semua file menunjukkan status `200`, ukuran sesuai (~20 KB total), served dari domain EdgeOne |
| Tipe | Deployment — Network |

### TC-F-06: Aplikasi fungsional setelah dimuat (offline test)

| Field | Detail |
|---|---|
| ID | TC-F-06 |
| Referensi SRS | NFR-14 |
| Precondition | Halaman sudah termuat dari EdgeOne |
| Langkah | 1. Halaman sudah terbuka sempurna → 2. Matikan WiFi / cabut kabel LAN → 3. Lakukan kalkulasi `8 + 3 =` |
| Expected Result | Kalkulator tetap berjalan normal, display menampilkan `11` meskipun internet terputus |
| Catatan | Ini membuktikan logika berjalan 100% di browser — tidak ada request ke server |
| Tipe | Non-Functional — Offline |

### TC-F-07: Fungsionalitas tidak berubah di URL EdgeOne vs lokal

| Field | Detail |
|---|---|
| ID | TC-F-07 |
| Referensi SRS | NFR-11 |
| Precondition | Deployment selesai |
| Langkah | Ulangi TC-A-01 sampai TC-A-07 menggunakan URL EdgeOne (bukan file lokal) |
| Expected Result | Semua hasil identik dengan pengujian lokal |
| Catatan | Deployment tidak boleh mengubah perilaku aplikasi |
| Tipe | Deployment — Regression |

### TC-F-08: Akses dari berbagai browser di URL EdgeOne

| Field | Detail |
|---|---|
| ID | TC-F-08 |
| Referensi SRS | NFR-03, NFR-11 |
| Precondition | Deployment selesai |
| Langkah | Buka URL EdgeOne di Chrome, Firefox, Safari, Edge — lakukan kalkulasi dasar di masing-masing |
| Expected Result | Aplikasi berjalan benar di semua browser yang didukung |
| Tipe | Deployment — Cross-browser |

---

## 9. Traceability Matrix

| Test Case | SRS Requirement | PRD Section | Jenis | Hanya di EdgeOne? |
|---|---|---|---|---|
| TC-A-01 | FR-01, FR-05 | §4 Scope | Functional | Tidak |
| TC-A-02 | FR-02, FR-05 | §4 Scope | Functional | Tidak |
| TC-A-03 | FR-03, FR-05 | §4 Scope | Functional | Tidak |
| TC-A-04 | FR-04, FR-05 | §4 Scope | Functional | Tidak |
| TC-A-05 | FR-06, NFR-07 | §4 Scope | Functional | Tidak |
| TC-A-06 | FR-05 | §4 Scope | Functional | Tidak |
| TC-A-07 | FR-01 | §4 Scope | Functional | Tidak |
| TC-B-01 | FR-09 | §7 State | State | Tidak |
| TC-B-02 | FR-09, FR-05 | §7 State | State | Tidak |
| TC-B-03 | FR-11 | §7 State | State | Tidak |
| TC-B-04 | FR-10 | §7 State | State | Tidak |
| TC-B-05 | FR-09 | §7 State | UI State | Tidak |
| TC-C-01 | FR-13 | §4 Error | Error | Tidak |
| TC-C-02 | FR-13, FR-14 | §4 Error | Error | Tidak |
| TC-C-03 | FR-10, FR-14 | §4 Error | Error | Tidak |
| TC-C-04 | FR-06 | §4 Input | Validation | Tidak |
| TC-C-05 | NFR-06 | §10 Quality | Non-Functional | Tidak |
| TC-D-01 | FR-17 | §4 Scope | Functional | Tidak |
| TC-D-02 | FR-17 | §4 Scope | Functional | Tidak |
| TC-D-03 | FR-18 | §4 Scope | Functional | Tidak |
| TC-D-04 | FR-19 | §4 Scope | Functional | Tidak |
| TC-E-01 | NFR-07 | §11 UX | Non-Functional | Tidak |
| TC-E-02 | NFR-07 | §11 UX | Non-Functional | Tidak |
| TC-E-03 | NFR-08 | §11 UX | UI | Tidak |
| TC-E-04 | NFR-08 | §11 UX | UI | Tidak |
| **TC-F-01** | **NFR-11, TC-06** | **§6.1** | **Deployment** | **Ya** |
| **TC-F-02** | **NFR-12, TC-07** | **§6.1** | **Deployment** | **Ya** |
| **TC-F-03** | **NFR-12** | **§6.1** | **Deployment** | **Ya** |
| **TC-F-04** | **NFR-01, NFR-13** | **§6.3** | **Non-Functional** | **Ya** |
| **TC-F-05** | **NFR-13** | **§6.3** | **Deployment** | **Ya** |
| **TC-F-06** | **NFR-14** | **§2** | **Non-Functional** | **Ya** |
| **TC-F-07** | **NFR-11** | **§6.1** | **Regression** | **Ya** |
| **TC-F-08** | **NFR-03, NFR-11** | **§6.1** | **Deployment** | **Ya** |

---

*Test Suite A–E dapat dieksekusi di lingkungan lokal maupun production. Test Suite F hanya dapat dieksekusi setelah deployment ke EdgeOne Pages selesai dan URL publik tersedia.*
