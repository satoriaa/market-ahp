/*
 * GIS-DSS AHP SUPERMARKET JAKARTA BARAT
 * File: app.js
 *
 * Catatan:
 * - Data kecamatan, kelurahan, dan kandidat dipertahankan dari file awal.
 * - Bobot AHP dihitung dengan Principal Eigenvector (Power Iteration).
 * - WLC memakai skor kriteria skala 1-5 yang tersedia pada dataset.
 * - Skor spasial dan titik kandidat masih simulasi, belum berasal dari analisis GIS aktual.
 * - Buffer 1,5 km adalah radius geometris, bukan waktu tempuh atau jangkauan jaringan jalan.
 */

// 1. KRITERIA AHP
const CRITERIA = [
  { id: 'C1', name: 'Kepadatan Penduduk', short: 'C1: Kepadatan' },
  { id: 'C2', name: 'Aksesibilitas Jaringan Jalan', short: 'C2: Akses Jalan' },
  { id: 'C3', name: 'Kedekatan Permukiman', short: 'C3: Permukiman' },
  { id: 'C4', name: 'Jarak thd Kompetitor', short: 'C4: Kompetitor' },
  { id: 'C5', name: 'Kesesuaian Zonasi RDTR', short: 'C5: Zonasi RDTR' }
];

// Matriks perbandingan berpasangan default.
const DEFAULT_MATRIX = [
  [1,    2,   3,   3,   4],
  [0.5,  1,   2,   2,   3],
  [1/3,  0.5, 1,   1,   2],
  [1/3,  0.5, 1,   1,   2],
  [0.25, 1/3, 0.5, 0.5, 1]
];

// Salin matriks default agar data awal tidak berubah.
let currentMatrix = JSON.parse(JSON.stringify(DEFAULT_MATRIX));


// 2. DATA KECAMATAN
const KECAMATAN_DATA = [
  {
    name: 'Cengkareng',
    lat: -6.1489,
    lng: 106.7351,
    areaKm2: 26.54,
    population: 582026,
    minimarkets: 111,
    c1_density: 4.5,
    c2_road: 4.6,
    c3_residential: 4.7,
    c4_competitor: 3.1,
    c5_zoning: 4.5,
    roadNote: 'Jl. Daan Mogot & Tol JORR W1'
  },
  {
    name: 'Kalideres',
    lat: -6.1415,
    lng: 106.7012,
    areaKm2: 30.23,
    population: 464180,
    minimarkets: 81,
    c1_density: 3.8,
    c2_road: 4.2,
    c3_residential: 4.6,
    c4_competitor: 3.8,
    c5_zoning: 4.3,
    roadNote: 'Jl. Peta Selatan & Jl. Daan Mogot'
  },
  {
    name: 'Kebon Jeruk',
    lat: -6.1912,
    lng: 106.7689,
    areaKm2: 17.98,
    population: 362856,
    minimarkets: 84,
    c1_density: 4.3,
    c2_road: 4.8,
    c3_residential: 4.5,
    c4_competitor: 3.5,
    c5_zoning: 4.6,
    roadNote: 'Jl. Panjang & Tol Jakarta-Tangerang'
  },
  {
    name: 'Kembangan',
    lat: -6.1885,
    lng: 106.7385,
    areaKm2: 24.16,
    population: 311464,
    minimarkets: 86,
    c1_density: 3.4,
    c2_road: 4.9,
    c3_residential: 4.4,
    c4_competitor: 3.4,
    c5_zoning: 4.8,
    roadNote: 'Jl. Puri Indah Raya & JORR W2'
  },
  {
    name: 'Tambora',
    lat: -6.1462,
    lng: 106.8015,
    areaKm2: 5.40,
    population: 258155,
    minimarkets: 64,
    c1_density: 5.0,
    c2_road: 3.4,
    c3_residential: 4.8,
    c4_competitor: 3.7,
    c5_zoning: 3.3,
    roadNote: 'Jl. KH Moh. Mansyur & Jl. Latumeten'
  },
  {
    name: 'Grogol Petamburan',
    lat: -6.1668,
    lng: 106.7885,
    areaKm2: 9.99,
    population: 230458,
    minimarkets: 85,
    c1_density: 4.6,
    c2_road: 4.7,
    c3_residential: 4.1,
    c4_competitor: 2.8,
    c5_zoning: 4.7,
    roadNote: 'Jl. Letjen S. Parman & Jl. Kyai Tapa'
  },
  {
    name: 'Palmerah',
    lat: -6.1951,
    lng: 106.7945,
    areaKm2: 7.51,
    population: 225956,
    minimarkets: 57,
    c1_density: 4.8,
    c2_road: 4.1,
    c3_residential: 4.3,
    c4_competitor: 3.9,
    c5_zoning: 3.8,
    roadNote: 'Jl. Palmerah Barat & Jl. Kemanggisan Raya'
  },
  {
    name: 'Taman Sari',
    lat: -6.1475,
    lng: 106.8185,
    areaKm2: 7.73,
    population: 123069,
    minimarkets: 69,
    c1_density: 3.7,
    c2_road: 4.0,
    c3_residential: 3.6,
    c4_competitor: 3.0,
    c5_zoning: 4.4,
    roadNote: 'Jl. Gajah Mada & Jl. Hayam Wuruk'
  }
];


