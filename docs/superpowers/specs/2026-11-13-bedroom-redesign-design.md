# Redesign total: kamar malam hangat

## Maksud dan alasan
Portofolio desktop sekarang berupa meja 3D (model GLB) yang dijelajahi dengan scroll dari perhentian ke perhentian. Pemiliknya ingin merombak total menjadi sebuah kamar tidur. Empat keluhan terhadap versi sekarang, semuanya dari pemilik:

- **Terasa kosong:** hanya meja yang melayang, tidak ada dunia di sekelilingnya.
- **Kurang personal:** terlihat seperti template setup developer.
- **Scroll terasa kaku:** pengunjung dipaksa mengikuti urutan.
- **Visual kurang menarik:** pencahayaan, warna, dan gaya model tidak seragam.

Hasil yang dituju: pengunjung membuka situs dan melihat kamar seseorang pada malam hari, bebas memutarnya seperti diorama, lalu mengklik benda untuk membaca isinya.

## Keputusan pemilik
- Scene meja, scroll journey, panel overlay, dan tampilan mobile yang sekarang semuanya diganti. Konten Sanity tetap dipakai.
- Suasana: malam hangat. Kamar gelap, lampu meja, cahaya monitor, terasa cozy dan personal.
- Gaya: low-poly stylized.
- Semua benda dibangun dari bentuk dasar (kotak, silinder) langsung di kode. Tidak ada file model.
- Navigasi: pengunjung bebas memutar dan menggeser kamar, lalu klik benda. Scroll journey dibuang total.
- Susunan kamar A (kamar tidur klasik): meja di bawah jendela, kasur di samping, rak buku, karpet.
- Kasur membuka "Tentang saya".
- Mobile: tetap tanpa 3D, tampilan 2D didesain ulang bernuansa kamar.
- Pemetaan benda ke konten di bawah ini (diusulkan saya, disetujui pemilik).

## Pemetaan benda ke konten
| Benda | Konten | Sumber data |
|---|---|---|
| Monitor di meja | Proyek | `portfolio.projects`, `items.showcase` |
| PC di meja | Tech stack dan layanan | `items.stack` |
| Rak buku berdiri | Jurnal | `portfolio.journalEntries` |
| Poster di dinding | Pengalaman kerja | `items.about.experiences` |
| Kasur | Tentang saya | `items.about` (tanpa daftar pengalaman) |
| HP di meja | Kontak | `items.contact` |

Hiasan saja, tidak bisa diklik: jendela, lampu meja, kursi, karpet, rak dinding, tanaman.

## Tujuan
- Satu kamar isometrik potongan (lantai dan dua dinding belakang, tanpa langit-langit) yang terbaca jelas sebagai kamar tidur pada malam hari.
- Putar, geser, dan zoom bebas dalam batas yang wajar.
- Klik benda membuka kontennya; pengunjung selalu tahu benda mana yang bisa diklik.
- Tampilan 2D (mobile dan "Standard View" di desktop) memakai palet dan nuansa yang sama.
- 60 FPS di laptop biasa.

## Bukan tujuan
- Perubahan skema Sanity atau konten baru.
- 3D di mobile.
- Animasi per benda, siklus siang/malam, tombol mematikan lampu, suara.
- Tur terpandu atau urutan cerita.
- Mengatur isi kamar lewat CMS (`deskObject` dan `workspaceConfig` sudah tidak dipakai frontend; biarkan).

## Anti-tujuan (gagal walau secara teknis jalan)
- Kamar masih terasa seperti meja kerja dengan dinding tempelan.
- Pengunjung tidak tahu benda mana yang bisa diklik, atau harus menebak-nebak.
- Pengunjung bisa memutar kamera ke balik dinding atau ke bawah lantai dan melihat ruang hampa.
- Recruiter yang hanya punya 15 detik tidak menemukan resume dan kontak tanpa menyentuh 3D.
- Halaman kosong di mobile, tanpa WebGL, atau saat konteks WebGL hilang.
- Warna navy dan hijau terminal lama masih tersisa di sebagian layar.

