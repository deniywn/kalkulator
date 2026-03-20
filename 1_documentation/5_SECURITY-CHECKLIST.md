# Security Checklist — Sebelum Git Push & Deploy EdgeOne

## Cara Pakai

Centang setiap item sebelum `git push`. Item yang bertanda **BLOCKER** harus selesai sebelum push.

---

## Bagian 1 — Kode (lakukan sekali sebelum push pertama)

### 1.1 Tidak ada secrets di kode

- [ ] **[BLOCKER]** Tidak ada API key, token, password di file `.js`, `.html`, `.css`
- [ ] **[BLOCKER]** Tidak ada hardcoded credential (username/password apapun)
- [ ] **[BLOCKER]** Tidak ada URL internal yang sensitif (IP server internal, endpoint private)
- [ ] File `.env` tidak ada di repo — sudah masuk `.gitignore`

> Untuk kalkulator ini: semua poin di atas sudah aman karena tidak ada backend.

### 1.2 Tidak ada kode berbahaya

- [ ] Tidak ada `eval()` di seluruh kode JavaScript
- [ ] Semua manipulasi DOM menggunakan `textContent`, bukan `innerHTML`
- [ ] Tidak ada `document.write()`
- [ ] Tidak ada `dangerouslySetInnerHTML` (jika React)

> Untuk kalkulator ini: semua poin sudah aman — audit telah dikonfirmasi.

### 1.3 Dependency

- [ ] Tidak ada `node_modules/` di commit (sudah di `.gitignore`)
- [ ] Jika ada `package.json`: jalankan `npm audit` dan tidak ada vulnerability HIGH/CRITICAL

> Untuk kalkulator ini: tidak ada dependency eksternal sama sekali.

---

## Bagian 2 — File Git

### 2.1 .gitignore sudah ada dan benar

- [ ] **[BLOCKER]** File `.gitignore` sudah ada di root repo
- [ ] `.env`, `.env.local`, `.env.production` sudah terdaftar di `.gitignore`
- [ ] `node_modules/` sudah di `.gitignore`
- [ ] File editor (`.vscode/`, `.idea/`) sudah di `.gitignore`
- [ ] File OS (`.DS_Store`, `Thumbs.db`) sudah di `.gitignore`

### 2.2 Verifikasi sebelum commit

Jalankan perintah ini untuk memastikan tidak ada file sensitif yang ikut ter-commit:

```bash
# Lihat semua file yang akan di-commit
git status

# Lihat diff semua perubahan
git diff --staged

# Cari pola berbahaya di seluruh staged files
git diff --staged | grep -i "password\|secret\|api_key\|token\|credential"
```

---

## Bagian 3 — Repository GitHub/GitLab

### 3.1 Visibilitas repo

- [ ] **[Putuskan sadar]** Repo **Public** atau **Private**?

| Pilihan | Implikasi |
|---|---|
| **Public** | Kode bisa dilihat siapa saja. Aman untuk kalkulator ini — tidak ada secrets. Lebih mudah untuk EdgeOne Git integration. |
| **Private** | Kode hanya terlihat oleh Anda. Perlu authorize EdgeOne untuk akses repo saat setup Git integration. |

> Untuk kalkulator ini: **Public aman** karena tidak ada secrets apapun di kode.

### 3.2 Branch protection (opsional, tapi baik untuk kebiasaan)

Jika repo Public dan ingin cegah push langsung ke `main`:
```
GitHub → Settings → Branches → Add rule → main
Centang: "Require pull request before merging"
```

### 3.3 GitHub Secrets (hanya jika pakai CI/CD Actions)

- [ ] Token, API key, dan credential deployment **tidak pernah** ditulis langsung di file `.yml`
- [ ] Semua credential disimpan di `Settings → Secrets and variables → Actions`

Contoh yang **BENAR** di GitHub Actions:
```yaml
# BENAR: ambil dari GitHub Secrets
- name: Deploy
  env:
    EDGEONE_TOKEN: ${{ secrets.EDGEONE_TOKEN }}
```

Contoh yang **SALAH**:
```yaml
# SALAH: credential hardcoded di file
- name: Deploy
  env:
    EDGEONE_TOKEN: "eyJhbGciOiJSUzI1NiJ9..."  # JANGAN PERNAH!
```

---

## Bagian 4 — EdgeOne Deployment

### 4.1 Jika deploy via Git Integration

- [ ] EdgeOne hanya diberikan akses **read** ke repo (bukan write)
- [ ] Token EdgeOne disimpan di GitHub Secrets, bukan di file kode
- [ ] Branch yang di-deploy adalah `main` (bukan development branch)

### 4.2 Verifikasi setelah deploy

- [ ] URL `https://[project].edgeone.app` dapat diakses (TC-F-01)
- [ ] HTTPS aktif — ikon gembok terlihat (TC-F-02)
- [ ] Buka DevTools → Network: tidak ada error 404 untuk file apapun (TC-F-05)
- [ ] Buka DevTools → Console: tidak ada error merah (TC-C-05)

---

## Bagian 5 — Content Security Policy

### 5.1 Verifikasi CSP sudah ada di index.html

```bash
grep "Content-Security-Policy" index.html
```

Expected output:
```
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; ..."/>
```

### 5.2 Test CSP di browser

Setelah deploy:
1. Buka DevTools → Console
2. Coba jalankan di console: `fetch('https://evil.com')`
3. Expected: error `Refused to connect` karena `connect-src 'none'`

---

## Ringkasan Status untuk Kalkulator Ini

| Item | Status |
|---|---|
| Secrets di kode | Tidak ada — aman |
| innerHTML / eval | Tidak dipakai — aman |
| Dependency eksternal | Tidak ada — aman |
| .gitignore | Sudah dibuat |
| README.md | Sudah dibuat |
| CSP header | Sudah ditambahkan ke index.html |
| Visibilitas repo | **Putuskan sendiri** (Public direkomendasikan untuk proyek ini) |
| Branch protection | Opsional |
| GitHub Secrets | Perlu disiapkan jika pakai CI/CD |