// 3. DATA 56 KELURAHAN
const KELURAHAN_DATA = [
  { kec: 'Kembangan', kel: 'Joglo', l: 25791, p: 26093, t: 51884 },
  { kec: 'Kembangan', kel: 'Srengseng', l: 29034, p: 29014, t: 58048 },
  { kec: 'Kembangan', kel: 'Meruya Selatan', l: 21171, p: 21099, t: 42270 },
  { kec: 'Kembangan', kel: 'Meruya Utara', l: 27666, p: 27751, t: 55417 },
  { kec: 'Kembangan', kel: 'Kembangan Selatan', l: 16919, p: 17102, t: 34021 },
  { kec: 'Kembangan', kel: 'Kembangan Utara', l: 35242, p: 34582, t: 69824 },

  { kec: 'Kebon Jeruk', kel: 'Sukabumi Selatan', l: 23486, p: 23063, t: 46549 },
  { kec: 'Kebon Jeruk', kel: 'Sukabumi Utara', l: 24258, p: 24295, t: 48553 },
  { kec: 'Kebon Jeruk', kel: 'Kelapa Dua', l: 14727, p: 14772, t: 29499 },
  { kec: 'Kebon Jeruk', kel: 'Kebon Jeruk', l: 34681, p: 34651, t: 69332 },
  { kec: 'Kebon Jeruk', kel: 'Duri Kepa', l: 37743, p: 38262, t: 76005 },
  { kec: 'Kebon Jeruk', kel: 'Kedoya Selatan', l: 20165, p: 20105, t: 40270 },
  { kec: 'Kebon Jeruk', kel: 'Kedoya Utara', l: 26314, p: 26334, t: 52648 },

  { kec: 'Palmerah', kel: 'Palmerah', l: 38610, p: 37922, t: 76532 },
  { kec: 'Palmerah', kel: 'Slipi', l: 10070, p: 9904, t: 19974 },
  { kec: 'Palmerah', kel: 'Kemanggisan', l: 19051, p: 19035, t: 38086 },
  { kec: 'Palmerah', kel: 'Kota Bambu Utara', l: 15294, p: 15002, t: 30296 },
  { kec: 'Palmerah', kel: 'Kota Bambu Selatan', l: 13513, p: 13127, t: 26640 },
  { kec: 'Palmerah', kel: 'Jati Pulo', l: 17331, p: 17097, t: 34428 },

  { kec: 'Grogol Petamburan', kel: 'Tomang', l: 17205, p: 17756, t: 34961 },
  { kec: 'Grogol Petamburan', kel: 'Grogol', l: 9633, p: 9974, t: 19607 },
  { kec: 'Grogol Petamburan', kel: 'Jelambar', l: 16944, p: 17330, t: 34274 },
  { kec: 'Grogol Petamburan', kel: 'Jelambar Baru', l: 21527, p: 22014, t: 43541 },
  { kec: 'Grogol Petamburan', kel: 'Wijaya Kusuma', l: 23764, p: 23714, t: 47478 },
  { kec: 'Grogol Petamburan', kel: 'Tanjung Duren Utara', l: 10202, p: 10443, t: 20645 },
  { kec: 'Grogol Petamburan', kel: 'Tanjung Duren Selatan', l: 14789, p: 15163, t: 29952 },

  { kec: 'Tambora', kel: 'Tanah Sereal', l: 14460, p: 14357, t: 28817 },
  { kec: 'Tambora', kel: 'Tambora', l: 6168, p: 6048, t: 12216 },
  { kec: 'Tambora', kel: 'Roa Malaka', l: 2059, p: 2028, t: 4087 },
  { kec: 'Tambora', kel: 'Pekojan', l: 13352, p: 13007, t: 26359 },
  { kec: 'Tambora', kel: 'Jembatan Lima', l: 12554, p: 12169, t: 24723 },
  { kec: 'Tambora', kel: 'Krendang', l: 12595, p: 12002, t: 24597 },
  { kec: 'Tambora', kel: 'Duri Utara', l: 11798, p: 11430, t: 23228 },
  { kec: 'Tambora', kel: 'Duri Selatan', l: 8165, p: 7946, t: 16111 },
  { kec: 'Tambora', kel: 'Kalianyar', l: 14408, p: 13844, t: 28252 },
  { kec: 'Tambora', kel: 'Jembatan Besi', l: 17565, p: 16890, t: 34455 },
  { kec: 'Tambora', kel: 'Angke', l: 17825, p: 17485, t: 35310 },

  { kec: 'Taman Sari', kel: 'Pinangsia', l: 6067, p: 6155, t: 12222 },
  { kec: 'Taman Sari', kel: 'Glodok', l: 4326, p: 4416, t: 8742 },
  { kec: 'Taman Sari', kel: 'Keagungan', l: 10045, p: 10051, t: 20096 },
  { kec: 'Taman Sari', kel: 'Krukut', l: 11417, p: 11431, t: 22848 },
  { kec: 'Taman Sari', kel: 'Taman Sari', l: 8343, p: 8384, t: 16727 },
  { kec: 'Taman Sari', kel: 'Maphar', l: 9282, p: 9377, t: 18659 },
  { kec: 'Taman Sari', kel: 'Tangki', l: 7490, p: 7378, t: 14868 },
  { kec: 'Taman Sari', kel: 'Mangga Besar', l: 4422, p: 4485, t: 8907 },

  { kec: 'Cengkareng', kel: 'Kedaung Kali Angke', l: 21479, p: 20856, t: 42335 },
  { kec: 'Cengkareng', kel: 'Kapuk', l: 89919, p: 86646, t: 176565 },
  { kec: 'Cengkareng', kel: 'Cengkareng Barat', l: 42212, p: 41483, t: 83695 },
  { kec: 'Cengkareng', kel: 'Cengkareng Timur', l: 53042, p: 52125, t: 105167 },
  { kec: 'Cengkareng', kel: 'Rawa Buaya', l: 40504, p: 39604, t: 80108 },
  { kec: 'Cengkareng', kel: 'Duri Kosambi', l: 47281, p: 46875, t: 94156 },

  { kec: 'Kalideres', kel: 'Kamal', l: 34284, p: 33290, t: 67574 },
  { kec: 'Kalideres', kel: 'Tegal Alur', l: 55679, p: 54166, t: 109845 },
  { kec: 'Kalideres', kel: 'Pegadungan', l: 44586, p: 44323, t: 88909 },
  { kec: 'Kalideres', kel: 'Kalideres', l: 46601, p: 46061, t: 92662 },
  { kec: 'Kalideres', kel: 'Semanan', l: 53168, p: 52022, t: 105190 }
];


