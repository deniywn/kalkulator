# Software Requirements Specification (SRS)
## Aplikasi Kalkulator Simple — Browser-Based JavaScript

---

| Atribut | Detail |
|---|---|
| Dokumen | Software Requirements Specification |
| Versi | 2.0 |
| Tanggal | Maret 2026 |
| Status | Final — Production |
| Deployment Target | Tencent Cloud EdgeOne Pages |
| URL Produksi | https://[project].edgeone.app |
| Dokumen terkait | PRD v4.0, arc42 v2.0, C4 Model v2.0 |
| Diturunkan dari | PRD v4.0 |
| Standar acuan | IEEE 830 / ISO/IEC 29148 |

---

## Daftar Isi

1. Pendahuluan
2. Deskripsi Umum Sistem
3. Definisi, Akronim, dan Singkatan
4. Functional Requirements (FR)
5. Non-Functional Requirements (NFR)
6. Constraint dan Assumption
7. Interface Requirements
8. State dan Behaviour Requirements
9. Acceptance Criteria per Requirement
10. Traceability Matrix

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan seluruh persyaratan teknis sistem untuk aplikasi Kalkulator Simple berbasis browser. SRS ini diturunkan dari PRD v4.0 dan menjadi acuan resmi bagi developer, tester, dan reviewer dalam proses implementasi dan verifikasi sistem.

### 1.2 Ruang Lingkup

Sistem yang dispesifikasikan adalah aplikasi kalkulator yang berjalan sepenuhnya di dalam browser tanpa server-side logic atau API eksternal. Sistem mencakup empat operasi aritmatika dasar dengan arsitektur yang dapat diperluas untuk operasi tambahan di masa mendatang tanpa modifikasi pada komponen inti.

### 1.3 Dokumen Terkait

| Dokumen | Versi | Hubungan |
|---|---|---|
| PRD — Kalkulator Simple | v3.0 | Dokumen induk, sumber kebutuhan |
| Wireframe Kalkulator | v1.0 | Referensi tampilan |
| Test Case Specification | v1.0 | Diturunkan dari SRS ini |
| Class Diagram v2 | v2.0 | Referensi arsitektur |

---

## 2. Deskripsi Umum Sistem

### 2.1 Perspektif Sistem

Sistem adalah aplikasi standalone yang berjalan di browser modern. Tidak memiliki ketergantungan pada sistem lain, jaringan, atau server. Seluruh kalkulasi dijalankan di sisi klien menggunakan JavaScript.

### 2.2 Fungsi Utama Sistem

Sistem menyediakan kemampuan untuk:
- Memasukkan angka melalui antarmuka tombol atau keyboard
- Melakukan operasi aritmatika dasar antara dua operand
- Menampilkan hasil kalkulasi dan riwayat ekspresi secara real-time
- Mengelola state kalkulasi secara konsisten di setiap kondisi input

### 2.3 Karakteristik Pengguna

| Segmen | Karakteristik | Ekspektasi |
|---|---|---|
| Pengguna umum | Non-teknis, menggunakan browser sehari-hari | Operasi intuitif tanpa instruksi |
| Developer pemula | Familiar dengan JavaScript dan DOM | Kode yang bisa dipelajari dan dikembangkan |

### 2.4 Arsitektur Komponen

Sistem terdiri dari empat komponen utama yang memiliki tanggung jawab terpisah:

- **`OperationRegistry`** — Menyimpan dan mengeksekusi fungsi operasi. Satu-satunya komponen yang dimodifikasi saat menambah operasi baru.
- **`Calculator`** — Mengelola state machine dan mengkoordinasikan alur kalkulasi. Tidak mengandung logika aritmatika secara langsung.
- **`Display`** — Bertanggung jawab atas semua output visual ke layar.
- **`EventHandler`** — Menghubungkan interaksi user (tombol dan keyboard) ke `Calculator`.

---

## 3. Definisi, Akronim, dan Singkatan

