# Website Coolio — Panduan Edit

Buka `index.html` langsung di browser (double-click). Tidak perlu install apa pun.

## Struktur file
| File | Isi |
|---|---|
| `index.html` | Semua teks & susunan section (Hero, Masalah, Solusi, Produk, Target, Pasar, Keunggulan, Bisnis, Roadmap, Investasi, Kontak) |
| `style.css` | Tampilan. **Warna utama ada di bagian `:root` paling atas** |
| `script.js` | Botol 3D, efek semprot, animasi. **Teks label botol ada di `CONFIG` paling atas** |
| `assets/coolio-mockup-v2.jpg` | Foto mockup produk (ganti file dengan nama sama untuk update foto) |
| `assets/problem-*-hd.jpg`, `ice.jpg`, `green-apple.jpg` | Foto section Problem & Solution |
| `assets/sdg-8-9.png` | Badge SDG 8 & 9 |
| `assets/icon-*.png` | Ikon WhatsApp & Instagram di kontak |
| `assets/logo-word.png` | Logo "Coolio" saja (navbar, hero, Why Coolio) |
| `assets/logo-full.png` | Logo lengkap dengan tagline (bagian kontak) |
| `assets/logo-data.js` | Salinan logo untuk label botol 3D |

## Data dari proposal
Angka di section Market Opportunity, Business Model, dan Investment Opportunity diambil dari *02_Proposal_Indo_v02*. Kalau angka di proposal berubah, edit langsung teksnya di `index.html`.
- Grafik pendapatan: ubah `data-value` dan teks di tiap `<div class="col">`.
- Bar biaya per botol & anggaran: ubah `data-value` (persen panjang bar) dan teks nominalnya.

## Edit cepat lainnya
- **Keunggulan produk**: section `WHY COOLIO` di `index.html`.
- **Ganti warna**: ubah nilai di `:root` (`--sky-500`, `--pink`, `--lime`, dll.) pada `style.css`.
- **Ganti teks di label botol 3D**: ubah `CONFIG.label` di `script.js` (misal varian aroma baru).
- **Warna label botol 3D**: ubah `CONFIG.colors` di `script.js`.
- **Kecepatan putar botol**: `CONFIG.autoRotateSpeed` di `script.js`.
- **Menambah/menghapus section**: setiap section diberi komentar `<!-- ===== NAMA ===== -->` di `index.html`.

Data pasar bersumber dari The Report Cubes, *Indonesia Deodorants & Body Sprays Market Report and Forecast 2026–2034*.