// 4. DATA DUMMY TITIK KANDIDAT SUPERMARKET
// Perhatian: koordinat dan skor di bawah ini masih data simulasi.
const CANDIDATE_SITES = [
  {
    code: 'ALT-01',
    name: 'Kavling Komersial Outer Ring Road Kapuk',
    kec: 'Cengkareng',
    lat: -6.1432,
    lng: 106.7318,
    road: 'Jl. Lingkar Luar Barat',
    scores: [4.8, 4.7, 4.9, 3.6, 4.6]
  },
  {
    code: 'ALT-02',
    name: 'Lahan Komersial Jl. Panjang - Kedoya',
    kec: 'Kebon Jeruk',
    lat: -6.1835,
    lng: 106.7652,
    road: 'Jl. Panjang Arteri',
    scores: [4.4, 4.9, 4.5, 3.7, 4.7]
  },
  {
    code: 'ALT-03',
    name: 'Koridor Peta Selatan - Citra Garden',
    kec: 'Kalideres',
    lat: -6.1368,
    lng: 106.7055,
    road: 'Jl. Peta Selatan',
    scores: [4.0, 4.3, 4.7, 4.1, 4.4]
  },
  {
    code: 'ALT-04',
    name: 'Zona Komersial Meruya Ilir - Srengseng',
    kec: 'Kembangan',
    lat: -6.1948,
    lng: 106.7421,
    road: 'Jl. Meruya Ilir Raya',
    scores: [3.7, 4.7, 4.5, 3.8, 4.8]
  },
  {
    code: 'ALT-05',
    name: 'Koridor Kemanggisan - Palmerah Barat',
    kec: 'Palmerah',
    lat: -6.1982,
    lng: 106.7881,
    road: 'Jl. Palmerah Barat',
    scores: [4.7, 4.1, 4.4, 4.0, 3.9]
  }
];


// 5. INISIALISASI PETA LEAFLET
const map = L.map('map').setView([-6.1683, 106.7588], 12);

// Tambahkan basemap OpenStreetMap.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors | GIS-DSS UNTAR'
}).addTo(map);

// Layer terpisah agar setiap objek peta dapat diaktifkan/nonaktifkan.
const kecamatanLayerGroup = L.layerGroup().addTo(map);
const bufferLayerGroup = L.layerGroup().addTo(map);
const candidateLayerGroup = L.layerGroup().addTo(map);