## Batasan
- Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, pnpm. Baca panduan di `frontend/node_modules/next/dist/docs/` sebelum menyentuh API Next.
- Canvas tidak dimuat di mobile atau saat WebGL tidak tersedia (pola `dynamic(..., { ssr: false })` dan `useWebGL` yang ada dipertahankan).
- Semua data Sanity dianggap bisa null. Benda yang kontennya kosong tetap digambar, tetapi tidak bisa diklik dan tidak muncul di navigasi.
- Tanpa dependensi baru. `three`, `@react-three/fiber`, dan `@react-three/drei` sudah terpasang.
- `prefers-reduced-motion`: kamera melompat, tidak terbang.
- Teks antarmuka tetap bahasa Inggris seperti sekarang.

## Keadaan sekarang
- `frontend/components/HomeClient.tsx` menyatukan semuanya: splash, pilihan HUD atau Standard View, scroll journey, dan modal.
- `frontend/components/scene/`: `DesktopScene.tsx` (Canvas, `CameraRig`, OrbitControls terbatas yang memantul kembali), `SceneModel.tsx` dan `layout.ts` (pemuatan dan posisi GLB), empat layar di dalam scene (`AboutScreen`, `ContactScreen`, `ShowcaseScreen`, `StackScreen`), `overlayRoot.ts`.
- Scroll journey: `hooks/useJourney.ts`, `lib/journey.ts`, `components/journey/`.
- Konten modal yang bisa dipakai ulang: `components/modal/*`, `components/showcase/*`, `ExperienceTimeline.tsx`, `components/ui/*`.
- Model pihak ketiga di `frontend/public/glb/` dan `frontend/public/animated_book/`, skrip di `frontend/scripts/glb/`, atribusi di `lib/credits.ts` dan `app/credits/page.tsx`.
- Token warna di `frontend/app/globals.css` (navy `#0f172a`, hijau `#10b981`, ungu `#8b5cf6`), dijelaskan di `DESIGN.md`.
- Kamera perspective (fov 35), sudah dicatat di `PRD.md`. `AGENTS.md` masih menyebut orthographic.

## Keputusan saya (bukan dari pemilik, mohon dicek)
1. **Klik benda:** kamera terbang mendekat ke benda itu dan konten muncul di satu panel di sisi kanan. Satu komponen panel untuk keenam benda. Tombol tutup, Esc, atau klik area kosong mengembalikan kamera ke tampilan utuh. Pemilik melihat tiga pilihan dan tidak memilih; ini rekomendasi saya.
2. **Isi panel memakai ulang komponen yang ada.** Proyek: daftar proyek, klik satu proyek membuka modal detail yang sekarang. Jurnal: daftar entri, klik satu entri membuka modal yang sekarang. Lainnya langsung tampil di panel.
3. **Penanda benda yang bisa diklik:** saat kursor di atas benda, benda menyala sedikit, kursor berubah, dan muncul label kecil berisi nama kontennya. Navigasi HUD tetap ada dan membuka panel yang sama, supaya bisa dipakai dengan keyboard.
4. **Pengenalan:** nama, tagline, dan tombol resume tampil sebagai kartu kecil di atas scene saat tampilan utuh, dan hilang saat panel terbuka.
5. **Batas kamera:** putaran mendatar dibatasi pada sisi kamar yang terbuka, kemiringan dibatasi supaya tidak di bawah lantai atau tepat dari atas, zoom dan geser dijepit di sekitar kamar. Tidak memantul kembali seperti sekarang. Roda mouse untuk zoom.
6. **Kamera tetap perspective** dengan fov kecil, supaya logika terbang `CameraRig` yang ada bisa dipakai ulang. Baris orthographic di `AGENTS.md` diperbarui agar sejalan dengan `PRD.md`.
7. **Palet baru menggantikan navy dan hijau:** dasar ungu sangat gelap, permukaan ungu gelap, aksen utama oranye lampu, aksen kedua ungu lembut, teks krem. Nilai awal ada di lampiran; nilai akhir ditentukan pembangun dengan syarat kontras teks AA. Font tidak berubah. `DESIGN.md` dan `globals.css` diperbarui.
8. **Cahaya:** satu lampu hangat di meja sebagai sumber utama, monitor dan jendela memancarkan cahaya sendiri, sedikit cahaya dingin dari arah jendela supaya sisi gelap tetap terbaca.
9. **Tampilan 2D:** struktur dan isi `StandardView` yang sekarang dipertahankan, diwarnai ulang dengan palet baru, dan tiap bagian diberi gambar kecil benda kamarnya (monitor, buku, kasur, dan seterusnya). Tidak ada gambar kamar utuh.
10. **Yang dihapus:** scroll journey, empat layar di dalam scene, pemuatan GLB, semua file model dan skrip GLB, dependensi `@gltf-transform/*` dan `meshoptimizer`, serta halaman credits beserta tautannya (tidak ada lagi karya pihak ketiga yang perlu diatribusi). `sharp` diperiksa dulu apakah masih dipakai Next sebelum dihapus.
11. **Tombol "Standard View", splash, dan fallback saat scene gagal** dipertahankan, hanya diwarnai ulang.