| Istilah | Definisi |
|---|---|
| SHALL | Persyaratan wajib yang harus dipenuhi tanpa pengecualian (RFC 2119) |
| SHOULD | Persyaratan yang sangat direkomendasikan; pengecualian harus terdokumentasi |
| MAY | Persyaratan opsional |
| FR | Functional Requirement — persyaratan fungsional sistem |
| NFR | Non-Functional Requirement — persyaratan kualitas sistem |
| Operand | Nilai numerik yang menjadi input operasi aritmatika |
| Operator | Simbol operasi: `+`, `-`, `×`, `÷` |
| State | Kondisi sistem pada satu titik waktu tertentu |
| IDLE | State awal atau setelah reset |
| INPUT_A | State saat user memasukkan angka pertama |
| OPERATOR_SET | State setelah operator dipilih |
| INPUT_B | State saat user memasukkan angka kedua |
| RESULT | State setelah kalkulasi berhasil |
| ERROR | State setelah kalkulasi gagal (misal: bagi nol) |

---

## 4. Functional Requirements (FR)

Notasi: setiap requirement menggunakan kata kunci SHALL (wajib), SHOULD (sangat disarankan), MAY (opsional) sesuai RFC 2119.

---

### 4.1 Input Angka

**FR-01 — Input digit numerik**
Sistem SHALL menerima input digit `0` hingga `9` melalui tombol antarmuka dan keyboard.

**FR-02 — Input angka desimal**
Sistem SHALL menerima input karakter titik (`.`) untuk membentuk angka desimal.
Sistem SHALL mengabaikan input titik kedua jika `displayValue` sudah mengandung karakter `.`.

**FR-03 — Pembentukan angka multi-digit**
Sistem SHALL menambahkan setiap digit baru ke sisi kanan `displayValue` yang ada (append), bukan menggantikan nilai sebelumnya.

**FR-04 — Pencegahan leading zero**
Sistem SHALL mengganti `"0"` dengan digit baru jika `displayValue` saat ini adalah `"0"` dan digit yang diinput bukan `.`.

---

### 4.2 Pemilihan Operator

**FR-05 — Pemilihan operator aritmatika**
Sistem SHALL mendukung empat operator: penjumlahan (`+`), pengurangan (`-`), perkalian (`*`), dan pembagian (`/`).

**FR-06 — Penyimpanan operand pertama**
Setelah operator dipilih, sistem SHALL menyimpan nilai `displayValue` sebagai `operand1` dan transisi ke state `OPERATOR_SET`.

**FR-07 — Penggantian operator**
Jika operator baru dipilih saat state adalah `OPERATOR_SET`, sistem SHALL mengganti operator yang tersimpan tanpa melakukan kalkulasi.

**FR-08 — Kalkulasi berantai**
Jika operator baru dipilih saat state adalah `INPUT_B`, sistem SHALL terlebih dahulu menyelesaikan kalkulasi dengan nilai yang ada, kemudian menggunakan hasilnya sebagai `operand1` baru.

---

### 4.3 Kalkulasi

**FR-09 — Eksekusi kalkulasi**
Saat tombol `=` ditekan pada state `INPUT_B`, sistem SHALL mengeksekusi operasi `registry.execute(operator, operand1, operand2)` dan menampilkan hasilnya.

**FR-10 — Penanganan pembagian dengan nol**
Jika `operator` adalah `/` dan `operand2` adalah `0`, sistem SHALL menampilkan teks `"Error"` pada main display, menampilkan ekspresi penyebab pada sub display, dan transisi ke state `ERROR`.

**FR-11 — Repeat kalkulasi**
Jika `=` ditekan pada state `RESULT`, sistem SHALL mengulang operasi terakhir menggunakan hasil sebelumnya sebagai `operand1` baru dan `lastOperand` sebagai `operand2`.

**FR-12 — Presisi hasil**
Sistem SHALL membulatkan hasil kalkulasi menggunakan `toPrecision(12)` untuk mencegah floating point error yang terlihat oleh user (contoh: `0.1 + 0.2` SHALL menampilkan `0.3`, bukan `0.30000000000000004`).

