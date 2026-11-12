# Perombakan model 3D dan migrasi konten: desain singkat

Proyek 1 dan 2 dari tiga. Proyek 3 (perjalanan scroll) ada di `2026-11-12-scroll-journey-design.md` dan dikerjakan setelah proyek 1, karena posisi kamera dikalibrasi per model.

## Maksud dan alasan
Pemilik menilai model 3D sekarang kurang detail dan terlalu low-poly. Selain itu isi portofolio lama (Framer) perlu pindah ke Sanity agar situs baru tidak kosong. Portofolio melayani dua audiens: recruiter/engineering manager (butuh resume, stack, project) dan klien freelance (butuh layanan, cara bekerja, ajakan menghubungi).

## Keputusan pemilik
- Model diambil dari Sketchfab. Pemilik yang mengunduh (butuh login); saya yang menyiapkan, mengoptimasi, dan memasang.
- Set meja yang dipilih: **"Modern PC Desk Setup - 3D Model"** oleh Fahriyan Fikri Pradana, CC BY 4.0, https://sketchfab.com/3d-models/modern-pc-desk-setup-3d-model-a02e91614dbe4f15b667ba80244e96a9. File sudah ada di `_assets/desk-source/modern_pc_desk_setup_-_3d_model.glb` (GLB converted, tekstur 2k).
- Konten berasal dari https://iqbalamsyahs.framer.website/ (halaman utama, /services, /contact).
- Audiens: recruiter dan klien freelance, keduanya.

## Tujuan
- Model yang jauh lebih detail secara visual namun tetap ringan: 60 FPS di desktop, set meja total sekitar 15-25 rb face dan di bawah kira-kira 5 MB setelah optimasi.
- Objek-objek utama (meja, PC, monitor, keyboard, mouse, speaker) terpisah dan bisa diklik.
- Konten lama masuk ke Sanity, dengan field yang belum ada dibiarkan kosong atau memakai teks cadangan.
- Jalur cepat recruiter dan jalur klien sama-sama jelas.

## Bukan tujuan
- Mengunggah model lewat Sanity (tetap di `/public`, sesuai PRD).
- Memasukkan statistik, "Benefits", jumlah follower, atau angka jam kerja dari situs lama.
- Menulis ulang copy; teks tetap dalam bahasa Inggris seperti situs lama.

## Anti-tujuan
- Model detail tetapi scene patah-patah atau loading lama.
- Kredit pembuat model hilang (wajib karena CC-BY).
- Angka atau klaim yang tidak bisa dibuktikan ikut tampil sebagai fakta.

## Fakta model sumber (hasil pemeriksaan)
- 125.548 face, 54 mesh datar bernama generik (`Cube_0`, `Cylinder.012_16`, dst.), tanpa grup per objek. Pengelompokan harus ditebak dari posisi dan ukuran, lalu diverifikasi dengan melihat render.
- Sebaran face (tebakan): PC tower ~43 rb (8 kipas RGB @ 4.800), mouse ~33 rb, keyboard ~29 rb, meja ~8 rb, monitor ultrawide ~100, speaker ~5 rb.
- Ada lantai kayu 39 x 38 unit (dibuang) dan animasi `mouseAction` (dibuang kecuali diinginkan).
- Skala ~10x lebih besar dari scene sekarang (meja 16 unit vs 1,5 m). Monitor ultrawide (~2:1).
- Buku, whiteboard, dan phone tidak ada di set ini.

## Pemetaan konten ke Sanity
| Situs lama | Tujuan | Catatan |
|---|---|---|
| Iqbal Alamsyah, tagline "Experienced web developer from Bandung…" | `profile.name`, `heroTagline`, `bio` | nama lengkap Muhammad Iqbal Alamsyah Sanjaya |
| Aegislabs, 2021-sekarang | `experience` | jabatan di situs ganda ("IT Consultant" dan "Frontend Web Developer"); perlu keputusan pemilik |
| 20 item stack | `profile.stack` | kategori Database ditambahkan; library (Redux, Pinia, Axios) masuk Framework atau Tool |
| 4 layanan (Web Dev, Landing Page Dev, CMS Dev, API Integration) | `profile.services` | deskripsi API Integration di situs lama keliru (isinya soal performa), ditulis ulang |
| 6 project: CMMS, New Virtual Cubicle, Landing Page Vyneapple, Web Apps Vyneapple, CMS Vyneapple, Mindtrex Academy | `project` | screenshot diambil dari Framer lalu diunggah; role/highlights/outcomes kosong sampai pemilik mengisi; dua project PLN memakai alamat dev/internal, tautan dilewati |
| Email, LinkedIn, Instagram, X, Facebook | `profile.contact` | label "Dribbble" di situs lama sebenarnya Facebook; tanpa jumlah follower |
| FAQ 8 pertanyaan | `profile.faq` (baru) | termasuk termin pembayaran |
| Foto profil | `profile.photo` (baru) | dipakai di layar About |
| "Available for work" + jam WIB | `profile.availability` (baru) | badge kecil di HUD |
| "Schedule Call" | `profile.contact.bookingUrl` (baru) | di situs lama hanya tautan cal.com generik; perlu tautan asli |
| CV/resume | `profile.resume` file (baru) | tidak ada di situs lama |

