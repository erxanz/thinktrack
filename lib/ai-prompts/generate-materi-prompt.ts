export interface GenerateTopicParams {
  title: string;
  cognitiveMode?: string;
  numSubtopics?: number;
  numExercisesPerSubtopic?: number;
}

export const generateTopicPrompt = ({
  title,
  cognitiveMode = "BALANCED",
  numSubtopics = 5,
  numExercisesPerSubtopic = 2, // Default diturunkan ke 2 agar JSON lebih ringan
}: GenerateTopicParams) => {
  let modeInstruction = "";

  if (cognitiveMode === "FAST") {
    modeInstruction = `
      PENDEKATAN: Direct Instruction & Microlearning.
      - ROADMAP: Buat materi sangat ringkas dan langsung ke inti.
      - ISI MATERI: Gunakan banyak bullet points dan kesimpulan cepat. Hindari paragraf panjang.
    `;
  } else if (cognitiveMode === "TEACHER") {
    modeInstruction = `
      PENDEKATAN: Inquiry-Based Learning & Socratic Method.
      - ROADMAP: Pecah konsep secara bertahap dan logis.
      - ISI MATERI: Sajikan materi dengan menyisipkan analogi dan pertanyaan pemantik di tengah teks agar merangsang siswa berpikir kritis, namun tetap dikemas secara ringkas dan tidak bertele-tele.
    `;
  } else {
    // Default: BALANCED
    modeInstruction = `
      PENDEKATAN: Guided Scaffolding & ZPD.
      - ROADMAP: Alur standar yang seimbang.
      - ISI MATERI: Struktur materi mengalir: Pengenalan singkat -> Konsep Inti -> 1 Contoh Penerapan Terstruktur.
    `;
  }

  return `
    Anda adalah sistem AI ThinkTrack EdTech tingkat lanjut.
    Tugas Anda adalah membuat ROADMAP, ISI MATERI, dan LATIHAN SOAL untuk topik: "${title}".
    
    Instruksi Khusus Mode Belajar Pengguna:
    - Target Jumlah Sub-Bab: TEPAT ${numSubtopics} Modul.
    - Jumlah Latihan Soal per Sub-Bab: TEPAT ${numExercisesPerSubtopic} Soal.
    - Gaya Bahasa & Kedalaman: ${modeInstruction}

    PENTING - ATURAN PANJANG MATERI & FORMAT JSON:
    1. Bagian "content" berisi materi pembelajaran yang cukup lengkap dan siap baca, namun **JANGAN TERLALU PANJANG**. Buatlah padat, ringkas, dan langsung pada esensi penting materi.
    2. DILARANG KERAS menggunakan tanda kutip ganda (") di dalam teks string materi/soal. Jika butuh tanda kutip, wajib gunakan KUTIP TUNGGAL (') saja!
    3. DILARANG KERAS menekan Enter (baris baru literal) di dalam teks JSON. Gunakan karakter '\\n\\n' untuk memisahkan paragraf.
    4. Rumus LaTeX wajib dibungkus blok ganda ($$ ... $$) dan gunakan double backslash (contoh: \\\\frac{1}{2}, \\\\rightarrow).

    Kembalikan hasil HANYA dalam format JSON dengan struktur array objek berikut tanpa bungkusan backtick (\`\`\`json):
    {
      "subtopics": [
        {
          "title": "Judul spesifik sub-topik",
          "content": "ISI MATERI MEDIUM (Ringkas, padat, gunakan Markdown, rumus LaTeX ganda, TANPA kutip ganda, sesuai mode kognitif)",
          "level": "BEGINNER | INTERMEDIATE | ADVANCED",
          "exercises": [
            {
              "type": "pilihan ganda",
              "question": "Pertanyaan soal (Sertakan A. opsi B. opsi C. opsi D. opsi di dalam teks pertanyaan)",
              "answer": "Kunci jawaban benar (contoh: A)",
              "explanation": "Penjelasan ringkas mengapa jawaban tersebut benar"
            }
          ]
        }
      ]
    }
  `;
};