**FR-13 — Notasi eksponensial**
Jika hasil kalkulasi memiliki nilai absolut lebih besar dari atau sama dengan `1e15`, atau lebih kecil dari `1e-10` (dan bukan nol), sistem SHALL menampilkan hasil dalam notasi eksponensial.

---

### 4.4 Kontrol

**FR-14 — Reset penuh (C)**
Saat tombol `C` ditekan dari state mana pun, sistem SHALL mereset semua nilai (`operand1`, `operand2`, `operator`, `displayValue`, `lastOperand`, `lastOp`) ke nilai awal dan transisi ke state `IDLE`.

**FR-15 — Hapus entry (CE)**
Saat tombol `CE` ditekan pada state `INPUT_A` atau `INPUT_B`:
- Jika `displayValue` memiliki lebih dari satu karakter, sistem SHALL menghapus karakter terakhir.
- Jika `displayValue` hanya memiliki satu karakter, sistem SHALL menggantinya dengan `"0"`.

**FR-16 — CE pada state tidak berlaku**
Sistem SHALL mengabaikan input `CE` pada state `IDLE` dan `OPERATOR_SET`.
Sistem SHALL menjalankan `clear()` jika `CE` ditekan pada state `ERROR` atau `RESULT`.

---

### 4.5 Input Keyboard

**FR-17 — Pemetaan keyboard**
Sistem SHALL memetakan input keyboard sebagai berikut:

| Tombol keyboard | Aksi sistem |
|---|---|
| `0` – `9` | `appendDigit(key)` |
| `.` | `appendDigit('.')` |
| `+` | `setOperator('+')` |
| `-` | `setOperator('-')` |
| `*` | `setOperator('*')` |
| `/` | `setOperator('/')` dan `preventDefault()` |
| `Enter` atau `=` | `calculate()` |
| `Backspace` | `clearEntry()` |
| `Escape` | `clear()` |

**FR-18 — Visual feedback keyboard**
Sistem SHOULD memberikan visual feedback (highlight sementara) pada tombol yang bersesuaian saat input keyboard diterima.

---

### 4.6 Display

**FR-19 — Main display**
Sistem SHALL menampilkan `displayValue` pada elemen `#display-main` setiap kali nilai berubah.

**FR-20 — Sub display (ekspresi)**
Sistem SHALL menampilkan ekspresi aktif (contoh: `"84 + "` atau `"84 + 36 ="`) pada elemen `#display-sub`.
Sub display SHALL dikosongkan saat state kembali ke `IDLE`.

**FR-21 — Highlight operator aktif**
Sistem SHOULD menampilkan visual highlight pada tombol operator yang sedang aktif saat state adalah `OPERATOR_SET`.
Highlight SHALL dihapus saat `=` atau `C` ditekan.

---

### 4.7 OperationRegistry

**FR-22 — Registrasi operasi**
Sistem SHALL menyediakan method `register(name, fn)` pada `OperationRegistry` untuk mendaftarkan fungsi operasi baru tanpa mengubah komponen lain.

**FR-23 — Eksekusi operasi**
`OperationRegistry.execute(name, a, b)` SHALL memanggil fungsi yang terdaftar untuk `name` yang diberikan.
Jika `name` tidak terdaftar, SHALL melempar `Error` dengan pesan `"Operation not found: {name}"`.

**FR-24 — Pendaftaran operasi dasar**
Sistem SHALL mendaftarkan empat operasi berikut ke `OperationRegistry` saat bootstrap:

| Nama | Fungsi |
|---|---|
| `'+'` | `(a, b) => a + b` |
| `'-'` | `(a, b) => a - b` |
| `'*'` | `(a, b) => a * b` |
| `'/'` | `(a, b) => { if (b === 0) throw Error; return a / b; }` |

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performa

**NFR-01 — Waktu respon input**
Sistem SHALL merespons setiap input tombol atau keyboard dalam waktu kurang dari 16ms (setara 60 frame per detik) pada perangkat dengan CPU single-core 1GHz.

