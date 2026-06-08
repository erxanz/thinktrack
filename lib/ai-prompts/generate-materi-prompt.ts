export type GenerateMateriInput = {
  title: string;
  cognitiveMode?: string;
  numSubtopics?: number;
  numExercisesPerSubtopic?: number;
};

export const getGenerateMateriPrompt = ({
  title,
  cognitiveMode = "REMAJA",
  numSubtopics = 3,
  numExercisesPerSubtopic = 3,
}: GenerateMateriInput) => `
Kamu adalah asisten pembuat materi edukasi matematika.

Mode kognitif user: ${cognitiveMode}
Judul materi/topik: ${title}

Tugas:
1) Buat dekomposisi sub-bab sebanyak ${numSubtopics}.
2) Untuk setiap sub-bab, buat latihan soal sebanyak ${numExercisesPerSubtopic}.

Aturan penting:
- Output WAJIB JSON valid (tanpa markdown codeblock).
- Bahasa menyesuaikan cognitiveMode.
- Sub-bab harus saling berurutan (roadmap mini).
- Latihan berupa soal yang jelas dan dapat dikerjakan.
- Setiap latihan harus punya: type, question, answer, explanation.

Skema JSON:
{
  "subtopics": [
    {
      "title": string,
      "level": "Mudah" | "Menengah" | "Sulit",
      "content": string,
      "exercises": [
        {
          "type": string,
          "question": string,
          "answer": string,
          "explanation": string
        }
      ]
    }
  ]
}
`;

