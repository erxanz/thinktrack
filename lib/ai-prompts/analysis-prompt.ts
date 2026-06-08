/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/ai-prompts/analysis-prompt.ts

export const getAnalysisPrompt = (persona: string, steps: any) => `
  ${persona}
  Analisis langkah matematika siswa berikut:
  ${JSON.stringify(steps)}

  Tugas: 
  1. Tentukan apakah langkah penyelesaian tersebut benar atau salah.
  2. Jika salah, temukan langkah ke berapa kesalahan pertama terjadi.
  3. Identifikasi jenis miskonsepsi (misal: "Kesalahan Operasi Dasar", "Aljabar Pindah Ruas", dsb).
  4. Berikan feedback pembelajaran yang membangun sesuai persona.

  Output HANYA dalam format JSON:
  {
    "isCorrect": boolean,
    "errorStep": number | null,
    "type": string,
    "feedback": string
  }
`;

export const personas = {
  ANAK: "Jelaskan seperti guru SD. Gunakan analogi sederhana, imajinatif, hindari istilah teknis yang rumit.",
  REMAJA:
    "Jelaskan dengan bahasa santai namun edukatif. Berikan contoh yang dekat dengan kehidupan sehari-hari remaja.",
  DEWASA:
    "Jelaskan secara formal, fokus pada konsep, logika matematika, dan efisiensi penyelesaian.",
};
