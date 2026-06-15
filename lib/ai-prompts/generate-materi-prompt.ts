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
}: GenerateTopicParams) => {
  let modeInstruction = "";

  // Logika Adaptive Cognitive Scaffolding
  if (cognitiveMode === "FAST") {
    modeInstruction = "PENDEKATAN: Direct Instruction & Microlearning. Buat materi sangat ringkas, langsung ke inti (to-the-point), dan efisien untuk dihafal (LOTS).";
  } else if (cognitiveMode === "TEACHER") {
    modeInstruction = "PENDEKATAN: Inquiry-Based Learning & Socratic Method. Pecah konsep menjadi sangat detail, pelan, dan bertahap. Sisipkan pertanyaan pemantik untuk merangsang pemikiran kritis (HOTS).";
  } else {
    // Default: BALANCED
    modeInstruction = "PENDEKATAN: Guided Scaffolding & ZPD. Seimbangkan antara penjelasan teori dan contoh penerapan praktis secara terstruktur (MOTS).";
  }

  return `
    Anda adalah sistem AI ThinkTrack EdTech tingkat lanjut.
    Buatkan roadmap kurikulum pembelajaran (dekomposisi materi) untuk topik: "${title}".
    
    Instruksi Khusus Mode Belajar Pengguna:
    - Target Jumlah Sub-Bab: TEPAT ${numSubtopics} Modul.
    - Gaya Bahasa: ${modeInstruction}

    Kembalikan hasil HANYA dalam format JSON dengan struktur array objek persis seperti berikut tanpa tambahan teks markdown lain:
    {
      "subtopics": [
        {
          "title": "Judul spesifik sub-topik",
          "content": "Penjelasan singkat tentang apa yang akan dipelajari di sub-bab ini",
          "level": "BEGINNER | INTERMEDIATE | ADVANCED"
        }
      ]
    }
    Pastikan array berisi tepat ${numSubtopics} item sesuai instruksi mode di atas.
  `;
};

// Prompt untuk meng-generate isi detail teks materi
export const generateSubtopicContentPrompt = (topicTitle: string, subtopicTitle: string, cognitiveMode: string = "BALANCED") => {
  let contentStyle = "";

  if (cognitiveMode === "FAST") {
    contentStyle = "Gunakan banyak bullet points, bold pada kata kunci, dan tabel jika perlu. Hindari paragraf panjang. Langsung berikan rumus/fakta inti.";
  } else if (cognitiveMode === "TEACHER") {
    contentStyle = "Jangan langsung memberikan semua jawaban. Gunakan paragraf yang merangsang siswa berpikir, berikan analogi mendalam, dan akhiri setiap segmen dengan pertanyaan refleksi kecil (Socratic dialectic).";
  } else {
    contentStyle = "Gunakan paragraf yang mudah dibaca dengan alur: Pengenalan -> Konsep Inti -> Contoh Kasus.";
  }

  return `
    Buatkan isi materi pembelajaran mendalam untuk sub-bab: "${subtopicTitle}" yang merupakan bagian dari topik besar "${topicTitle}".
    
    Gaya Penyampaian Materi:
    ${contentStyle}
    
    PENTING: Untuk penulisan angka, rumus matematika, atau persamaan, WAJIB dibungkus menggunakan LaTeX blok ganda ($$ ... $$) agar ter-render dengan baik di UI pengguna.
    Sajikan materi menggunakan format Markdown yang rapi.
  `;
};