## Struktur untuk dua audiens
- HUD punya dua tombol: **Resume** (recruiter) dan **Hire me** (klien; membuka kontak/jadwal).
- Perjalanan 3D ringkas: tahap whiteboard berisi tab Stack dan Services; FAQ ada di Standard View.
- Standard View (2D) memuat layanan lengkap, FAQ, semua project, dan resume.

## Keputusan saya (bukan dari pemilik, mohon dicek)
- Buku, whiteboard, dan phone diambil dari kandidat Sketchfab yang sudah dijaring (book folded and unfolded, Whiteboards +, iPhone 13 Pro Max), diverifikasi visual dulu; kalau gayanya tidak menyatu dengan set meja, model lama dipertahankan sementara untuk objek itu.
- Layar showcase di monitor disesuaikan ke rasio ultrawide.
- Stack: tambah kategori Database, library digabung ke Framework/Tool.
- Bahasa konten: Inggris.
- Impor ke Sanity lewat file NDJSON yang dijalankan pemilik dengan akun Sanity sendiri (`sanity dataset import`), tanpa token dibagikan.
- Kredit pembuat model ditaruh di halaman atau footer "Credits".

## Keputusan tambahan saya (setelah pemeriksaan pembangun, mohon dicek)
- **Anggaran:** untuk seluruh scene (semua objek, termasuk buku, whiteboard, phone), sekitar 40 rb face dan di bawah kira-kira 8 MB. Set meja mendapat 15-25 rb face dari jatah itu.
- **Pemisahan 3D dan 2D:** tidak berubah dari yang sudah ada. Di layar >= 768 px dengan WebGL tersedia, tampil scene 3D; selain itu, atau lewat tombol "Standard View", tampil halaman 2D. Mobile tidak pernah mengunduh GLB; scene dimuat lewat dynamic import hanya di jalur desktop.
- **Panel konten:** Stack, Services, dan konten lain di 3D tampil sebagai panel HTML di atas canvas (seperti modal sekarang). Whiteboard hanyalah jangkar visual dan boleh memakai model lama bila kandidat baru ditolak; tidak ada konten yang bergantung pada model whiteboard tertentu.
- **Field kosong:** tombol Resume disembunyikan bila tidak ada berkas. "Hire me" memakai `mailto:` ke email profil bila `bookingUrl` kosong. Kartu project tanpa role, highlights, atau outcomes tetap tampil dan bagian yang kosong tidak dirender. Project tanpa tautan tidak menampilkan tombol tautan.
- **Verifikasi pengelompokan mesh:** saya yang memeriksa, dengan membuat render berlabel per kelompok mesh. Kelompok dianggap benar bila tiap kelompok hanya berisi satu objek yang jelas. Bila ada yang tercampur, saya memakai pemetaan manual per nama mesh sebagai cadangan.
- **Persetujuan visual:** pemilik melihat hasil di localhost dan menyetujui. Tolok ukurnya: terlihat jelas lebih detail dari model lama dan scene tetap lancar di perangkat pemilik.
- **Kredit CC-BY:** halaman/footer "Credits" memuat judul, pembuat, tautan sumber, dan lisensi untuk setiap model. Tautan kecil ke sana di HUD sudah cukup. Semua kandidat lain (buku, whiteboard, iPhone) memang dijaring dengan filter lisensi CC-BY, jadi pola kreditnya sama.
- **Impor Sanity:** skema baru harus di-deploy ke Studio lebih dulu. Impor pertama dijalankan ke dataset uji (bukan produksi), diperiksa di Studio, baru diulang ke dataset utama. Urutan tepatnya disusun di rencana.

## Keputusan pemilik terbaru (disetujui 2026-11-12)
- Dokumen ini disetujui dan dikerjakan lebih dulu; proyek scroll menyusul setelahnya.
- Jabatan: **Frontend Web Developer**.
- Tautan Cal.com: **belum dipakai**. "Hire me" memakai `mailto:` sampai ada tautan jadwal asli.
- Putar bebas selama perjalanan scroll: **dibatasi** (berlaku di proyek scroll).

## Menyusul (tidak menghalangi rencana)
- Role, highlights, dan outcomes untuk tiap project; apakah project PLN boleh ditampilkan dan dengan tautan atau tidak.
- Berkas CV (tombol Resume disembunyikan sampai ada).

## Diserahkan ke pembangun
- Prosedur memecah dan mengelompokkan mesh (skrip, bukan manual berulang) serta target decimation per objek.
- Format tekstur akhir (WebP/KTX2) dan kompresi mesh (Draco atau meshopt).
- Penskalaan dan kalibrasi ulang `MODEL_LAYOUT`, `ZOOM_VIEWS`, dan `SCREENS`.
- Bentuk persis field Sanity baru dan GROQ query-nya.