// 6. TABEL RANDOM INDEX SAATY
// RI digunakan untuk menghitung Consistency Ratio berdasarkan jumlah kriteria.
const RANDOM_INDEX = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49
};

// 7. FUNGSI PERHITUNGAN AHP MENGGUNAKAN PRINCIPAL EIGENVECTOR
function calculateAHP(matrix) {
  const n = matrix.length; // Ambil jumlah kriteria dari ukuran matriks.

  // Pastikan matriks berbentuk persegi dan tidak kosong.
  if (!n || matrix.some(row => row.length !== n)) {
    throw new Error('Matriks AHP harus berbentuk persegi dan tidak boleh kosong.');
  }

  // Validasi nilai matriks AHP.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {

      // Setiap nilai harus berupa angka positif.
      if (!Number.isFinite(matrix[i][j]) || matrix[i][j] <= 0) {
        throw new Error('Semua nilai matriks AHP harus berupa angka positif.');
      }

      // Nilai diagonal utama harus selalu 1.
      if (i === j && Math.abs(matrix[i][j] - 1) > 1e-9) {
        throw new Error('Elemen diagonal matriks AHP harus bernilai 1.');
      }

      // Periksa hubungan resiprokal: aij × aji = 1.
      if (Math.abs(matrix[i][j] * matrix[j][i] - 1) > 1e-7) {
        throw new Error('Matriks AHP tidak resiprokal. Periksa kembali nilai perbandingan.');
      }
    }
  }

  // Inisialisasi bobot awal dengan nilai yang sama.
  let weights = Array(n).fill(1 / n);

  // Batas maksimum iterasi.
  const maxIterations = 1000;

  // Toleransi perubahan bobot untuk menentukan konvergensi.
  const tolerance = 1e-12;

  // Proses Power Iteration.
  for (let iteration = 0; iteration < maxIterations; iteration++) {

    // Siapkan array untuk bobot hasil iterasi berikutnya.
    const nextWeights = Array(n).fill(0);

    // Kalikan matriks dengan vektor bobot.
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        nextWeights[i] += matrix[i][j] * weights[j];
      }
    }

    // Hitung total seluruh nilai bobot sementara.
    const total = nextWeights.reduce((sum, value) => sum + value, 0);

    // Normalisasi agar total bobot menjadi 1.
    const normalizedWeights = nextWeights.map(value => value / total);

    // Cari perubahan bobot terbesar dibanding iterasi sebelumnya.
    const difference = Math.max(
      ...normalizedWeights.map((value, index) =>
        Math.abs(value - weights[index])
      )
    );

    // Simpan bobot terbaru.
    weights = normalizedWeights;

    // Hentikan iterasi jika perubahan sudah sangat kecil.
    if (difference < tolerance) break;
  }

  // Hitung nilai eigen maksimum (Lambda Max).
  let lambdaMax = 0;

  for (let i = 0; i < n; i++) {
    let weightedSum = 0;

    for (let j = 0; j < n; j++) {
      weightedSum += matrix[i][j] * weights[j];
    }

    // Akumulasi rasio (A × w)i / wi.
    lambdaMax += weightedSum / weights[i];
  }

  // Rata-ratakan untuk memperoleh Lambda Max.
  lambdaMax /= n;

  // Hitung Consistency Index.
  const CI = n <= 1
    ? 0
    : Math.max(0, (lambdaMax - n) / (n - 1));

  // Ambil nilai Random Index sesuai jumlah kriteria.
  const RI = RANDOM_INDEX[n];

  // Hitung Consistency Ratio.
  const CR = RI === undefined || RI === 0
    ? 0
    : CI / RI;

  // Kembalikan hasil perhitungan AHP.
  return {
    weights,
    lambdaMax,
    CI,
    RI,
    CR
  };
}