**NFR-02 — Waktu muat awal**
Sistem SHALL selesai dimuat dan siap digunakan dalam waktu kurang dari 2 detik pada koneksi broadband standar (10 Mbps).

### 5.2 Kompatibilitas

**NFR-03 — Browser yang didukung**
Sistem SHALL berjalan dengan benar pada browser versi berikut:

| Browser | Versi minimum |
|---|---|
| Google Chrome | 115 |
| Mozilla Firefox | 115 |
| Apple Safari | 16 |
| Microsoft Edge | 115 |

**NFR-04 — Tanpa dependensi eksternal**
Sistem SHALL berjalan tanpa library JavaScript eksternal, framework, atau koneksi jaringan setelah file dimuat pertama kali.

### 5.3 Keandalan

**NFR-05 — Tidak ada crash**
Sistem SHALL tidak menampilkan JavaScript error di browser console selama operasi normal termasuk semua edge case yang didefinisikan dalam dokumen ini.

**NFR-06 — State consistency**
Sistem SHALL selalu berada dalam salah satu dari enam state yang terdefinisi. Tidak boleh ada state yang tidak terdefinisi atau tidak dapat diprediksi.

### 5.4 Usability

**NFR-07 — Responsif**
Antarmuka SHALL dapat digunakan pada layar dengan lebar minimum 320px (mobile) hingga 1920px (desktop) tanpa scrolling horizontal.

**NFR-08 — Aksesibilitas dasar**
Sistem SHOULD menyertakan atribut `aria-label` pada semua elemen interaktif dan `aria-live` pada area display untuk kompatibilitas dengan screen reader.

### 5.5 Maintainability

**NFR-09 — Extensibility**
Sistem SHALL memungkinkan penambahan operasi baru (persen, modulus, trigonometri) hanya dengan menambahkan satu baris `registry.register(name, fn)` tanpa mengubah `Calculator`, `Display`, atau `EventHandler`.

**NFR-10 — Pemisahan tanggung jawab**
Setiap komponen (`OperationRegistry`, `Calculator`, `Display`, `EventHandler`) SHALL memiliki satu tanggung jawab tunggal dan tidak boleh mengakses internal komponen lain secara langsung.

---

## 6. Constraint dan Assumption

### 6.1 Constraint Teknis

| ID | Constraint |
|---|---|
| CON-01 | Sistem hanya menggunakan HTML5, CSS3, dan Vanilla JavaScript ES6+. Tidak boleh menggunakan framework (React, Vue, Angular, dsb.) |
| CON-02 | Sistem tidak boleh menggunakan server-side logic, API eksternal, atau database |
| CON-03 | Seluruh logika sistem harus berjalan di sisi klien (browser) |
| CON-04 | Sistem tidak menggunakan `localStorage`, `sessionStorage`, atau mekanisme persistensi lain |

### 6.2 Assumption

| ID | Assumption |
|---|---|
| ASM-01 | User menggunakan browser modern yang mendukung ES6+ dan CSS Grid |
| ASM-02 | User memahami operasi dasar kalkulator tanpa membutuhkan tutorial |
| ASM-03 | Nilai numerik yang diinput dan dihasilkan berada dalam rentang yang bisa direpresentasikan oleh `Number` JavaScript (IEEE 754 double precision) |
| ASM-04 | Sistem tidak perlu menangani input dari mouse klik kanan atau gesture multi-touch khusus |

---

## 7. Interface Requirements

### 7.1 User Interface

**UI-01 — Struktur display**
Antarmuka SHALL memiliki dua area display yang terpisa:
- Sub display (`#display-sub`): menampilkan ekspresi aktif, font kecil, rata kanan
- Main display (`#display-main`): menampilkan nilai aktif atau hasil, font besar, rata kanan

**UI-02 — Grid tombol**
Antarmuka SHALL menyusun tombol dalam grid 3 kolom dengan susunan berikut:

