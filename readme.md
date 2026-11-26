# GIS-DSS AHP: Penentuan Lokasi Supermarket Jakarta Barat

Aplikasi **Sistem Pendukung Keputusan (DSS) berbasis GIS** untuk membantu menentukan lokasi strategis supermarket di wilayah Jakarta Barat. Aplikasi menggabungkan:

- **Analytical Hierarchy Process (AHP)** untuk menentukan bobot kriteria.
- **Weighted Linear Combination (WLC)** untuk menghitung skor kelayakan wilayah dan kandidat lokasi.
- **Leaflet** dan **OpenStreetMap** untuk menampilkan hasil dalam peta interaktif.

Proyek ini merupakan dashboard web statis untuk UAS mata kuliah Decision Support System (DSS).

## Fitur Utama

- Matriks perbandingan berpasangan AHP dengan skala Saaty 1-9.
- Penghitungan bobot kriteria menggunakan *Principal Eigenvector* melalui *Power Iteration*.
- Pengujian konsistensi menggunakan Lambda Max, Consistency Index (CI), dan Consistency Ratio (CR).
- Pemeringkatan 8 kecamatan di Jakarta Barat menggunakan WLC.
- Peta interaktif untuk melihat kecamatan dan kandidat lokasi.
- Tampilan radius layanan kandidat sepanjang 1,5 km.
- Filter detail demografi berdasarkan kecamatan.
- Reset matriks AHP ke nilai default.
- Ekspor hasil bobot AHP, ranking kecamatan, dan ranking kandidat ke format CSV.
- Tampilan responsif untuk desktop, tablet, dan smartphone.

## Tim Pengembang

- Muhammad Satria Rizky — 535240002
- George Lung Lung Devago — 535240033
- Andrew Anstendyk Takalamingan — 535240130

## Teknologi

- HTML5
- CSS3
- JavaScript ES6
- Leaflet 1.9.4
- OpenStreetMap
- Google Fonts — Plus Jakarta Sans

## Cara Menjalankan

Aplikasi tidak memerlukan proses build atau instalasi package.

### Cara 1: Membuka langsung

Buka file `index.html` menggunakan browser modern.

> Leaflet dan font Google memerlukan koneksi internet karena dimuat melalui CDN dan OpenStreetMap.

### Cara 2: Menggunakan server lokal

Dari folder proyek, jalankan salah satu perintah berikut:

```bash
python -m http.server 5500
```

atau dengan Node.js:

```bash
npx serve .
```

Kemudian akses:

- `http://localhost:5500` untuk Python
- Alamat yang ditampilkan oleh server untuk Node.js

## Struktur Proyek

```text
uas-dss/
|-- index.html  # Struktur halaman dan komponen dashboard
|-- style.css   # Tampilan, responsivitas, dan animasi
|-- app.js      # Data, perhitungan AHP/WLC, tabel, dan peta
`-- readme.md   # Dokumentasi proyek
```

## Kriteria Penilaian

| ID | Kriteria | Deskripsi |
|---|---|---|
| C1 | Kepadatan Penduduk | Tingkat kepadatan penduduk sebagai indikator potensi pasar |
| C2 | Aksesibilitas Jaringan Jalan | Kemudahan akses melalui jaringan jalan utama |
| C3 | Kedekatan Permukiman | Kedekatan dengan kawasan permukiman |
| C4 | Jarak terhadap Kompetitor | Kondisi persaingan terhadap ritel atau minimarket eksisting |
| C5 | Kesesuaian Zonasi RDTR | Keselarasan lokasi dengan rencana penggunaan ruang |

## Metode Perhitungan

### Analytical Hierarchy Process

Pengguna mengisi bagian segitiga atas matriks perbandingan menggunakan skala Saaty 1-9. Nilai pada bagian bawah matriks dihitung otomatis sebagai nilai resiprokal.

Bobot kriteria dihitung dari matriks berpasangan menggunakan *Principal Eigenvector* dan *Power Iteration*. Matriks dinyatakan dapat diterima jika:

```text
Consistency Ratio (CR) ≤ 0,10
```

Komponen uji konsistensi:

- `Lambda Max (λmax)` dihitung dari perkalian matriks dengan vektor bobot.
- `CI = (λmax - n) / (n - 1)`
- `CR = CI / RI`
- Untuk 5 kriteria, nilai Random Index (RI) adalah `1,12`.

Jika pengguna mengubah matriks sehingga CR lebih besar dari 0,10, aplikasi menampilkan peringatan agar matriks diperbaiki.

### Weighted Linear Combination

Skor kecamatan dihitung berdasarkan bobot AHP dan skor kelima kriteria:

```text
Skor WLC = (w1 × C1) + (w2 × C2) + (w3 × C3)
         + (w4 × C4) + (w5 × C5)
```

Kategori kelayakan yang digunakan adalah:

- **Sangat Strategis**: skor `≥ 4,0`
- **Cukup Strategis**: skor `3,3 - 3,99`
- **Kurang Strategis**: skor `< 3,3`

Skor tertinggi digunakan sebagai rekomendasi lokasi kecamatan utama pada kartu KPI.

## Data yang Digunakan

Aplikasi memuat:

- 8 kecamatan di Jakarta Barat.
- 56 data kelurahan beserta jumlah penduduk laki-laki dan perempuan.
- Total penduduk sebesar 2.539.534 jiwa pada KPI dashboard.
- 637 minimarket eksisting sebagai data ringkasan pada dashboard.
- 5 titik kandidat supermarket untuk simulasi analisis spasial.

## Penggunaan Dashboard

1. Buka aplikasi di browser.
2. Perhatikan KPI penduduk, minimarket, CR, dan lokasi terbaik.
3. Ubah nilai pada matriks AHP di bagian segitiga atas.
4. Perhatikan perubahan bobot, status konsistensi, dan ranking kecamatan.
5. Aktifkan atau nonaktifkan radius layanan dan titik kandidat pada peta.
6. Pilih kecamatan pada filter untuk menampilkan data kelurahan tertentu.
7. Klik **Reset Matriks Default** untuk mengembalikan bobot awal.
8. Klik **Export Hasil CSV** untuk mengunduh hasil perhitungan.

## Contoh Isi CSV

File ekspor `hasil_ahp_gis_supermarket_jakbar.csv` berisi:

- Bobot setiap kriteria AHP.
- Lambda Max, CI, RI, dan CR.
- Status konsistensi matriks.
- Ranking kecamatan beserta kepadatan dan skor WLC.
- Ranking kandidat lokasi beserta skor WLC.

## Batasan dan Catatan

- Koordinat kandidat, skor kelima kriteria, dan radius peta merupakan data simulasi.
- Skor kecamatan belum sepenuhnya berasal dari analisis GIS lapangan.
- Peta saat ini menampilkan marker, lingkaran radius 1,5 km, dan basemap, tetapi belum melakukan analisis spatial overlay spasial yang sebenarnya.
- Radius 1,5 km bersifat geometris dan belum memperhitungkan waktu tempuh atau kondisi jaringan jalan.
- Data demografi dan ritel perlu diverifikasi dengan sumber resmi BPS, OpenStreetMap, atau data instansi terkait sebelum digunakan sebagai dasar keputusan nyata.

## Lisensi dan Atribusi

Peta disajikan dengan [Leaflet](https://leafletjs.com/) dan data basemap [OpenStreetMap](https://www.openstreetmap.org/copyright).