// 8. RENDER MATRIKS PERBANDINGAN SAATY
function renderMatrix() {
  const table = document.getElementById('ahpMatrixTable');

  // Daftar skala Saaty, termasuk nilai kebalikannya.
  const saatyOptions = [
    { val: 1/9, label: '1/9' },
    { val: 1/8, label: '1/8' },
    { val: 1/7, label: '1/7' },
    { val: 1/6, label: '1/6' },
    { val: 1/5, label: '1/5' },
    { val: 1/4, label: '1/4' },
    { val: 1/3, label: '1/3' },
    { val: 1/2, label: '1/2' },
    { val: 1, label: '1' },
    { val: 2, label: '2' },
    { val: 3, label: '3' },
    { val: 4, label: '4' },
    { val: 5, label: '5' },
    { val: 6, label: '6' },
    { val: 7, label: '7' },
    { val: 8, label: '8' },
    { val: 9, label: '9' }
  ];

  // Buat bagian kepala tabel.
  let html = '<thead><tr><th>Kriteria</th>';

  // Tambahkan judul kolom C1 sampai C5.
  CRITERIA.forEach(c => {
    html += `<th>${c.id}</th>`;
  });

  html += '</tr></thead><tbody>';

  // Buat isi matriks.
  for (let i = 0; i < CRITERIA.length; i++) {

    html += `<tr><td>${CRITERIA[i].short}</td>`;

    for (let j = 0; j < CRITERIA.length; j++) {

      // Diagonal utama selalu bernilai 1.
      if (i === j) {
        html += `<td class="diag-cell">1</td>`;

      // Bagian atas matriks dapat diubah oleh pengguna.
      } else if (i < j) {

        // Buat pilihan skala Saaty.
        const opts = saatyOptions.map(o => {
          const selected =
            Math.abs(currentMatrix[i][j] - o.val) < 0.001
              ? 'selected'
              : '';

          return `<option value="${o.val}" ${selected}>${o.label}</option>`;
        }).join('');

        html += `
          <td>
            <select data-i="${i}" data-j="${j}" class="ahp-select">
              ${opts}
            </select>
          </td>
        `;

      // Bagian bawah matriks otomatis mengikuti nilai kebalikan.
      } else {
        const val = currentMatrix[i][j];

        const display = val >= 1
          ? val.toFixed(0)
          : `1/${Math.round(1 / val)}`;

        html += `<td class="recip-cell">${display}</td>`;
      }
    }

    html += '</tr>';
  }

  html += '</tbody>';

  // Masukkan hasil HTML ke tabel.
  table.innerHTML = html;

  // Tambahkan event ketika pengguna mengubah nilai perbandingan.
  document.querySelectorAll('.ahp-select').forEach(sel => {

    sel.addEventListener('change', (e) => {

      // Ambil posisi baris dan kolom.
      const i = parseInt(e.target.dataset.i);
      const j = parseInt(e.target.dataset.j);

      // Ambil nilai perbandingan yang dipilih.
      const val = parseFloat(e.target.value);

      // Perbarui nilai bagian atas matriks.
      currentMatrix[i][j] = val;

      // Perbarui nilai kebalikannya secara otomatis.
      currentMatrix[j][i] = 1 / val;

      // Hitung ulang seluruh hasil aplikasi.
      updateAll();
    });
  });
}