```
[ C  ]  [ CE ]  [ ÷  ]
[ 7  ]  [ 8  ]  [ 9  ]
[ 4  ]  [ 5  ]  [ 6  ]
[ 1  ]  [ 2  ]  [ 3  ]
[ 0 (lebar 2 kolom) ]  [ . ]
                        [ = ]
[ +  ]  [ -  ]  [ ×  ]
```

**UI-03 — Diferensiasi visual tombol**
Sistem SHALL membedakan empat tipe tombol secara visual:
- Tombol angka (0–9, `.`): warna netral
- Tombol operator (`+`, `-`, `×`, `÷`): warna aksen ringan
- Tombol kontrol (`C`, `CE`): warna peringatan
- Tombol `=`: warna aksen utama yang menonjol

**UI-04 — Overflow display**
Jika panjang `displayValue` melebihi 6 karakter, font main display SHALL mengecil secara proporsional untuk mencegah overflow.

### 7.2 Struktur File

```
kalkulator/
├── index.html       — struktur UI
├── style.css        — tampilan dan layout
├── script.js        — semua logika (OperationRegistry, Calculator, Display, EventHandler)
└── ops/
    ├── basicOps.js      — operasi dasar (v1)
    ├── extendedOps.js   — operasi lanjutan (future)
    └── trigOps.js       — operasi trigonometri (future)
```

### 7.3 Deployment Interface

**NFR-11 — URL Publik (baru)**
Sistem SHALL dapat diakses melalui URL publik format `https://[project-name].edgeone.app` setelah deployment ke EdgeOne Pages.

**NFR-12 — HTTPS (baru)**
Sistem SHALL selalu diakses melalui HTTPS. Plain HTTP SHALL di-redirect ke HTTPS secara otomatis oleh EdgeOne.

**NFR-13 — CDN Availability (baru)**
Sistem SHALL tersedia dari edge node EdgeOne global. Target availability: 99.9% uptime sesuai SLA EdgeOne Free Plan.

**NFR-14 — Offline setelah muat (baru)**
Setelah halaman berhasil dimuat dari URL EdgeOne, sistem SHALL tetap berfungsi penuh meskipun koneksi internet terputus — karena seluruh logika berjalan di browser.

---

## 8. State dan Behaviour Requirements

### 8.1 State Machine

Sistem SHALL mengimplementasikan state machine dengan enam state berikut:

| State | Kondisi masuk | Tombol aktif |
|---|---|---|
| `IDLE` | Inisialisasi atau setelah `clear()` | Angka, `C` |
| `INPUT_A` | Digit pertama diinput dari `IDLE` | Angka, Operator, `C`, `CE` |
| `OPERATOR_SET` | Operator dipilih | Angka, Operator, `C` |
| `INPUT_B` | Digit pertama diinput dari `OPERATOR_SET` | Angka, `=`, `C`, `CE` |
| `RESULT` | Kalkulasi berhasil selesai | Semua |
| `ERROR` | Kalkulasi gagal (bagi nol) | Hanya `C` |

### 8.2 Tabel Transisi State

| State saat ini | Event | State berikutnya |
|---|---|---|
| `IDLE` | digit | `INPUT_A` |
| `INPUT_A` | digit | `INPUT_A` |
| `INPUT_A` | operator | `OPERATOR_SET` |
| `INPUT_A` | `C` | `IDLE` |
| `INPUT_A` | `CE` | `INPUT_A` |
| `OPERATOR_SET` | digit | `INPUT_B` |
| `OPERATOR_SET` | operator | `OPERATOR_SET` |
| `OPERATOR_SET` | `C` | `IDLE` |
| `INPUT_B` | digit | `INPUT_B` |
| `INPUT_B` | `=` (valid) | `RESULT` |
| `INPUT_B` | `=` (bagi nol) | `ERROR` |
| `INPUT_B` | operator | `OPERATOR_SET` (kalkulasi berantai) |
| `INPUT_B` | `C` | `IDLE` |
| `INPUT_B` | `CE` | `INPUT_B` |
| `RESULT` | digit | `INPUT_A` |
| `RESULT` | operator | `OPERATOR_SET` |
| `RESULT` | `=` | `RESULT` (repeat) |
| `RESULT` | `C` | `IDLE` |
| `ERROR` | `C` | `IDLE` |
| `ERROR` | semua kecuali `C` | `ERROR` (diabaikan) |

