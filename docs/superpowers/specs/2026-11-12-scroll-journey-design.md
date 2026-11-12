# Scroll Journey: desain singkat

## Maksud dan alasan
Portofolio desktop sudah berupa meja 3D interaktif (React Three Fiber, model GLB, modal konten dari Sanity). Pemiliknya ingin rasa seperti parkiria.id: objek 3D yang bergerak mengikuti scroll, dengan objek yang tetap bisa diputar dan diklik. Alasannya: pengunjung dibawa melewati cerita secara berurutan, bukan dibiarkan mencari sendiri objek mana yang bisa diklik.

## Keputusan pemilik
- Meja isometrik tetap jadi panggung. Scroll menggerakkan kamera dari objek ke objek.
- Urutan cerita seperti portofolio pada umumnya: pengenalan, apa yang bisa dilakukan, pengalaman, portofolio, jurnal belajar (opsional), kontak.
- Klik objek untuk membuka konten tetap berfungsi.
- Mobile tetap memakai tampilan 2D tanpa canvas.
- Tombol "Standard View / Resume" tetap ada.
- Spike sudah dicoba pemilik dan scroll-nya jalan.

## Pemetaan tahap ke objek
| Tahap | Objek (id di `MODEL_LAYOUT`) | Konten |
|---|---|---|
| 1. Pengenalan | meja utuh, lalu buku (`about`) | nama, satu kalimat, Resume |
| 2. Yang bisa saya lakukan | whiteboard (`stack`) | stack dan keahlian |
| 3. Pengalaman | belum ditentukan objeknya | `ExperienceTimeline` |
| 4. Portofolio | monitor (`showcase`, zoom `pc`) | slider project, modal detail |
| 5. Jurnal belajar (opsional) | notebook/jurnal (`jrn-japanese`) | jurnal bahasa Jepang |
| 6. Kontak | phone (`contact`) | layar kontak |

## Tujuan
- Scroll menggerakkan kamera lewat tahap-tahap di atas, memakai mekanisme zoom `CameraRig` yang sudah ada.
- Penanda progres kecil (mis. 01/06).
- Tombol kontak yang selalu terlihat di HUD.
- Pengguna `prefers-reduced-motion` lompat langsung antar tahap tanpa animasi kamera.

## Bukan tujuan
- Testimoni, blog penuh, animasi tambahan per objek.
- Unggah model 3D lewat Sanity (tetap di `/public`, sesuai PRD).
- Versi mobile 3D.

## Anti-tujuan (gagal walau secara teknis jalan)
- Recruiter yang hanya punya 15 detik terjebak di scroll yang dikunci atau lambat.
- Scroll dan klik objek saling mengganggu.
- Halaman tanpa WebGL atau di mobile menjadi kosong.

## Batasan
- Next.js 16 (App Router), TypeScript strict, Tailwind, pnpm. Baca panduan di `node_modules/next/dist/docs/` sebelum menyentuh API Next.
- Semua data Sanity dianggap bisa null; tahap yang kontennya kosong dilewati, bukan error.
- Aturan di `AGENTS.md` dan `DESIGN.md` tetap berlaku (modal aksesibel, glow, token warna).

## Keadaan sekarang (hasil spike)
- `components/HomeClient.tsx`: pendengar scroll memetakan `scrollY / innerHeight` ke `zoomTarget` lewat `SPIKE_STAGES = [null, "about", "pc", "contact"]`, plus elemen tinggi tak terlihat. Ditandai SPIKE, sifatnya sementara.
- `components/scene/DesktopScene.tsx`: `enableZoom={false}` supaya roda mouse tidak ditelan OrbitControls.
- `ZOOM_VIEWS` dan `SCREENS` hanya punya posisi kamera untuk `pc`, `contact`, `about`. Whiteboard, pengalaman, dan jurnal belum.
- Kamera sekarang perspective (`fov: 35`), padahal PRD menyebut orthographic.

## Keputusan saya (bukan dari pemilik, mohon dicek)
- Kamera tetap perspective. Kodenya sudah dikalibrasi untuk itu; PRD diperbarui agar sejalan.
- Scroll bersifat halus dengan snap ke tahap terdekat, tidak dikunci.
- Putar bebas (OrbitControls) dibatasi atau dimatikan selama perjalanan scroll; petunjuk "Drag to rotate" di HUD diganti petunjuk scroll.
- Tahap jurnal hanya muncul kalau Sanity punya entri jurnal.

## Keputusan tambahan saya (setelah pemeriksaan pembangun, mohon dicek)
- **Arsitektur scroll:** scroll native halaman. Canvas tetap `fixed`, elemen spacer tak terlihat menentukan panjang scroll, sekitar 100vh per perhentian. Snap ke perhentian terdekat dilakukan setelah scroll berhenti, tidak membajak roda mouse.
- **Konten tiap tahap:** memakai layar di objek yang sudah ada (buku, monitor, phone) ditambah teks pendek di samping scene. Tahap whiteboard memakai panel HTML. Tahap Pengalaman tidak punya objek: kamera kembali ke tampilan meja utuh dan `ExperienceTimeline` tampil sebagai panel HTML di atas canvas.
- **Perhentian kamera:** satu perhentian = satu posisi kamera. Meja utuh dan buku adalah dua perhentian terpisah, jadi penanda progres menghitung perhentian, bukan tahap konten.
- **Pergerakan kamera:** tween saat berganti perhentian (memakai `CameraRig` yang ada), bukan interpolasi terus-menerus mengikuti scroll.
- **Sumber kebenaran:** scroll. Klik objek menggulir halaman ke perhentian objek itu, dan `zoomTarget` diturunkan dari perhentian aktif, jadi hanya satu penulis. Modal tidak mengubah posisi scroll; scroll dikunci selama modal terbuka, dan saat modal ditutup kamera kembali ke perhentian aktif.
- **Perhentian dinamis:** daftar perhentian dibangun dari data Sanity. Perhentian tanpa konten dilewati, tinggi scroll dan penanda (mis. 01/05) mengikuti jumlah sebenarnya. `about` dan `contact` selalu ada dengan teks cadangan bila datanya null.
- **Jurnal:** mencakup semua entri jurnal, bukan hanya bahasa Jepang.
- **Navigasi cepat:** titik-titik penanda progres bisa diklik dan bisa dipakai lewat keyboard untuk lompat ke perhentian. Tombol kontak di HUD menggulir ke perhentian kontak.

## Keputusan pemilik terbaru
- Putar bebas **dibatasi** (sedikit saja lalu kembali ke posisi perhentian), bukan dimatikan.
- Proyek ini dikerjakan **setelah** perombakan model 3D dan migrasi konten (`2026-11-12-3d-overhaul-and-content-design.md`).

## Diserahkan ke pembangun
- Menentukan posisi kamera dan layar untuk whiteboard, pengalaman, dan jurnal.
- Objek mana yang jadi "pengalaman".
- Bentuk persis penanda progres dan animasi transisi.
- Cara menjaga scroll dan OrbitControls tidak saling bentrok, serta perilaku saat modal terbuka.