// 9. UPDATE SELURUH PERHITUNGAN DAN TAMPILAN
function updateAll() {

  // Render ulang matriks AHP.
  renderMatrix();

  // Jalankan perhitungan AHP.
  const {
    weights,
    lambdaMax,
    CI,
    CR
  } = calculateAHP(currentMatrix);

  // Ambil elemen daftar bobot kriteria.
  const weightsList = document.getElementById('weightsList');

  // Tampilkan bobot masing-masing kriteria.
  weightsList.innerHTML = CRITERIA.map((c, idx) => `
    <div class="weight-pill">
      <span>${c.short}</span>
      <strong>${(weights[idx] * 100).toFixed(2)}%</strong>
    </div>
  `).join('');

  // Tampilkan Lambda Max.
  document.getElementById('valLambda').textContent =
    lambdaMax.toFixed(4);

  // Tampilkan Consistency Index.
  document.getElementById('valCI').textContent =
    CI.toFixed(4);

  // Tampilkan Consistency Ratio.
  document.getElementById('valCR').textContent =
    CR.toFixed(4);

  // Tampilkan CR pada kartu KPI.
  document.getElementById('kpiCR').textContent =
    CR.toFixed(4);

  // Tentukan status konsistensi AHP.
  const crStatus = document.getElementById('kpiCRStatus');

  // AHP dinyatakan konsisten jika CR <= 0,10.
  const isConsistent = CR <= 0.10;

  if (isConsistent) {

    // Tampilkan status konsisten.
    crStatus.textContent = 'Konsisten (CR ≤ 0,10)';

    // Gunakan class untuk status berhasil.
    crStatus.className = 'status-ok';

  } else {

    // Tampilkan peringatan ketidakkonsistenan.
    crStatus.textContent =
      'Tidak Konsisten (CR > 0,10) — Perlu revisi';

    // Gunakan class untuk status peringatan.
    crStatus.className = 'status-bad';
  }


  // 10. PERHITUNGAN WEIGHTED LINEAR COMBINATION KECAMATAN
  const ranked = KECAMATAN_DATA.map(k => {

    // Hitung skor akhir dengan mengalikan skor dan bobot.
    const score =
      weights[0] * k.c1_density +
      weights[1] * k.c2_road +
      weights[2] * k.c3_residential +
      weights[3] * k.c4_competitor +
      weights[4] * k.c5_zoning;

    // Hitung kepadatan penduduk per kilometer persegi.
    const density = Math.round(
      k.population / k.areaKm2
    );

    // Kembalikan data kecamatan beserta hasil perhitungan.
    return {
      ...k,
      density,
      totalScore: score
    };

  // Urutkan dari skor terbesar ke terkecil.
  }).sort((a, b) => b.totalScore - a.totalScore);


  // 11. UPDATE KPI LOKASI TERBAIK
  document.getElementById('kpiTopLoc').textContent =
    ranked[0].name;

  // Jika CR tidak konsisten, beri label skor sementara.
  document.getElementById('kpiTopScore').textContent =
    isConsistent
      ? `Skor WLC: ${ranked[0].totalScore.toFixed(3)} / 5.000`
      : `Skor sementara: ${ranked[0].totalScore.toFixed(3)} / 5.000 — CR belum konsisten`;


  // 12. RENDER TABEL PERINGKAT KECAMATAN
  const tbody = document.querySelector('#rankingTable tbody');

  tbody.innerHTML = ranked.map((k, idx) => {

    // Tentukan kategori berdasarkan nilai WLC.
    let catClass = 'cat-low';
    let catLabel = 'Kurang Strategis';

    if (k.totalScore >= 4.0) {
      catClass = 'cat-high';
      catLabel = 'Sangat Strategis';

    } else if (k.totalScore >= 3.3) {
      catClass = 'cat-mid';
      catLabel = 'Cukup Strategis';
    }

    // Buat baris tabel untuk setiap kecamatan.
    return `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${k.name}</td>
        <td>${k.population.toLocaleString('id-ID')}</td>
        <td>${k.density.toLocaleString('id-ID')}</td>
        <td>${k.minimarkets} gerai</td>
        <td>${k.c1_density.toFixed(1)}</td>
        <td>${k.c2_road.toFixed(1)}</td>
        <td>${k.c3_residential.toFixed(1)}</td>
        <td>${k.c4_competitor.toFixed(1)}</td>
        <td>${k.c5_zoning.toFixed(1)}</td>
        <td><strong>${k.totalScore.toFixed(3)}</strong></td>
        <td>
          <span class="pill-rank ${catClass}">
            ${catLabel}
          </span>
        </td>
      </tr>
    `;
  }).join('');


  // 13. PERHITUNGAN WLC KANDIDAT LOKASI
  const candRanked = CANDIDATE_SITES.map(c => {

    // Kalikan setiap skor kandidat dengan bobot kriterianya.
    const score = c.scores.reduce(
      (acc, val, idx) => acc + val * weights[idx],
      0
    );

    // Kembalikan kandidat dengan skor total.
    return {
      ...c,
      totalScore: score
    };

  // Urutkan kandidat dari skor terbesar.
  }).sort((a, b) => b.totalScore - a.totalScore);


  // 14. RENDER TABEL KANDIDAT LOKASI
  document.querySelector('#candidateTable tbody').innerHTML =
    candRanked.map(c => `
      <tr>
        <td><strong>${c.code}</strong></td>
        <td>${c.name}</td>
        <td>${c.kec}</td>
        <td>${c.road}</td>
        <td><strong>${c.totalScore.toFixed(3)}</strong></td>
      </tr>
    `).join('');


  // 15. PERBARUI LAYER PETA
  renderMapLayers(ranked, candRanked);
}

// 16. RENDER LAYER PETA LEAFLET
function renderMapLayers(rankedKec, candRanked) {

  // Bersihkan layer sebelumnya agar tidak terjadi duplikasi marker.
  kecamatanLayerGroup.clearLayers();
  bufferLayerGroup.clearLayers();
  candidateLayerGroup.clearLayers();


  // Tampilkan seluruh kecamatan pada peta.
  rankedKec.forEach((k, idx) => {

    // Tentukan warna marker berdasarkan skor WLC.
    const color = k.totalScore >= 4.0
      ? '#16a34a'
      : (k.totalScore >= 3.3 ? '#eab308' : '#dc2626');

    // Buat marker berbentuk lingkaran untuk kecamatan.
    const circle = L.circleMarker(
      [k.lat, k.lng],
      {
        radius: 9,
        fillColor: color,
        color: '#0f172a',
        weight: 2,
        fillOpacity: 0.85
      }
    ).bindPopup(`
      <strong>#${idx + 1} Kecamatan ${k.name}</strong><br/>
      Skor AHP-WLC: <b>${k.totalScore.toFixed(3)}</b><br/>
      Penduduk (2024): ${k.population.toLocaleString('id-ID')} jiwa<br/>
      Kepadatan: ${k.density.toLocaleString('id-ID')} jiwa/km²<br/>
      Ritel eksisting: ${k.minimarkets} gerai<br/>
      Akses utama: ${k.roadNote}<br/>
      <em>Skor kriteria masih berupa data simulasi.</em>
    `);

    // Masukkan marker kecamatan ke layer kecamatan.
    kecamatanLayerGroup.addLayer(circle);
  });


  // Tampilkan kandidat supermarket pada peta.
  candRanked.forEach((c, idx) => {

    // Gunakan warna hijau untuk peringkat pertama.
    const color = idx === 0
      ? '#16a34a'
      : '#2563eb';


    // Buat buffer dengan radius 1,5 kilometer.
    const buffer = L.circle(
      [c.lat, c.lng],
      {
        radius: 1500,
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.10
      }
    ).bindPopup(`
      <strong>Area jangkauan 1,5 km</strong><br/>
      ${c.name}
    `);

    // Masukkan buffer ke layer buffer.
    bufferLayerGroup.addLayer(buffer);


    // Buat marker untuk kandidat supermarket.
    const marker = L.marker(
      [c.lat, c.lng]
    ).bindPopup(`
      <strong>Kandidat #${idx + 1}: ${c.code}</strong><br/>
      ${c.name}<br/>
      Kecamatan: ${c.kec}<br/>
      Jalan: ${c.road}<br/>
      Skor kelayakan: <b>${c.totalScore.toFixed(3)}</b><br/>
      <em>Koordinat dan skor kandidat merupakan data simulasi.</em>
    `);

    // Masukkan marker kandidat ke layer kandidat.
    candidateLayerGroup.addLayer(marker);
  });
}