---

## 9. Acceptance Criteria per Requirement

Bagian ini mendefinisikan kondisi yang harus terpenuhi agar setiap FR dianggap telah diimplementasikan dengan benar. Acceptance criteria ini menjadi basis penulisan test case pada dokumen Test Specification.

| FR | Acceptance Criteria |
|---|---|
| FR-01 | Input `7` pada state `IDLE` → display menampilkan `"7"` |
| FR-02 | Input `3` lalu `.` lalu `5` → display `"3.5"`. Input `.` kedua diabaikan |
| FR-03 | Input `8` lalu `4` → display `"84"`, bukan `"4"` |
| FR-04 | Input `5` saat display `"0"` → display `"5"`, bukan `"05"` |
| FR-05 | Tombol `+`, `-`, `×`, `÷` masing-masing memicu `setOperator` dengan nilai yang benar |
| FR-06 | Input `84 +` → `operand1 = 84`, state = `OPERATOR_SET` |
| FR-07 | Input `84 + -` → operator berubah menjadi `-`, tidak ada kalkulasi |
| FR-08 | Input `5 + 3 ×` → kalkulasi `5+3=8` dahulu, lalu `operand1=8`, operator=`×` |
| FR-09 | Input `84 + 36 =` → display `"120"` |
| FR-10 | Input `84 ÷ 0 =` → display `"Error"`, state `ERROR` |
| FR-11 | Setelah `5 + 3 = 8`, tekan `=` lagi → display `"11"` |
| FR-12 | `0.1 + 0.2` → display `"0.3"`, bukan `"0.30000000000000004"` |
| FR-13 | `999999999999999 × 999` → display dalam notasi eksponensial |
| FR-14 | Tekan `C` dari state mana pun → display `"0"`, sub display kosong, state `IDLE` |
| FR-15 | Display `"123"`, tekan `CE` → display `"12"` |
| FR-16 | Tekan `CE` pada state `IDLE` → tidak ada perubahan |
| FR-17 | Tekan `Enter` pada keyboard → sama dengan tekan `=` |
| FR-18 | Tekan `7` pada keyboard → tombol `7` pada UI ter-highlight sebentar |
| FR-19 | Setiap perubahan `displayValue` langsung terlihat pada `#display-main` |
| FR-20 | Setelah input `84 +` → sub display menampilkan `"84 +"` |
| FR-21 | Setelah memilih `+` → tombol `+` ter-highlight; setelah `=` → highlight hilang |
| FR-22 | `registry.register('sin', Math.sin)` berhasil tanpa error |
| FR-23 | `registry.execute('sin', Math.PI/2)` → return `1` |
| FR-24 | `registry.execute('+', 3, 4)` → return `7` |

---

## 10. Traceability Matrix

Matriks ini menunjukkan ketertelusuran dari setiap FR/NFR ke PRD, diagram, dan komponen kode yang mengimplementasikannya.

