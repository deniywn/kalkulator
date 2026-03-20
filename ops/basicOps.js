// BasicOps: fungsi operasi aritmatika dasar
// File ini didaftarkan ke OperationRegistry saat bootstrap di script.js
// Untuk menambah operasi baru: buat file baru di ops/, daftarkan dengan cara yang sama

const BasicOps = {
  add:      (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide:   (a, b) => {
    if (b === 0) throw new Error('DIVISION_BY_ZERO');
    return a / b;
  },
};