// 17. INISIALISASI TABEL KELURAHAN
function initKelurahanTable() {

  // Ambil elemen dropdown filter kecamatan.
  const select = document.getElementById('filterKecamatan');

  // Tambahkan pilihan kecamatan ke dropdown.
  KECAMATAN_DATA.forEach(k => {

    // Buat elemen option baru.
    const opt = document.createElement('option');

    // Atur nilai option.
    opt.value = k.name;

    // Atur teks yang terlihat pengguna.
    opt.textContent = `Kecamatan ${k.name}`;

    // Tambahkan option ke dropdown.
    select.appendChild(opt);
  });


  // Fungsi untuk menampilkan baris tabel sesuai filter.
  function renderRows(filterVal) {

    // Jika ALL dipilih, tampilkan semua kelurahan.
    const filtered = filterVal === 'ALL'
      ? KELURAHAN_DATA

      // Jika tidak, tampilkan kelurahan sesuai kecamatan.
      : KELURAHAN_DATA.filter(d => d.kec === filterVal);


    // Masukkan data kelurahan ke dalam tabel.
    document.querySelector('#kelurahanTable tbody').innerHTML =
      filtered.map(d => `
        <tr>
          <td>${d.kec}</td>
          <td>${d.kel}</td>
          <td>${d.l.toLocaleString('id-ID')}</td>
          <td>${d.p.toLocaleString('id-ID')}</td>
          <td><strong>${d.t.toLocaleString('id-ID')}</strong></td>
        </tr>
      `).join('');
  }


  // Jalankan filter ketika dropdown berubah.
  select.addEventListener('change', (e) => {
    renderRows(e.target.value);
  });

  // Tampilkan seluruh data ketika halaman pertama kali dibuka.
  renderRows('ALL');
}


// 18. TOGGLE LAYER BUFFER
document.getElementById('toggleBuffer').addEventListener('change', (e) => {

  // Jika checkbox aktif, tampilkan layer buffer.
  if (e.target.checked) {
    map.addLayer(bufferLayerGroup);

  // Jika tidak aktif, sembunyikan layer buffer.
  } else {
    map.removeLayer(bufferLayerGroup);
  }
});


// 19. TOGGLE LAYER KANDIDAT
document.getElementById('toggleCandidates').addEventListener('change', (e) => {

  // Jika checkbox aktif, tampilkan marker kandidat.
  if (e.target.checked) {
    map.addLayer(candidateLayerGroup);

  // Jika tidak aktif, sembunyikan marker kandidat.
  } else {
    map.removeLayer(candidateLayerGroup);
  }
});


// 20. TOMBOL RESET AHP
document.getElementById('btnReset').addEventListener('click', () => {

  // Kembalikan matriks ke nilai default.
  currentMatrix = JSON.parse(JSON.stringify(DEFAULT_MATRIX));

  // Hitung ulang seluruh data.
  updateAll();
});