## Diserahkan ke pembangun
- Ukuran, posisi, dan warna persis tiap benda. Lampiran adalah titik awal dari sketsa yang dilihat pemilik, bukan angka final.
- Pembagian komponen dan cara menyimpan data benda (disarankan satu tabel data, bukan satu komponen per benda).
- Cara membuat bayangan dan efek nyala saat hover, selama 60 FPS terjaga.
- Posisi kamera untuk tiap benda dan nilai batas putaran.
- Tata letak panel pada lebar layar sempit di desktop.
- Pengujian: satu pemeriksaan untuk logika murni (benda mana yang aktif berdasarkan data), mengikuti pola `node --test` yang ada. Tes journey dan layout lama ikut dihapus. Skrip `scripts/e2e/shoot.mjs` disesuaikan atau dihapus.
- Pembaruan `PRD.md` agar menggambarkan kamar, bukan meja dan scroll.

## Lampiran: sketsa susunan A
Satuan bebas, kamar 6 x 6, tinggi dinding 4. Format `[x, y, z, lebar, dalam, tinggi, warna]`, dengan x dan y di lantai dan z ke atas (di three.js sumbu atas adalah y). Dinding berada di bidang x = 0 dan y = 0; kamera melihat dari sudut x dan y besar.

```js
// ruang
[0,0,-.2, 6,6,.2, '#6b4a3a']      // lantai kayu
[-.2,0,0, .2,6,4, '#3b3050']      // dinding kiri
[0,-.2,0, 6,.2,4, '#453a5c']      // dinding belakang
// dinding
[1.2,0,1.9, 2,.05,1.4, '#3d5a9e'] // jendela (menyala)
[0,4.0,2.0, .04,1.2,1.4, '#e0a458'] // poster -> pengalaman
[0,1.6,2.3, .35,1.4,.08, '#a9744f'] // rak dinding + buku
// meja di bawah jendela
[0.8,0.2,1, 2.8,1.2,.12, '#a9744f'] // daun meja, kaki di kedua ujung
[0.92,0.42,1.6, .3,.3,.12, '#ffcf7a'] // kepala lampu (menyala)
[1.6,0.4,1.45, 1.2,.08,.7, '#9be7c4'] // monitor (menyala) -> proyek
[1.25,1.0,1.12, .18,.32,.03, '#111111'] // HP -> kontak
[3.0,0.4,1.12, .35,.8,.8, '#1f2430'] // PC -> tech stack
[1.9,1.7,0, .8,.8,.55, '#3d4a66']  // kursi + sandaran
// sisanya
[4.6,0.2,0, 1.2,.5,2.6, '#8a5e41'] // rak buku berdiri -> jurnal
[0.2,3.2,0, 2,2.6,.45, '#4a3a33']  // rangka kasur -> tentang saya
[0.2,3.2,.45, 2,2.6,.25, '#d8c9b8'] // kasur, bantal krem, selimut '#b5544d'
[3.2,2.6,0, 2.2,2.6,.03, '#7a5c8a'] // karpet
[5.2,5.1,.4, .6,.6,.7, '#4f8a5b']  // tanaman di pot
```

Palet awal antarmuka: dasar `#0f0d17`, permukaan `#1a1626`, garis `#2c2540`, aksen `#ffb86b`, teks `#f3ece4`, teks sekunder `#a99fb5`.
