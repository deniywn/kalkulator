# arc42 — Dokumentasi Arsitektur Software
## Aplikasi Kalkulator Simple — Browser-Based JavaScript

---

| Atribut | Detail |
|---|---|
| Dokumen | arc42 Architecture Documentation |
| Versi | 2.0 |
| Tanggal | Maret 2026 |
| Status | Final — Production |
| Deployment Target | Tencent Cloud EdgeOne Pages |
| URL Produksi | https://[project].edgeone.app |
| Template | arc42 v8.x (https://arc42.org) |
| Dokumen terkait | PRD v3.0, SRS v1.0, 7 Diagram UML |

---

> **Catatan arc42:** Template ini mengikuti struktur resmi arc42 yang terdiri dari 12 bagian. Setiap bagian memiliki tujuan spesifik. Bagian yang tidak relevan untuk skala proyek ini ditandai dengan keterangan singkat, bukan dihapus, agar struktur tetap lengkap sebagai referensi pembelajaran.

---

## Daftar Isi

1. Pengantar dan Tujuan
2. Constraint
3. Scope dan Konteks Sistem
4. Strategi Solusi
5. Building Block View
6. Runtime View
7. Deployment View
8. Konsep Lintas-Potong
9. Keputusan Arsitektur (ADR)
10. Persyaratan Kualitas
11. Risiko dan Hutang Teknis
12. Glosarium

---

## 1. Pengantar dan Tujuan

### 1.1 Gambaran Sistem

Aplikasi Kalkulator Simple adalah aplikasi web yang berjalan sepenuhnya di browser tanpa ketergantungan pada server, API, atau jaringan. Aplikasi menyediakan empat operasi aritmatika dasar dengan arsitektur yang dapat diperluas untuk operasi yang lebih kompleks di masa mendatang.

Aplikasi ini dibangun dengan tujuan ganda: menyediakan kalkulator yang fungsional dan menjadi referensi pembelajaran arsitektur JavaScript yang bersih dan terstruktur.

### 1.2 Tujuan Kualitas

Tiga atribut kualitas paling penting yang mendorong keputusan arsitektur:

| Prioritas | Atribut Kualitas | Alasan |
|---|---|---|
| 1 | Extensibility | Arsitektur harus memungkinkan penambahan operasi baru tanpa mengubah komponen yang sudah ada |
| 2 | Understandability | Kode harus mudah dipelajari — setiap komponen memiliki satu tanggung jawab yang jelas |
| 3 | Reliability | Tidak ada crash pada kondisi normal maupun edge case (bagi nol, input ganda, dsb.) |

### 1.3 Stakeholder

| Stakeholder | Peran | Kepentingan Utama |
|---|---|---|
| Pengguna umum | Pemakai aplikasi | Kalkulator berjalan benar dan cepat |
| Developer pemula | Pelajar arsitektur | Kode mudah dibaca dan dipahami |
| Developer lanjutan | Kontributor masa depan | Bisa menambah fitur tanpa merusak yang ada |

---

## 2. Constraint

### 2.1 Constraint Teknis

| ID | Constraint | Asal |
|---|---|---|
| TC-01 | Hanya HTML5, CSS3, Vanilla JavaScript ES6+ | Keputusan desain — tidak boleh ada framework |
| TC-02 | Tidak ada server, API, atau database | PRD v3.0 §6 CON-02 |
| TC-03 | Harus berjalan offline setelah dimuat pertama | PRD v3.0 §6 CON-03 |
| TC-04 | Tidak ada library eksternal (jQuery, lodash, dsb.) | Keputusan desain — murni vanilla |
| TC-05 | Browser target: Chrome ≥115, Firefox ≥115, Safari ≥16, Edge ≥115 | SRS v1.0 NFR-03 |

### 2.2 Constraint Organisasi

| ID | Constraint | Asal |
|---|---|---|
| OC-01 | Proyek dikerjakan secara solo (satu developer) | Konteks proyek |
| OC-02 | Platform hosting: Tencent Cloud EdgeOne Pages Free Plan ($0/bulan) | Keputusan deployment |
| OC-03 | Dokumentasi harus lengkap sebagai referensi pembelajaran | Tujuan proyek |

### 2.3 Constraint Konvensi

| ID | Constraint |
|---|---|
| CV-01 | Penamaan komponen mengikuti Class Diagram v2 yang telah disepakati |
| CV-02 | Setiap operasi baru didaftarkan melalui `OperationRegistry.register()` — tidak boleh hardcode di `Calculator` |
| CV-03 | Struktur file mengikuti Component Diagram v2: `index.html`, `style.css`, `script.js`, `ops/*.js` |

---

## 3. Scope dan Konteks Sistem

### 3.1 Konteks Bisnis

Sistem berinteraksi hanya dengan satu aktor eksternal:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐        ┌─────────────────┐   │
│   │          │ klik / │                 │   │
│   │   User   │ ketik  │  Kalkulator     │   │
│   │          │───────▶│  Simple         │   │
│   │          │◀───────│                 │   │
│   └──────────┘ hasil  └─────────────────┘   │
│                                             │
│              Browser Runtime                │
└─────────────────────────────────────────────┘
```

Tidak ada sistem eksternal, API, database, atau layanan pihak ketiga yang terlibat. Semua proses terjadi di dalam browser user.

### 3.2 Konteks Teknis

| Interface | Protokol | Keterangan |
|---|---|---|
| User → UI | Mouse click / Keyboard event | Dihandle oleh `EventHandler` |
| UI → Logic | JavaScript function call | Dihandle di dalam `script.js` |
| Logic → Display | DOM manipulation | `Display.render()` menulis ke `#display-main` |
| Browser → EdgeOne | HTTPS (CDN edge) | Browser memuat file dari edge node EdgeOne terdekat |
| EdgeOne → Browser | HTTP/2 + TLS | EdgeOne melayani static file dari cache edge global |

---

## 4. Strategi Solusi

### 4.1 Keputusan Teknologi Utama

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Bahasa | Vanilla JavaScript ES6+ | Tidak ada overhead framework, mudah dipelajari |
| Paradigma | Object-Oriented (class-based) | Memungkinkan pemisahan tanggung jawab yang jelas |
| State Management | State machine eksplisit (6 state) | Perilaku tombol predictable di setiap kondisi |
| Extensibility | Registry pattern | Operasi baru ditambah tanpa modifikasi komponen lama |
| Rendering | DOM manipulation langsung | Tanpa virtual DOM, performa cukup untuk skala ini |

### 4.2 Prinsip Arsitektur yang Diterapkan

**Single Responsibility Principle (SRP)**
Setiap class memiliki tepat satu alasan untuk berubah:
- `OperationRegistry` berubah hanya jika cara menyimpan/memanggil operasi berubah
- `Calculator` berubah hanya jika logika state machine berubah
- `Display` berubah hanya jika cara menampilkan data ke layar berubah
- `EventHandler` berubah hanya jika cara menangkap input user berubah

**Open/Closed Principle (OCP)**
Sistem terbuka untuk ekstensi (tambah operasi baru) tapi tertutup untuk modifikasi (tidak perlu ubah `Calculator`). Ini dicapai melalui `OperationRegistry`.

**Dependency Injection**
`Calculator` menerima `registry` dan `display` sebagai parameter constructor — bukan membuat sendiri. Ini memungkinkan penggantian komponen di masa depan tanpa mengubah `Calculator`.

```javascript
// DI pattern: Calculator tidak buat sendiri, menerima dari luar
const calc = new Calculator(registry, display);
```

---

## 5. Building Block View

### 5.1 Level 1 — Whitebox Sistem Keseluruhan

```
┌─────────────────────────────────────────────────────────┐
│                  Kalkulator Simple                       │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ index.html  │  │  style.css  │  │   script.js     │  │
│  │             │  │             │  │                 │  │
│  │ Struktur UI │  │  Tampilan   │  │  Semua logika   │  │
│  │ & tombol    │  │  & layout   │  │  aplikasi       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                          │               │
│                                   ┌──────┴──────┐        │
│                                   │   ops/      │        │
│                                   │ basicOps.js │        │
│                                   └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Tanggung jawab masing-masing blok:**

| Blok | Tanggung Jawab | Interface |
|---|---|---|
| `index.html` | Struktur DOM, elemen tombol, link ke CSS dan JS | HTML elements dengan `data-action` dan `data-val` |
| `style.css` | Layout Grid, warna, tipografi, animasi, responsif | CSS class — tidak berinteraksi langsung dengan JS |
| `script.js` | Seluruh logika: 4 class + bootstrap | Mendefinisikan dan menginisialisasi semua komponen |
| `ops/basicOps.js` | Fungsi aritmatika murni | Objek `BasicOps` yang didaftarkan ke registry |

### 5.2 Level 2 — Whitebox script.js

Ini adalah level paling penting — isi dari `script.js` yang berisi empat class dengan tanggung jawab terpisah:

```
script.js
├── class OperationRegistry
│   ├── ops: Map<string, Function>
│   ├── register(name, fn)
│   ├── execute(name, a, b)
│   └── has(name)
│
├── class Display
│   ├── mainEl: HTMLElement (#display-main)
│   ├── subEl:  HTMLElement (#display-sub)
│   ├── render(val)
│   ├── showExpression(expr)
│   ├── flashResult()
│   └── showError(expr)
│
├── class Calculator
│   ├── registry: OperationRegistry  ← injected
│   ├── display:  Display            ← injected
│   ├── state: IDLE|INPUT_A|OPERATOR_SET|INPUT_B|RESULT|ERROR
│   ├── operand1, operand2, operator, inputStr
│   ├── appendDigit(digit)
│   ├── setOperator(op)
│   ├── calculate()
│   ├── clear()
│   └── clearEntry()
│
├── class EventHandler
│   ├── calc: Calculator  ← injected
│   ├── bindButtons()
│   ├── bindKeyboard()
│   ├── _handle(btn)
│   ├── _setActiveOp(btn)
│   ├── _flash(key)
│   └── _ripple(e)
│
└── Bootstrap (DOMContentLoaded)
    ├── new OperationRegistry()
    ├── registry.register('+', BasicOps.add)
    ├── registry.register('-', BasicOps.subtract)
    ├── registry.register('*', BasicOps.multiply)
    ├── registry.register('/', BasicOps.divide)
    ├── new Display()
    ├── new Calculator(registry, display)
    ├── new EventHandler(calc)
    ├── handler.bindButtons()
    └── handler.bindKeyboard()
```

**Hubungan antar komponen:**

| Dari | Ke | Jenis Hubungan |
|---|---|---|
| `EventHandler` | `Calculator` | Uses — memanggil method saat event terjadi |
| `Calculator` | `OperationRegistry` | Uses — mendelegasikan kalkulasi |
| `Calculator` | `Display` | Uses — memperbarui tampilan |
| `Bootstrap` | Semua class | Creates — membuat instance dan menyuntikkan dependency |

### 5.3 Level 3 — Whitebox OperationRegistry

Komponen ini layak didetailkan karena merupakan inti dari keputusan arsitektur skalabilitas:

```
OperationRegistry
│
├── Data: ops (Map)
│   ├── '+' → Function(a,b) => a+b         [dari BasicOps.add]
│   ├── '-' → Function(a,b) => a-b         [dari BasicOps.subtract]
│   ├── '*' → Function(a,b) => a*b         [dari BasicOps.multiply]
│   └── '/' → Function(a,b) => ...         [dari BasicOps.divide]
│
└── Behaviour
    ├── register(name, fn) — tambah entri ke Map
    ├── execute(name, a, b) — lookup + panggil fungsi
    └── has(name) — cek keberadaan operasi
```

**Jalur perluasan di masa mendatang:**
```
ops/
├── basicOps.js      ✓ ada — +  -  *  /
├── extendedOps.js   → akan tambah: %  mod  pow
└── trigOps.js       → akan tambah: sin  cos  tan  sqrt
```

Setiap file ops baru hanya perlu menambahkan baris `registry.register(...)` di Bootstrap. Tidak ada perubahan pada class lain.

---

## 6. Runtime View

### 6.1 Skenario: Inisialisasi Aplikasi

Urutan kejadian saat `index.html` pertama kali dibuka di browser:

```
Browser                 index.html          basicOps.js         script.js
   │                       │                    │                   │
   │──── muat file ────────▶│                   │                   │
   │                       │──── link CSS ─────▶│(style.css)        │
   │                       │──── script src ───────────────────────▶│
   │                       │        ┌───────────┤                   │
   │                       │        │ parse basicOps.js             │
   │                       │        └───────────┤                   │
   │                       │                    │                   │
   │◀──── DOMContentLoaded ─────────────────────────────────────────│
   │                                                                 │
   │         [Bootstrap berjalan]                                    │
   │         1. new OperationRegistry()                             │
   │         2. registry.register('+', BasicOps.add) × 4           │
   │         3. new Display()                                       │
   │         4. new Calculator(registry, display)                   │
   │         5. new EventHandler(calc)                              │
   │         6. handler.bindButtons() — pasang listener ke tombol   │
   │         7. handler.bindKeyboard() — pasang listener keyboard   │
   │                                                                 │
   │──── Siap digunakan ────────────────────────────────────────────▶│
```

### 6.2 Skenario: Kalkulasi Normal (8 + 3 =)

Urutan pemanggilan antar objek saat kalkulasi berjalan:

```
User    EventHandler    Calculator    OperationRegistry    Display
  │          │               │                │               │
  │─ klik 8 ─▶              │                │               │
  │          │─appendDigit('8')              │               │
  │          │               │─ inputStr='8' │               │
  │          │               │─────────────────────────────▶render('8')
  │          │               │                │               │
  │─ klik + ─▶              │                │               │
  │          │─setOperator('+')              │               │
  │          │               │─ operand1=8   │               │
  │          │               │─ state=OPERATOR_SET           │
  │          │               │─────────────────────────────▶showExpression('8 +')
  │          │               │                │               │
  │─ klik 3 ─▶              │                │               │
  │          │─appendDigit('3')              │               │
  │          │               │─ state=INPUT_B │               │
  │          │               │─────────────────────────────▶render('3')
  │          │               │                │               │
  │─ klik = ─▶              │                │               │
  │          │─calculate()   │                │               │
  │          │               │─execute('+',8,3)              │
  │          │               │                │─ fn(8,3)=11  │
  │          │               │◀──── return 11 ─              │
  │          │               │─ state=RESULT  │               │
  │          │               │─────────────────────────────▶showExpression('8 + 3 =')
  │          │               │─────────────────────────────▶render('11')
  │          │               │─────────────────────────────▶flashResult()
```

### 6.3 Skenario: Error — Bagi Nol (5 ÷ 0 =)

```
User    EventHandler    Calculator    OperationRegistry    Display
  │          │               │                │               │
  │ (5 dan ÷ sudah diinput)                   │               │
  │─ klik 0 ─▶─appendDigit('0')              │               │
  │─ klik = ─▶─calculate()   │                │               │
  │          │               │─execute('/',5,0)              │
  │          │               │                │─ throw Error  │
  │          │               │◀── catch Error ─              │
  │          │               │─ state=ERROR   │               │
  │          │               │─────────────────────────────▶showError('5 ÷ 0 =')
  │          │               │                │               │
  │ (semua tombol nonaktif kecuali C)         │               │
  │─ klik C ─▶─clear()       │                │               │
  │          │               │─ state=IDLE    │               │
  │          │               │─────────────────────────────▶render('0')
```

---

## 7. Deployment View

### 7.1 Infrastruktur

Sistem di-deploy ke **Tencent Cloud EdgeOne Pages** sebagai static site. Tidak ada server yang dikelola — EdgeOne menangani CDN, SSL, dan distribusi global secara otomatis.

```
Developer Machine           EdgeOne Pages              User's Browser
┌──────────────────┐        ┌──────────────────┐       ┌───────────────────────┐
│                  │        │                  │       │                       │
│  kalkulator/     │ deploy │  Edge Network    │ HTTPS │  Browser Runtime      │
│  ├── index.html  │───────▶│  Global CDN      │──────▶│  ├── HTML Parser      │
│  ├── style.css   │  git / │  ├── Edge Node   │       │  ├── CSS Engine       │
│  ├── script.js   │  CLI / │  │   Asia         │       │  ├── JS Engine (V8)   │
│  └── ops/        │  drop  │  ├── Edge Node   │       │  └── DOM              │
│      basicOps.js │        │  │   Europe       │       │                       │
└──────────────────┘        │  └── Edge Node   │       └───────────────────────┘
                            │      Americas    │
                            │                  │
                            │  SSL: auto HTTPS │
                            │  Domain: *.edgeone.app│
                            └──────────────────┘
```

### 7.2 Detail Platform

| Atribut | Detail |
|---|---|
| Platform | Tencent Cloud EdgeOne Pages |
| Plan | Free Plan — $0/bulan |
| URL | https://[project-name].edgeone.app |
| Custom Domain | Didukung — tambah CNAME record |
| SSL | Otomatis — Let's Encrypt via EdgeOne |
| CDN Nodes | Global — termasuk Asia, Europe, Americas |
| Availability SLA | 99.9% |
| Bandwidth | Unlimited (Free Plan) |
| Requests | Unlimited (Free Plan) |

### 7.3 Opsi Cara Deploy

| Cara | Deskripsi | Cocok untuk |
|---|---|---|
| **Pages Drop** | Upload file langsung di browser | Demo cepat, satu kali |
| **Git Integration** | Auto-deploy saat push ke GitHub/GitLab | Development aktif |
| **EdgeOne CLI** | `edgeone pages deploy ./kalkulator` | CI/CD pipeline |
| **Single File** | Upload `kalkulator.html` (semua embedded) | Distribusi paling sederhana |

### 7.4 Urutan Muat File di Browser

Urutan ini tidak berubah dari sebelumnya — yang berubah hanya *dari mana* file dimuat (EdgeOne CDN, bukan filesystem lokal):

```
1. Browser request https://[project].edgeone.app/
2. EdgeOne edge node melayani index.html dari cache
3. Browser parse HTML → request style.css, ops/basicOps.js, script.js
4. Semua file dilayani EdgeOne via HTTP/2 multiplexing
5. DOMContentLoaded → Bootstrap berjalan di browser
   └── Semua instance dibuat, event listener dipasang
   └── Kalkulator siap digunakan
```

### 7.5 Estimasi Biaya

| Skenario | User/bulan | Bandwidth | Biaya |
|---|---|---|---|
| Personal / belajar | < 100 | < 2 MB | **$0** |
| Tim kecil | < 1.000 | < 20 MB | **$0** |
| Publik sedang | < 10.000 | < 200 MB | **$0** |
| Publik besar | > 50.000 | > 1 GB | **$1.4/bulan** (Personal Plan) |

---

## 8. Konsep Lintas-Potong

Bagian ini mendokumentasikan konsep yang diterapkan secara konsisten di seluruh komponen.

### 8.1 Error Handling

**Strategi:** Semua error kalkulasi ditangkap di `Calculator._exec()` menggunakan `try/catch`. Error tidak pernah dibiarkan muncul di console browser.

```javascript
// Pola yang konsisten di seluruh aplikasi
try {
  let result = this.registry.execute(this.operator, a, b);
  // ... tampilkan hasil
} catch(e) {
  this.display.showError(expr);  // tampilkan ke user
  this.state = STATES.ERROR;     // masuk state ERROR
}
```

**Prinsip:** Error ditampilkan ke user dalam bahasa yang dimengerti ("Error"), bukan pesan teknis JavaScript.

### 8.2 State Management

**Strategi:** State machine eksplisit dengan enam state yang didefinisikan sebagai konstanta:

```javascript
const STATES = {
  IDLE, INPUT_A, OPERATOR_SET, INPUT_B, RESULT, ERROR
};
```

**Prinsip:** Tidak ada state implisit. Setiap transisi state terdokumentasi. Perilaku setiap tombol ditentukan oleh state saat ini — bukan oleh kondisi if-else yang tersebar.

### 8.3 Dependency Injection

**Strategi:** Semua dependency diinject melalui constructor, bukan dibuat di dalam class.

```javascript
// Calculator tidak tahu cara membuat Display atau Registry
// Dia hanya menerima keduanya dari luar
class Calculator {
  constructor(registry, display) {
    this.registry = registry;
    this.display  = display;
  }
}
```

**Manfaat:** Memudahkan penggantian komponen di masa depan. Misalnya, `Display` bisa diganti dengan implementasi lain (misal untuk unit testing) tanpa mengubah `Calculator`.

### 8.4 Event Handling

**Strategi:** Semua event binding dipusatkan di `EventHandler`. Tidak ada `onclick` inline di HTML, tidak ada event listener yang tersebar di berbagai tempat.

```javascript
// Semua binding dilakukan satu tempat
handler.bindButtons();    // semua tombol
handler.bindKeyboard();   // seluruh keyboard
```

**HTML hanya berisi data attributes — tidak ada logika:**
```html
<button data-action="operator" data-val="+">+</button>
```

### 8.5 Floating Point

**Masalah:** JavaScript menggunakan IEEE 754 yang menghasilkan `0.1 + 0.2 = 0.30000000000000004`.

**Strategi:** Hasil dibulatkan dengan `toPrecision(12)` sebelum ditampilkan.

```javascript
result = parseFloat(result.toPrecision(12));
// 0.30000000000000004 → 0.3
```

**Trade-off:** Akurasi dibatasi 12 digit signifikan. Untuk kalkulator dasar ini sudah lebih dari cukup.

### 8.6 Visual Feedback

**Strategi:** Setiap interaksi memberikan feedback visual:
- Klik tombol → efek ripple
- Tekan keyboard → highlight tombol yang bersesuaian
- Operator aktif → highlight persisten hingga `=` atau `C`
- Hasil kalkulasi → animasi flash pada display

**Implementasi:** CSS animation (`@keyframes flash-in`) + JavaScript class manipulation.

---

## 9. Keputusan Arsitektur (ADR)

Ini adalah bagian yang paling membedakan arc42 dari PRD dan SRS. Setiap keputusan penting didokumentasikan beserta konteks, alternatif yang dipertimbangkan, dan alasan pemilihan.

---

### ADR-01: Gunakan OperationRegistry sebagai Layer Terpisah

**Status:** Diterima

**Konteks:**
Kalkulator membutuhkan empat operasi dasar saat ini, dengan kemungkinan penambahan operasi lanjutan (persen, modulus, trigonometri) di masa mendatang. Pertanyaannya: di mana logika kalkulasi ditempatkan?

**Alternatif yang dipertimbangkan:**

*Alternatif A — If-else langsung di Calculator:*
```javascript
calculate() {
  if (op==='+') return a+b;
  if (op==='-') return a-b;
  // dst...
}
```
Ditolak karena: setiap penambahan operasi membutuhkan modifikasi `Calculator`, melanggar Open/Closed Principle, dan meningkatkan risiko regresi.

*Alternatif B — Switch-case di Calculator:*
Sama dengan Alternatif A, hanya sintaks berbeda. Ditolak dengan alasan sama.

*Alternatif C — OperationRegistry (yang dipilih):*
```javascript
registry.register('+', BasicOps.add);
// Calculator cukup: registry.execute(op, a, b)
```

**Keputusan:** Alternatif C dipilih.

**Konsekuensi positif:** Penambahan operasi baru tidak menyentuh `Calculator`. Setiap set operasi bisa diuji secara independen. Arsitektur jelas — "semua operasi masuk registry."

**Konsekuensi negatif:** Menambah satu layer abstraksi yang mungkin terasa berlebihan untuk kalkulator sederhana. Pemula perlu memahami konsep registry sebelum bisa membaca alur kalkulasi secara penuh.

---

### ADR-02: Vanilla JavaScript — Tanpa Framework

**Status:** Diterima

**Konteks:**
Pilihan teknologi awal untuk aplikasi browser.

**Alternatif yang dipertimbangkan:**

*Alternatif A — React:*
Ditolak karena: overhead dependency yang besar untuk ukuran aplikasi ini, menambah kurva belajar, dan tidak sesuai dengan tujuan pembelajaran JavaScript murni.

*Alternatif B — Vue.js:*
Ditolak dengan alasan serupa — dependency eksternal tidak diperlukan untuk aplikasi skala ini.

*Alternatif C — Vanilla JavaScript ES6+ (yang dipilih):*
Tidak ada dependency, bisa dibuka langsung sebagai file HTML, dan semua fitur yang dibutuhkan (class, Map, event listener, DOM) sudah tersedia secara native.

**Keputusan:** Vanilla JavaScript.

**Konsekuensi:** Tidak ada hot reload, tidak ada state management library, tidak ada component tree. Semua harus diimplementasikan manual — yang justru menjadi nilai pembelajaran.

---

### ADR-03: State Machine Eksplisit dengan Enam State

**Status:** Diterima

**Konteks:**
Perilaku tombol kalkulator bergantung pada konteks — tombol CE di state IDLE berbeda dengan di state INPUT_B. Bagaimana cara mengelola ini?

**Alternatif yang dipertimbangkan:**

*Alternatif A — Boolean flags:*
```javascript
this.hasOperand1 = false;
this.hasOperator = false;
this.isError = false;
// dst...
```
Ditolak karena: kombinasi boolean menciptakan state implisit yang sulit dilacak. Dengan 4 boolean saja sudah ada 16 kombinasi possible, banyak di antaranya tidak valid.

*Alternatif B — State machine eksplisit (yang dipilih):*
```javascript
const STATES = { IDLE, INPUT_A, OPERATOR_SET, INPUT_B, RESULT, ERROR };
this.state = STATES.IDLE;
```

**Keputusan:** State machine eksplisit.

**Konsekuensi positif:** Perilaku sistem predictable dan terdokumentasi. Tabel transisi state bisa dibuat dan diverifikasi. Debugging lebih mudah — cukup cek `this.state`.

**Konsekuensi negatif:** Menambah kode untuk setiap transisi state. Developer baru harus memahami konsep state machine terlebih dahulu.

---

### ADR-04: Dependency Injection via Constructor

**Status:** Diterima

**Konteks:**
`Calculator` membutuhkan `OperationRegistry` dan `Display`. Bagaimana cara menyediakannya?

**Alternatif yang dipertimbangkan:**

*Alternatif A — Buat sendiri di dalam Calculator:*
```javascript
class Calculator {
  constructor() {
    this.registry = new OperationRegistry(); // tightly coupled
    this.display  = new Display();           // tightly coupled
  }
}
```
Ditolak karena: `Calculator` menjadi tightly coupled dengan implementasi spesifik. Tidak bisa diganti tanpa mengubah `Calculator`.

*Alternatif B — Global variable:*
```javascript
const registry = new OperationRegistry();
// Calculator mengakses registry sebagai global
```
Ditolak karena: global state sulit dilacak dan rentan konflik nama.

*Alternatif C — Dependency Injection via constructor (yang dipilih):*
```javascript
const calc = new Calculator(registry, display);
```

**Keputusan:** DI via constructor.

**Konsekuensi positif:** `Calculator` tidak tahu implementasi spesifik komponen yang digunakannya. Mudah diganti untuk testing atau variasi di masa depan.

**Konsekuensi negatif:** Bootstrap menjadi sedikit lebih verbose karena harus membuat semua instance secara eksplisit sebelum menyuntikkannya.

---

### ADR-05: ops/ sebagai File Terpisah, Dimuat via `<script>`

**Status:** Diterima

**Konteks:**
Operasi aritmatika bisa diletakkan inline di `script.js` atau di file terpisah. Cara memuat file terpisah juga bisa menggunakan ES Module (`import/export`) atau tag `<script>` biasa.

**Alternatif yang dipertimbangkan:**

*Alternatif A — Inline di script.js:*
```javascript
registry.register('+', (a,b) => a+b);
```
Dipertahankan sebagai fallback — kalkulator.html (single file) menggunakan ini.

*Alternatif B — ES Module dengan import/export:*
```javascript
import BasicOps from './ops/basicOps.js';
```
Membutuhkan server HTTP (tidak bisa dibuka sebagai `file://`) karena CORS policy browser memblokir ES Module dari `file://`. Ditolak untuk versi multi-file agar tetap bisa dibuka langsung dari filesystem.

*Alternatif C — File terpisah dimuat via `<script>` biasa (yang dipilih):*
```html
<script src="ops/basicOps.js"></script>  <!-- BasicOps jadi global -->
<script src="script.js"></script>
```

**Keputusan:** `<script>` biasa dengan urutan loading yang terkontrol.

**Konsekuensi positif:** Bisa dibuka langsung sebagai file HTML tanpa server. Pola penambahan operasi baru konsisten dan mudah diikuti.

**Konsekuensi negatif:** `BasicOps` menjadi variabel global — bukan module yang terisolasi. Pada proyek besar ini tidak ideal, tapi untuk skala ini dapat diterima.

---

### ADR-06: Single File vs Multi-File — Dua Versi Disediakan

**Status:** Diterima

**Konteks:**
Apakah output akhir berupa satu file HTML atau beberapa file terpisah?

**Keputusan:** Keduanya disediakan:
- `kalkulator.html` — single file, CSS dan JS embedded, untuk kemudahan berbagi
- `kalkulator-project/` — multi-file, sesuai arsitektur yang didesain, untuk pembelajaran

**Konsekuensi:** Perlu memastikan keduanya konsisten saat ada perubahan.


---

### ADR-07: Deployment ke Tencent Cloud EdgeOne Pages

**Status:** Diterima

**Konteks:**
Setelah aplikasi selesai dikembangkan secara lokal, dibutuhkan platform hosting yang dapat membuat kalkulator diakses secara publik via URL. Aplikasi ini adalah pure static site (HTML + CSS + JS, 17–20 KB total) tanpa server-side logic.

**Alternatif yang dipertimbangkan:**

*Alternatif A — File lokal (file://):*
Buka `index.html` langsung di browser. Tidak perlu hosting apapun.
Ditolak untuk production karena: tidak punya URL publik yang bisa dibagikan, tidak mendukung HTTPS, tidak bisa diakses orang lain.

*Alternatif B — GitHub Pages:*
Push ke GitHub repo, aktifkan Pages.
Layak, tapi proses setup lebih panjang dan membutuhkan akun GitHub.

*Alternatif C — Netlify / Vercel:*
Upload atau connect Git repo.
Layak, performa baik, tapi bukan pilihan utama untuk demo ini.

*Alternatif D — Tencent Cloud EdgeOne Pages (yang dipilih):*
Upload langsung via Pages Drop (`pages.edgeone.ai/drop`) atau CLI.
Free Plan permanent, unlimited bandwidth, auto HTTPS, global CDN termasuk coverage Asia yang baik, zero konfigurasi server.

**Keputusan:** Alternatif D dipilih.

**Konsekuensi positif:**
- URL publik tersedia dalam hitungan menit
- HTTPS otomatis tanpa konfigurasi
- CDN global — latensi rendah dari berbagai lokasi
- Biaya $0 untuk semua skenario penggunaan normal
- Tidak ada server yang perlu dikelola

**Konsekuensi negatif:**
- Dependency pada platform pihak ketiga (Tencent Cloud)
- Jika EdgeOne mengubah kebijakan Free Plan, perlu migrasi ke platform lain
- URL default `*.edgeone.app` — butuh langkah tambahan untuk custom domain

---

## 10. Persyaratan Kualitas

### 10.1 Pohon Kualitas (Quality Tree)

```
Kualitas Sistem
│
├── Extensibility (prioritas 1)
│   ├── Operasi baru: tambah file + 1 baris register, tidak ubah Calculator
│   └── Komponen baru: DI pattern memudahkan penggantian
│
├── Understandability (prioritas 2)
│   ├── Setiap class: satu tanggung jawab, nama deskriptif
│   ├── State machine: perilaku sistem terdokumentasi dan predictable
│   └── Kode: bisa dibaca tanpa pengetahuan framework
│
├── Reliability (prioritas 3)
│   ├── Error handling: semua edge case ditangkap
│   ├── State consistency: tidak ada state tak terdefinisi
│   └── Floating point: dibulatkan sebelum ditampilkan
│
└── Performance
    ├── Waktu respon: < 16ms (browser native, no framework overhead)
    └── Waktu muat: < 2 detik dari EdgeOne CDN (broadband connection)
```

### 10.2 Skenario Kualitas

| ID | Skenario | Stimulus | Respons yang Diharapkan | Terukur? |
|---|---|---|---|---|
| QS-01 | Tambah operasi persen | Developer buat `extendedOps.js` dan daftar ke registry | Tidak ada perubahan pada `Calculator`, `Display`, `EventHandler` | Ya — cek git diff |
| QS-02 | Input bagi nol | User menekan `5 ÷ 0 =` | Display menampilkan "Error", hanya `C` aktif, tidak ada JS error di console | Ya |
| QS-03 | Floating point | User menekan `0.1 + 0.2 =` | Display menampilkan `0.3` bukan `0.30000000000000004` | Ya |
| QS-04 | Keyboard input | Developer baru membaca kode | Semua keyboard binding ditemukan di satu tempat (`EventHandler.bindKeyboard`) | Ya — review kode |
| QS-05 | Performa respon | User klik tombol | Visual berubah dalam 1 frame (16ms) | Ya — browser DevTools |

---

## 11. Risiko dan Hutang Teknis

### 11.1 Risiko

| ID | Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|---|
| R-01 | BasicOps.js tidak termuat sebelum script.js | Rendah | Tinggi — BasicOps undefined | Urutan `<script>` di index.html sudah benar; tambahkan pengecekan di bootstrap jika perlu |
| R-02 | Floating point edge case yang tidak tertangkap | Rendah | Rendah — kalkulator dasar | `toPrecision(12)` menangani kasus umum; kalkulator ilmiah butuh library khusus |
| R-03 | Browser lama tidak mendukung ES6 class | Sangat rendah | Tinggi | Constraint NFR-03 sudah menetapkan minimum browser version |
| R-04 | EdgeOne mengubah kebijakan Free Plan | Rendah | Rendah | Migrasi ke Netlify/Vercel/GitHub Pages bisa dilakukan dalam < 1 jam |

### 11.2 Hutang Teknis

| ID | Deskripsi | Dampak jika Tidak Diselesaikan | Prioritas |
|---|---|---|---|
| TD-01 | Bootstrap tidak ada di Component Diagram | Diagram tidak akurat 100% terhadap implementasi | Rendah |
| TD-02 | Tidak ada unit test otomatis (Jest, dsb.) | Regresi harus dideteksi manual | Sedang |
| TD-03 | `BasicOps` sebagai global variable (bukan module) | Konflik nama jika proyek berkembang besar | Rendah saat ini |
| TD-04 | Single-file (`kalkulator.html`) dan multi-file harus disinkronkan manual | Inkonsistensi jika ada perubahan | Rendah — bisa diatasi dengan build script |
| TD-05 | Tidak ada hi-fi mockup — wireframe langsung ke kode | Tidak ada validasi desain visual sebelum implementasi | Rendah — untuk proyek solo |

---

## 12. Glosarium

| Istilah | Definisi |
|---|---|
| ADR | Architecture Decision Record — catatan satu keputusan arsitektur beserta konteks dan alasannya |
| arc42 | Template dokumentasi arsitektur software yang terdiri dari 12 bagian terstruktur |
| Bootstrap | Blok inisialisasi di `DOMContentLoaded` yang membuat semua instance dan menyuntikkan dependency |
| C4 Model | Metode visualisasi arsitektur dalam 4 level: Context, Container, Component, Code |
| Dependency Injection | Pola desain di mana dependency disuntikkan dari luar, bukan dibuat di dalam class |
| DOM | Document Object Model — representasi HTML sebagai pohon objek yang bisa dimanipulasi JavaScript |
| ES6+ | ECMAScript 2015 dan versi sesudahnya — standar JavaScript modern dengan fitur `class`, `Map`, `const`, `let`, arrow function, dsb. |
| IEEE 754 | Standar representasi bilangan floating point yang digunakan JavaScript — penyebab `0.1 + 0.2 ≠ 0.3` |
| OCP | Open/Closed Principle — kode terbuka untuk ekstensi, tertutup untuk modifikasi |
| OperationRegistry | Class yang menyimpan pemetaan nama operasi ke fungsi dan mengeksekusinya atas permintaan |
| SRP | Single Responsibility Principle — setiap class/module memiliki tepat satu alasan untuk berubah |
| State Machine | Model komputasi di mana sistem selalu berada dalam satu dari sekumpulan state yang terdefinisi, dengan transisi yang terdokumentasi |
| Vanilla JavaScript | JavaScript murni tanpa framework atau library eksternal |
| Whitebox | Pandangan arsitektur yang memperlihatkan isi internal suatu komponen |

---

*Dokumen ini disiapkan berdasarkan PRD v3.0, SRS v1.0, 7 diagram UML, dan kode implementasi aktual. arc42 melengkapi kedua dokumen sebelumnya dengan mendokumentasikan MENGAPA keputusan arsitektur diambil — dimensi yang tidak tercakup di PRD (fokus pada kebutuhan produk) maupun SRS (fokus pada spesifikasi teknis).*