// 21. EKSPOR HASIL KE CSV
document.getElementById('btnExport').addEventListener('click', () => {

  // Hitung ulang hasil AHP berdasarkan matriks saat ini.
  const ahp = calculateAHP(currentMatrix);

  // Ambil seluruh hasil perhitungan AHP.
  const {
    weights,
    lambdaMax,
    CI,
    RI,
    CR
  } = ahp;

  // Siapkan array untuk menampung data CSV.
  const rows = [];


  // BAGIAN A: INFORMASI AHP
  rows.push(['INFORMASI AHP']);

  // Header tabel bobot.
  rows.push(['Kriteria', 'Bobot']);

  // Masukkan bobot setiap kriteria.
  CRITERIA.forEach((criterion, index) => {
    rows.push([
      criterion.name,
      weights[index].toFixed(6)
    ]);
  });

  // Masukkan nilai Lambda Max.
  rows.push(['Lambda Max', lambdaMax.toFixed(6)]);

  // Masukkan nilai Consistency Index.
  rows.push(['Consistency Index (CI)', CI.toFixed(6)]);

  // Masukkan nilai Random Index.
  rows.push(['Random Index (RI)', RI.toFixed(6)]);

  // Masukkan nilai Consistency Ratio.
  rows.push(['Consistency Ratio (CR)', CR.toFixed(6)]);

  // Masukkan status konsistensi AHP.
  rows.push([
    'Status AHP',
    CR <= 0.10 ? 'Konsisten' : 'Belum konsisten'
  ]);

  // Baris kosong sebagai pemisah.
  rows.push([]);


  // BAGIAN B: RANKING KECAMATAN
  rows.push(['RANKING KECAMATAN']);

  // Header tabel ranking kecamatan.
  rows.push([
    'Peringkat',
    'Kecamatan',
    'Penduduk 2024',
    'Kepadatan per km2',
    'Ritel Eksisting',
    'Skor WLC'
  ]);


  // Hitung skor WLC setiap kecamatan.
  const ranked = KECAMATAN_DATA.map(k => {

    return {
      ...k,

      // Hitung kepadatan penduduk.
      density: Math.round(k.population / k.areaKm2),

      // Hitung skor akhir WLC.
      score:
        weights[0] * k.c1_density +
        weights[1] * k.c2_road +
        weights[2] * k.c3_residential +
        weights[3] * k.c4_competitor +
        weights[4] * k.c5_zoning

    };

  // Urutkan dari skor tertinggi.
  }).sort((a, b) => b.score - a.score);


  // Masukkan hasil ranking kecamatan ke CSV.
  ranked.forEach((item, index) => {

    rows.push([
      index + 1,
      item.name,
      item.population,
      item.density,
      item.minimarkets,
      item.score.toFixed(4)
    ]);
  });


  // Baris kosong sebagai pemisah.
  rows.push([]);


  // BAGIAN C: RANKING KANDIDAT LOKASI
  rows.push(['RANKING KANDIDAT LOKASI']);

  // Header tabel kandidat.
  rows.push([
    'Kode',
    'Nama Kandidat',
    'Kecamatan',
    'Jalan',
    'Skor WLC'
  ]);


  // Hitung skor WLC untuk setiap kandidat.
  const candidateRanking = CANDIDATE_SITES.map(site => {

    return {
      ...site,

      // Kalikan skor kriteria dengan bobot AHP.
      totalScore: site.scores.reduce(
        (sum, value, index) => sum + value * weights[index],
        0
      )

    };

  // Urutkan kandidat berdasarkan skor tertinggi.
  }).sort((a, b) => b.totalScore - a.totalScore);


  // Masukkan hasil kandidat ke CSV.
  candidateRanking.forEach(site => {

    rows.push([
      site.code,
      site.name,
      site.kec,
      site.road,
      site.totalScore.toFixed(4)
    ]);
  });


  // Ubah seluruh data menjadi format CSV.
  const csv = rows.map(row => {

    // Proses setiap kolom dalam satu baris.
    return row.map(value => {

      // Amankan tanda kutip ganda di dalam teks.
      const safeValue = String(value ?? '').replace(/"/g, '""');

      // Bungkus nilai dengan tanda kutip.
      return `"${safeValue}"`;

    }).join(',');

  }).join('\r\n');


  // Buat file CSV dengan encoding UTF-8.
  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' }
  );

  // Buat URL sementara untuk file CSV.
  const url = URL.createObjectURL(blob);

  // Buat elemen link untuk mengunduh file.
  const link = document.createElement('a');

  // Hubungkan link dengan URL file.
  link.href = url;

  // Tentukan nama file hasil ekspor.
  link.download = 'hasil_ahp_gis_supermarket_jakbar.csv';

  // Tambahkan link sementara ke halaman.
  document.body.appendChild(link);

  // Jalankan proses download.
  link.click();

  // Hapus link setelah proses download dipicu.
  link.remove();

  // Bersihkan URL sementara dari memori browser.
  URL.revokeObjectURL(url);
});


// 22. JALANKAN APLIKASI
// Inisialisasi tabel kelurahan terlebih dahulu.
initKelurahanTable();

// Jalankan seluruh perhitungan dan render tampilan awal.
updateAll();