| ID | Deskripsi singkat | Sumber PRD | Diagram terkait | Komponen kode |
|---|---|---|---|---|
| FR-01 | Input digit | PRD §4 UC1 | Flowchart, Activity | `Calculator.appendDigit()` |
| FR-02 | Input desimal | PRD §4 UC2 | State Diagram | `Calculator.appendDigit()` |
| FR-03 | Append digit | PRD §8 edge case | Flowchart | `Calculator.appendDigit()` |
| FR-04 | No leading zero | PRD §8 edge case | State Diagram | `Calculator.appendDigit()` |
| FR-05 | Operator dasar | PRD §4 UC3 | Use Case, Flowchart | `Calculator.setOperator()` |
| FR-06 | Simpan operand1 | PRD §6 state table | State Diagram | `Calculator.setOperator()` |
| FR-07 | Ganti operator | PRD §8 edge case | State Diagram | `Calculator.setOperator()` |
| FR-08 | Kalkulasi berantai | PRD §6 state table | State, Sequence | `Calculator.setOperator()` |
| FR-09 | Eksekusi `=` | PRD §4 UC4 | Sequence Diagram | `Calculator.calculate()` |
| FR-10 | Bagi nol → Error | PRD §8 edge case | Flowchart, State | `OperationRegistry.execute()` |
| FR-11 | Repeat `=` | PRD §8 edge case | State Diagram | `Calculator.calculate()` |
| FR-12 | Presisi float | PRD §8 edge case | — | `Calculator._exec()` |
| FR-13 | Notasi eksponensial | PRD §8 edge case | — | `Calculator._fmt()` |
| FR-14 | Reset `C` | PRD §4 UC5 | State, Flowchart | `Calculator.clear()` |
| FR-15 | Hapus `CE` | PRD §4 UC6 | State Diagram | `Calculator.clearEntry()` |
| FR-16 | `CE` tidak berlaku | PRD §6 state table | State Diagram | `Calculator.clearEntry()` |
| FR-17 | Keyboard mapping | PRD §4 UC7 | Use Case, Activity | `EventHandler.bindKeyboard()` |
| FR-18 | Visual feedback | PRD §4 UC7 | Wireframe | `EventHandler._flash()` |
| FR-19 | Update main display | PRD §5 Display | Wireframe, Sequence | `Display.render()` |
| FR-20 | Sub display ekspresi | PRD §5 Display | Wireframe | `Display.showExpression()` |
| FR-21 | Highlight operator | PRD Wireframe | Wireframe | `EventHandler._setActiveOp()` |
| FR-22 | Registry register | PRD §5 komponen | Class Diagram v2 | `OperationRegistry.register()` |
| FR-23 | Registry execute | PRD §5 komponen | Class, Sequence v2 | `OperationRegistry.execute()` |
| FR-24 | Daftar BasicOps | PRD §5 komponen | Component Diagram v2 | Bootstrap `DOMContentLoaded` |
| NFR-01 | Respon < 16ms | PRD §10 DoD | — | Vanilla JS, no framework |
| NFR-02 | Muat < 2 detik | PRD §10 DoD | — | Single file, no network |
| NFR-03 | Browser support | PRD §11 teknologi | — | ES6+ compatibility |
| NFR-04 | No dependency | PRD §2 tujuan | Component Diagram | Vanilla JS only |
| NFR-05 | No JS error | PRD §10 DoD | — | try/catch di `_exec()` |
| NFR-06 | State consistency | PRD §6 state | State Diagram | `STATES` constant |
| NFR-07 | Responsif | PRD §4 in-scope | Wireframe | CSS responsive |
| NFR-08 | ARIA | PRD §4 in-scope | Wireframe | `index.html` attributes |
| NFR-09 | Extensibility | PRD §2 prinsip | Class Diagram v2 | `OperationRegistry` |
| NFR-10 | Separation of concerns | PRD §2 prinsip | Class Diagram v2 | 4-class architecture |
| NFR-11 | URL publik EdgeOne | PRD v4.0 §6.1 | C4 Level 1 v2 | EdgeOne Pages deployment |
| NFR-12 | HTTPS otomatis | PRD v4.0 §6.1 | C4 Level 2 v2 | EdgeOne SSL auto |
| NFR-13 | CDN availability | PRD v4.0 §6.3 | C4 Level 2 v2 | EdgeOne edge network |
| NFR-14 | Offline setelah muat | PRD v4.0 §2 | — | Pure static, no API |

---

*Dokumen ini disiapkan berdasarkan PRD v4.0, 7 diagram arsitektur (Flowchart, Activity, Sequence, Class v2, State, Component v2, Use Case), wireframe berbasis state, dan implementasi kode yang telah diselesaikan. Setiap perubahan pada sistem yang mempengaruhi FR atau NFR di atas harus diikuti dengan pembaruan dokumen ini.*
