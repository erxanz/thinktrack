/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownPreview from "@/components/notes/MarkdownPreview";
import {
  FiPlus,
  FiSave,
  FiFileText,
  FiChevronRight,
  FiLayout,
  FiCode,
  FiType,
  FiList,
  FiMessageSquare,
  FiHash,
  FiTerminal,
  FiSidebar,
  FiStar,
  FiEye,
  FiEdit2,
  FiColumns,
  FiDownload,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AIAssistant from "./AIAssistant";

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "quote"
  | "bullet"
  | "code";

type Block = {
  id: string;
  type: BlockType;
  text: string;
};

interface NotionEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  editorMode: "notion";
  initialPinned: boolean;
  initialStatus: "draft" | "active" | "archived";
  initialTags: string[];
  onToggleEditorMode: (nextMode: "text" | "notion") => void;
}


const BLOCK_OPTIONS: Array<{
  type: BlockType;
  label: string;
  description: string;
}> = [
  { type: "paragraph", label: "Text", description: "Paragraf biasa" },
  { type: "heading1", label: "Heading 1", description: "Judul besar" },
  { type: "heading2", label: "Heading 2", description: "Subjudul" },
  { type: "quote", label: "Quote", description: "Blok kutipan" },
  { type: "bullet", label: "Bullet", description: "Daftar poin" },
  { type: "code", label: "Code", description: "Blok kode" },
];

const QUICK_ACTIONS: Array<{
  type: BlockType;
  label: string;
}> = [
  { type: "paragraph", label: "Text" },
  { type: "heading1", label: "Heading 1" },
  { type: "heading2", label: "Heading 2" },
  { type: "bullet", label: "List" },
  { type: "quote", label: "Quote" },
  { type: "code", label: "Code" },
];

const NOTE_TEMPLATES: Array<{
  key: string;
  label: string;
  description: string;
  title: string;
  blocks: Array<{ type: BlockType; text: string }>;
}> = [
  {
    key: "meeting",
    label: "Meeting Notes",
    description: "Agenda, catatan, dan action items",
    title: "Meeting Notes",
    blocks: [
      { type: "heading1", text: "Meeting Notes" },
      { type: "paragraph", text: "Tanggal: " },
      { type: "heading2", text: "Agenda" },
      { type: "bullet", text: "Poin 1" },
      { type: "bullet", text: "Poin 2" },
      { type: "heading2", text: "Action Items" },
      { type: "bullet", text: "Tugas 1" },
      { type: "bullet", text: "Tugas 2" },
    ],
  },
  {
    key: "study",
    label: "Study Notes",
    description: "Ringkasan pelajaran dengan poin penting",
    title: "Study Notes",
    blocks: [
      { type: "heading1", text: "Study Notes" },
      { type: "paragraph", text: "Mata pelajaran: " },
      { type: "heading2", text: "Ringkasan" },
      { type: "bullet", text: "Konsep penting" },
      { type: "bullet", text: "Contoh" },
      { type: "heading2", text: "Pertanyaan" },
      { type: "quote", text: "Hal yang masih perlu dipahami" },
    ],
  },
  {
    key: "journal",
    label: "Daily Journal",
    description: "Catatan harian singkat dan refleksi",
    title: "Daily Journal",
    blocks: [
      { type: "heading1", text: "Daily Journal" },
      { type: "paragraph", text: "Hari ini saya..." },
      { type: "heading2", text: "Yang terjadi" },
      { type: "paragraph", text: "" },
      { type: "heading2", text: "Yang saya rasakan" },
      { type: "quote", text: "" },
    ],
  },
  {
    key: "sinta_journal_review",
    label: "Review Jurnal Sinta",
    description:
      "Format detail untuk mereview dan menganalisis artikel dari Jurnal Sinta",
    title: "Review Jurnal Sinta",
    blocks: [
      { type: "heading1", text: "Review Jurnal Sinta" },
      { type: "heading2", text: "1. Identitas Jurnal" },
      { type: "bullet", text: "Judul Artikel: " },
      { type: "bullet", text: "Penulis: " },
      { type: "bullet", text: "Nama Jurnal: " },
      { type: "bullet", text: "Vol / No / Tahun / Halaman: " },
      {
        type: "bullet",
        text: "Peringkat Sinta: (Sinta 1 / 2 / 3 / 4 / 5 / 6)",
      },
      { type: "bullet", text: "DOI / Link URL: " },
      { type: "bullet", text: "Reviewer & Tanggal Review: " },
      { type: "heading2", text: "2. Latar Belakang & Masalah Penelitian" },
      {
        type: "paragraph",
        text: "Tuliskan ringkasan fenomena, masalah utama, atau 'research gap' yang melatarbelakangi penelitian ini...",
      },
      { type: "heading2", text: "3. Tujuan Penelitian" },
      {
        type: "paragraph",
        text: "Apa yang ingin dicapai, diselesaikan, atau dibuktikan oleh peneliti melalui jurnal ini?",
      },
      { type: "heading2", text: "4. Tinjauan Pustaka / Landasan Teori" },
      { type: "bullet", text: "Teori atau Konsep utama yang digunakan: " },
      { type: "bullet", text: "Hubungan antar variabel (jika ada): " },
      { type: "heading2", text: "5. Metodologi Penelitian" },
      {
        type: "bullet",
        text: "Jenis Penelitian: (Kualitatif / Kuantitatif / Mix Method)",
      },
      { type: "bullet", text: "Populasi & Sampel / Subjek Penelitian: " },
      {
        type: "bullet",
        text: "Teknik Pengumpulan Data: (Kuesioner, Wawancara, Observasi, dll)",
      },
      {
        type: "bullet",
        text: "Alat & Teknik Analisis Data: (Misal: SPSS, PLS, Analisis Wacana, dll)",
      },
      { type: "heading2", text: "6. Hasil dan Pembahasan" },
      {
        type: "paragraph",
        text: "Jelaskan temuan utama dari penelitian ini. Apakah hipotesis terbukti? Bagaimana peneliti mengaitkan hasil temuan dengan teori yang ada?",
      },
      { type: "heading2", text: "7. Kelebihan Jurnal" },
      { type: "bullet", text: "Kebaruan (Novelty) penelitian..." },
      { type: "bullet", text: "Metodologi yang terstruktur dan kuat..." },
      { type: "bullet", text: "Penulisan dan referensi yang relevan..." },
      { type: "heading2", text: "8. Kekurangan / Keterbatasan Jurnal" },
      { type: "bullet", text: "Keterbatasan sampel atau cakupan area..." },
      {
        type: "bullet",
        text: "Variabel yang tidak dimasukkan / tidak diuji...",
      },
      { type: "bullet", text: "Aspek teknis penulisan (typo, bahasa, dll)..." },
      { type: "heading2", text: "9. Kesimpulan & Rekomendasi Reviewer" },
      {
        type: "paragraph",
        text: "Tuliskan kesimpulan akhir Anda terhadap jurnal ini. Apa saran (Future Research) untuk peneliti selanjutnya?",
      },
      { type: "heading2", text: "Refleksi Pribadi" },
      {
        type: "quote",
        text: "Gagasan baru atau insight (wawasan) yang saya dapatkan dari jurnal ini adalah...",
      },
    ],
  },
  {
    key: "todo",
    label: "To-do List",
    description: "Daftar tugas sederhana untuk pemula",
    title: "To-do List",
    blocks: [
      { type: "heading1", text: "To-do List" },
      { type: "bullet", text: "Tugas 1" },
      { type: "bullet", text: "Tugas 2" },
      { type: "bullet", text: "Tugas 3" },
      { type: "heading2", text: "Catatan" },
      { type: "paragraph", text: "" },
    ],
  },
  {
    key: "lab_report",
    label: "Laporan Praktikum (TI)",
    description: "Format standar untuk laporan praktikum mahasiswa IT",
    title: "Laporan Praktikum",
    blocks: [
      { type: "heading1", text: "Laporan Praktikum" },
      { type: "bullet", text: "Mata Kuliah: " },
      { type: "bullet", text: "Modul ke-: " },
      { type: "bullet", text: "Judul Praktikum: " },
      { type: "heading2", text: "1. Tujuan Praktikum" },
      { type: "bullet", text: "Memahami konsep..." },
      { type: "bullet", text: "Mampu mengimplementasikan..." },
      { type: "heading2", text: "2. Alat dan Bahan (Tech Stack)" },
      { type: "bullet", text: "Sistem Operasi: " },
      { type: "bullet", text: "Software / IDE: " },
      { type: "bullet", text: "Bahasa Pemrograman: " },
      { type: "heading2", text: "3. Langkah Percobaan & Source Code" },
      {
        type: "paragraph",
        text: "Jelaskan alur pengerjaan dan lampirkan snippet kode utama di bawah ini:",
      },
      { type: "quote", text: "// Masukkan source code penting di sini" },
      { type: "heading2", text: "4. Hasil dan Pembahasan" },
      {
        type: "paragraph",
        text: "Jelaskan output dari kode yang dijalankan. Apakah ada error? Bagaimana cara mengatasinya?",
      },
      { type: "heading2", text: "5. Kesimpulan" },
      {
        type: "paragraph",
        text: "Kesimpulan dari praktikum hari ini adalah...",
      },
    ],
  },
  {
    key: "api_documentation",
    label: "API Documentation",
    description: "Spesifikasi endpoint untuk Backend Developer",
    title: "API Documentation",
    blocks: [
      { type: "heading1", text: "API Endpoint: [Nama Fitur]" },
      {
        type: "paragraph",
        text: "Deskripsi singkat mengenai fungsi endpoint ini.",
      },
      { type: "heading2", text: "1. Request Details" },
      { type: "bullet", text: "URL: /api/v1/..." },
      { type: "bullet", text: "Method: GET / POST / PUT / PATCH / DELETE" },
      { type: "bullet", text: "Authentication: Bearer Token / None" },
      { type: "heading2", text: "2. Request Parameters / Body" },
      {
        type: "paragraph",
        text: "Jelaskan payload yang dibutuhkan (JSON format):",
      },
      { type: "quote", text: '{\n  "key": "value"\n}' },
      { type: "heading2", text: "3. Response (Success 200 OK)" },
      { type: "quote", text: '{\n  "status": "success",\n  "data": {}\n}' },
      { type: "heading2", text: "4. Response (Error 4xx / 5xx)" },
      {
        type: "quote",
        text: '{\n  "status": "error",\n  "message": "Error description"\n}',
      },
      { type: "heading2", text: "Catatan Tambahan" },
      {
        type: "paragraph",
        text: "Rate limiting, dependensi, atau peringatan khusus.",
      },
    ],
  },
  {
    key: "incident_post_mortem",
    label: "DevOps Post-Mortem",
    description: "Laporan analisis insiden server/layanan down",
    title: "Incident Post-Mortem",
    blocks: [
      { type: "heading1", text: "Incident Post-Mortem" },
      { type: "bullet", text: "Tanggal Insiden: " },
      { type: "bullet", text: "Status Saat Ini: Resolved / Investigating" },
      { type: "bullet", text: "Severity: Low / Medium / High / Critical" },
      { type: "heading2", text: "1. Ringkasan Insiden (Summary)" },
      {
        type: "paragraph",
        text: "Apa yang terjadi? Berapa lama layanan down? Fitur apa saja yang terdampak?",
      },
      { type: "heading2", text: "2. Timeline Kejadian" },
      {
        type: "bullet",
        text: "[00:00] - Insiden mulai terdeteksi (Alert muncul)",
      },
      { type: "bullet", text: "[00:15] - Investigasi awal dimulai" },
      { type: "bullet", text: "[00:45] - Layanan kembali normal" },
      { type: "heading2", text: "3. Akar Masalah (Root Cause)" },
      {
        type: "paragraph",
        text: "Jelaskan secara teknis mengapa insiden ini bisa terjadi (misal: memori penuh, konfigurasi Nginx salah, database deadlock).",
      },
      { type: "heading2", text: "4. Resolusi (Resolution)" },
      {
        type: "paragraph",
        text: "Langkah apa yang diambil untuk memulihkan layanan pada saat kejadian?",
      },
      { type: "heading2", text: "5. Action Items (Pencegahan)" },
      {
        type: "bullet",
        text: "TODO: Tambahkan monitoring alert untuk metrik X",
      },
      { type: "bullet", text: "TODO: Refactor query Y agar tidak lambat" },
    ],
  },
  {
    key: "frontend_bug_report",
    label: "Frontend Bug Report",
    description: "Format laporan bug UI/UX yang detail dan mudah direproduksi",
    title: "Frontend Bug Report",
    blocks: [
      { type: "heading1", text: "Bug Report: [Judul Singkat Bug]" },
      { type: "heading2", text: "1. Informasi Environment" },
      { type: "bullet", text: "OS: Windows / macOS / Linux / iOS / Android" },
      { type: "bullet", text: "Browser: Chrome / Safari / Firefox (Versi)" },
      {
        type: "bullet",
        text: "Resolusi Layar: (misal: 1920x1080 atau Mobile View)",
      },
      {
        type: "heading2",
        text: "2. Langkah-Langkah Reproduksi (Steps to Reproduce)",
      },
      { type: "bullet", text: "1. Buka halaman..." },
      { type: "bullet", text: "2. Klik tombol..." },
      { type: "bullet", text: "3. Scroll ke bagian..." },
      { type: "heading2", text: "3. Perilaku yang Terjadi (Actual Behavior)" },
      {
        type: "paragraph",
        text: "Jelaskan error atau tampilan yang rusak saat ini.",
      },
      {
        type: "heading2",
        text: "4. Perilaku yang Diharapkan (Expected Behavior)",
      },
      {
        type: "paragraph",
        text: "Jelaskan bagaimana seharusnya fitur atau tampilan tersebut bekerja menurut desain Figma/Spesifikasi.",
      },
      { type: "heading2", text: "5. Console Logs / Error Messages" },
      {
        type: "quote",
        text: "Copy paste pesan error dari Chrome DevTools (Console/Network) di sini jika ada.",
      },
    ],
  },
  {
    key: "daily_standup",
    label: "Daily Standup Notes",
    description:
      "Catatan harian tim pengembang untuk melacak progres dan hambatan (Agile/Scrum)",
    title: "Daily Standup Notes",
    blocks: [
      { type: "heading1", text: "Daily Standup Notes" },
      { type: "paragraph", text: "Tanggal: " },
      { type: "bullet", text: "Sprint ke-: " },

      {
        type: "heading2",
        text: "1. Apa yang selesai kemarin? (What did I do yesterday?)",
      },
      {
        type: "bullet",
        text: "[Nama/Role]: Menyelesaikan slicing halaman login frontend",
      },
      {
        type: "bullet",
        text: "[Nama/Role]: setup database migrasi dan dockerize backend",
      },

      {
        type: "heading2",
        text: "2. Apa yang akan dikerjakan hari ini? (What will I do today?)",
      },
      {
        type: "bullet",
        text: "[Nama/Role]: Integrasi API login dengan frontend",
      },
      {
        type: "bullet",
        text: "[Nama/Role]: Membuat endpoint CRUD untuk manajemen user",
      },

      { type: "heading2", text: "3. Hambatan / Kendala (Blockers)" },
      {
        type: "bullet",
        text: "Frontend: Tertahan karena spec API payment belum fix",
      },
      {
        type: "bullet",
        text: "DevOps: Server staging sempat down karena kehabisan storage",
      },

      { type: "heading2", text: "Catatan Koordinasi" },
      {
        type: "paragraph",
        text: "Poin penting atau jadwal meeting kecil setelah standup selesai (Follow-up sesh).",
      },
    ],
  },
  {
    key: "sprint_retrospective",
    label: "Sprint Retrospective",
    description:
      "Evaluasi akhir sprint untuk meningkatkan performa tim Dev, Frontend, Backend & DevOps",
    title: "Sprint Retrospective",
    blocks: [
      { type: "heading1", text: "Sprint Retrospective: [Nama/Angka Sprint]" },
      { type: "paragraph", text: "Tanggal Evaluasi: " },
      { type: "bullet", text: "Fasilitator (Scrum Master / PM): " },

      {
        type: "heading2",
        text: "1. Apa yang berjalan dengan baik? (What went well?)",
      },
      {
        type: "bullet",
        text: "CI/CD pipeline sudah jalan otomatis, deploy ke staging jadi lebih cepat.",
      },
      {
        type: "bullet",
        text: "Komunikasi antara Frontend dan Backend sangat responsif di Slack/Discord.",
      },

      {
        type: "heading2",
        text: "2. Apa yang bisa ditingkatkan? (What can be improved?)",
      },
      {
        type: "bullet",
        text: "Estimasi story point tugas backend sering meleset karena kurang detailnya spec awal.",
      },
      {
        type: "bullet",
        text: "Review Pull Request (PR) sering menumpuk di akhir sprint.",
      },

      {
        type: "heading2",
        text: "3. Hal yang harus dihentikan (What to STOP doing?)",
      },
      {
        type: "bullet",
        text: "Mengubah requirement fitur di tengah-tengah jalan tanpa persetujuan tim dev.",
      },
      {
        type: "bullet",
        text: "Push langsung ke branch 'main' atau 'develop' tanpa peer-review.",
      },

      {
        type: "heading2",
        text: "4. Aksi Nyata untuk Sprint Berikutnya (Action Items)",
      },
      {
        type: "bullet",
        text: "TODO: Buat aturan maksimal review PR adalah 24 jam setelah dibuat.",
      },
      {
        type: "bullet",
        text: "TODO: Lakukan backlog refinement lebih detail sebelum sprint planning dimulai.",
      },

      { type: "heading2", text: "Kudos & Apresiasi" },
      {
        type: "quote",
        text: "Terima kasih kepada [Nama] karena sudah membantu menyelesaikan bug kritikal pada saat production deployment kemarin malam!",
      },
    ],
  },
  {
    key: "thesis_supervision",
    label: "Catatan Bimbingan Skripsi",
    description:
      "Log bimbingan, feedback dosen pembimbing, dan daftar revisi skripsi",
    title: "Catatan Bimbingan Skripsi",
    blocks: [
      { type: "heading1", text: "Catatan Bimbingan Skripsi" },
      { type: "bullet", text: "Tanggal Bimbingan: " },
      {
        type: "bullet",
        text: "Dosen Pembimbing: (Pembimbing 1 / Pembimbing 2)",
      },
      { type: "bullet", text: "Bab / Progress yang Dibahas: " },

      { type: "heading2", text: "1. Masukan & Feedback Dosen" },
      {
        type: "paragraph",
        text: "Tulis poin-poin kritikan, koreksi, atau saran dari dosen di sini saat bimbingan berlangsung...",
      },

      {
        type: "heading2",
        text: "2. Daftar Revisi yang Harus Dikerjakan (To-Do)",
      },
      {
        type: "bullet",
        text: "TODO: Perbaiki latar belakang, perkuat 'research gap' dan alasan memilih framework X.",
      },
      {
        type: "bullet",
        text: "TODO: Tambahkan sitasi jurnal Sinta 1-2 minimal 5 buah di Bab 2.",
      },
      {
        type: "bullet",
        text: "TODO: Perbaiki diagram UML (Sequence Diagram masih keliru di bagian logic backend).",
      },

      { type: "heading2", text: "3. Target untuk Bimbingan Berikutnya" },
      {
        type: "quote",
        text: "Target bimbingan tanggal [Tanggal]: Menyelesaikan revisi Bab 1-2 dan mendemonstrasikan progress coding Bab 4 (Fitur Utama).",
      },
    ],
  },
  {
    key: "thesis_it_outline",
    label: "Outline & Progress Skripsi TI",
    description:
      "Kerangka penulisan skripsi Teknik Informatika (Software Dev/Sistem Informasi) & pelacakan progress",
    title: "Outline & Progress Skripsi TI",
    blocks: [
      { type: "heading1", text: "Outline & Progress Skripsi TI" },
      { type: "bullet", text: "Judul Skripsi: " },
      {
        type: "bullet",
        text: "Status Keseluruhan: (Proposal / Penelitian / Pasca-Sidang)",
      },

      { type: "heading2", text: "BAB I: PENDAHULUAN" },
      { type: "bullet", text: "[ ] Latar Belakang & Research Gap" },
      {
        type: "bullet",
        text: "[ ] Rumusan Masalah, Batasan Masalah, & Tujuan",
      },

      { type: "heading2", text: "BAB II: TINJAUAN PUSTAKA" },
      {
        type: "bullet",
        text: "[ ] Penelitian Terdahulu (State of The Art / Matrix Jurnal)",
      },
      {
        type: "bullet",
        text: "[ ] Landasan Teori (Algoritma, Framework Frontend/Backend, Metode DevOps)",
      },

      {
        type: "heading2",
        text: "BAB III: METODOLOGI PENELITIAN / ANALISIS & DESAIN",
      },
      {
        type: "bullet",
        text: "[ ] Analisis Kebutuhan Sistem (Functional & Non-Functional Requirements)",
      },
      {
        type: "bullet",
        text: "[ ] Perancangan Sistem (UML: Use Case, Activity, Sequence / ERD / Arsitektur Cloud DevOps)",
      },
      {
        type: "bullet",
        text: "[ ] Perancangan Antarmuka (Wireframe / UI Design Figma)",
      },

      { type: "heading2", text: "BAB IV: IMPLEMENTASI & PENGUJIAN" },
      {
        type: "bullet",
        text: "[ ] Lingkungan Implementasi (Spesifikasi Server, Database, Staging Cloud)",
      },
      {
        type: "bullet",
        text: "[ ] Implementasi Kode (Backend API, UI Frontend, Pipeline CI/CD)",
      },
      {
        type: "bullet",
        text: "[ ] Pengujian Sistem (Blackbox Testing, Whitebox, UAT, atau Load Testing/Benchmark JMeter)",
      },

      { type: "heading2", text: "BAB V: KESIMPULAN & SARAN" },
      { type: "bullet", text: "[ ] Kesimpulan (Menjawab Rumusan Masalah)" },
      {
        type: "bullet",
        text: "[ ] Saran (Future Works untuk pengembangan sistem selanjutnya)",
      },

      { type: "heading2", text: "Resource & Tautan Penting" },
      {
        type: "paragraph",
        text: "Simpan semua link penting proyek skripsi Anda di bawah ini:",
      },
      { type: "bullet", text: "Repository GitHub/GitLab: " },
      { type: "bullet", text: "Link Figma (UI/UX Design): " },
      { type: "bullet", text: "URL Staging / Production (Demo Aplikasi): " },
      { type: "bullet", text: "Folder Google Drive (Kuesioner/Data Mentah): " },
    ],
  },
];

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createBlock(type: BlockType = "paragraph", text = ""): Block {
  return {
    id: createId(),
    type,
    text,
  };
}

function normalizeBlockText(text: string) {
  return text.replace(/\r\n/g, "\n");
}

function parseMarkdownToBlocks(content: string) {
  const lines = normalizeBlockText(content).split("\n");

  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];

      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(createBlock("code", codeLines.join("\n")));

      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(createBlock("heading1", line.slice(2)));

      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(createBlock("heading2", line.slice(3)));

      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(createBlock("quote", line.slice(2)));

      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      blocks.push(createBlock("bullet", line.slice(2)));

      index += 1;
      continue;
    }

    blocks.push(createBlock("paragraph", line));

    index += 1;
  }

  return blocks.length > 0 ? blocks : [createBlock()];
}

function serializeBlocks(blocks: Block[]) {
  return blocks
    .map((block) => {
      const text = normalizeBlockText(block.text).trimEnd();

      if (block.type === "heading1") {
        return `# ${text}`.trimEnd();
      }

      if (block.type === "heading2") {
        return `## ${text}`.trimEnd();
      }

      if (block.type === "quote") {
        return `> ${text}`.trimEnd();
      }

      if (block.type === "bullet") {
        return `- ${text}`.trimEnd();
      }

      if (block.type === "code") {
        return `\n\`\`\`text\n${text}\n\`\`\``.trim();
      }

      return text;
    })
    .filter((value) => value.length > 0)
    .join("\n\n");
}

function blockPlaceholder(type: BlockType) {
  switch (type) {
    case "heading1":
      return "Judul Halaman...";

    case "heading2":
      return "Subjudul...";

    case "quote":
      return "Tulis kutipan...";

    case "bullet":
      return "Poin daftar...";

    case "code":
      return "Tulis kode di sini...";

    default:
      return "Ketik sesuatu, atau tekan '/' untuk command...";
  }
}

function getCommandIcon(type: BlockType) {
  switch (type) {
    case "heading1":
      return <FiHash size={15} />;

    case "heading2":
      return <FiHash size={15} />;

    case "quote":
      return <FiMessageSquare size={15} />;

    case "bullet":
      return <FiList size={15} />;

    case "code":
      return <FiTerminal size={15} />;

    default:
      return <FiType size={15} />;
  }
}

export default function NotionEditor({
  noteId,
  initialTitle,
  initialContent,
  initialPinned,
  initialStatus,
  initialTags,
  onToggleEditorMode,
}: NotionEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [isHelperPanelOpen, setIsHelperPanelOpen] = useState(false);

  const [pinned, setPinned] = useState<boolean>(initialPinned);
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    initialStatus,
  );
  const [tagsInput, setTagsInput] = useState<string>(initialTags.join(", "));

  useEffect(() => {
    setPinned(initialPinned);
    setStatus(initialStatus);
    setTagsInput(initialTags.join(", "));
  }, [initialPinned, initialStatus, initialTags]);

  const parsedBlocks = useMemo(
    () => parseMarkdownToBlocks(initialContent),
    [initialContent],
  );

  const [blocks, setBlocks] = useState<Block[]>(parsedBlocks);

  const [isSaving, setIsSaving] = useState(false);

  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    "edit",
  );

  const [activeBlockId, setActiveBlockId] = useState(parsedBlocks[0]?.id ?? "");

  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);

  const [slashQuery, setSlashQuery] = useState("");

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    setBlocks(parsedBlocks);

    setActiveBlockId(parsedBlocks[0]?.id ?? "");
  }, [parsedBlocks]);

  const putNoteFields = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Error: ${res.status} ${res.statusText}`);
    }

    router.refresh();
  };

  const handleTogglePinned = async () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);

    try {
      await putNoteFields({ pinned: nextPinned });
      toast.success(nextPinned ? "Pinned" : "Unpinned");
    } catch {
      setPinned(!nextPinned);
      toast.error("Gagal mengubah pinned");
    }
  };

  const handleSetStatus = async (
    nextStatus: "draft" | "active" | "archived",
  ) => {
    setStatus(nextStatus);

    try {
      await putNoteFields({ status: nextStatus });
      toast.success("Status diperbarui");
    } catch {
      setStatus(status);
      toast.error("Gagal mengubah status");
    }
  };

  const handleApplyTags = async () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await putNoteFields({ tags });
      toast.success("Tags diperbarui");
    } catch {
      toast.error("Gagal mengubah tags");
    }
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }

    setIsSaving(true);

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content: serializeBlocks(blocks),
        editorMode: "notion",
      }),
    });

    setIsSaving(false);

    if (response.ok) {
      toast.success("Catatan disimpan!");
      router.refresh();
      return;
    }

    toast.error("Gagal menyimpan");
  }, [title, blocks, noteId, router]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, [handleSave]);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;

    setIsHelperPanelOpen(isDesktop);
  }, []);

  const filteredCommands = useMemo(() => {
    const query = slashQuery.trim().toLowerCase();

    if (!query) return BLOCK_OPTIONS;

    return BLOCK_OPTIONS.filter((item) => {
      return `${item.label} ${item.description} ${item.type}`
        .toLowerCase()
        .includes(query);
    });
  }, [slashQuery]);

  const moveBlock = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;

    setBlocks((currentBlocks) => {
      const draggedIndex = currentBlocks.findIndex(
        (block) => block.id === dragId,
      );

      const targetIndex = currentBlocks.findIndex(
        (block) => block.id === targetId,
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentBlocks;
      }

      const updatedBlocks = [...currentBlocks];

      const [draggedBlock] = updatedBlocks.splice(draggedIndex, 1);

      updatedBlocks.splice(targetIndex, 0, draggedBlock);

      return updatedBlocks;
    });
  };

  const focusBlock = (id: string) => {
    window.requestAnimationFrame(() => {
      blockRefs.current[id]?.focus();
    });
  };

  const updateBlock = (blockId: string, text: string) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === blockId ? { ...block, text } : block,
      ),
    );
  };

  const insertAIResult = (text: string) => {
    const aiBlocks = parseMarkdownToBlocks(text);

    setBlocks((currentBlocks) => {
      const index = currentBlocks.findIndex(
        (block) => block.id === currentBlockId,
      );

      if (index < 0) {
        return [...currentBlocks, ...aiBlocks];
      }

      const nextBlocks = [...currentBlocks];

      nextBlocks.splice(index + 1, 0, ...aiBlocks);

      return nextBlocks;
    });

    setActiveBlockId(aiBlocks[0]?.id ?? currentBlockId);

    focusBlock(aiBlocks[0]?.id ?? currentBlockId);
  };

  const replaceWithAIResult = (text: string) => {
    const aiBlocks = parseMarkdownToBlocks(text);

    setBlocks(aiBlocks);
    setActiveBlockId(aiBlocks[0]?.id ?? "");
    setSlashMenuBlockId(null);
    setSlashQuery("");

    focusBlock(aiBlocks[0]?.id ?? "");
  };

  const insertBlockAfter = (blockId: string, type: BlockType = "paragraph") => {
    const newBlock = createBlock(type);

    setBlocks((currentBlocks) => {
      const index = currentBlocks.findIndex((block) => block.id === blockId);

      if (index < 0) {
        return [...currentBlocks, newBlock];
      }

      const nextBlocks = [...currentBlocks];

      nextBlocks.splice(index + 1, 0, newBlock);

      return nextBlocks;
    });

    setActiveBlockId(newBlock.id);

    focusBlock(newBlock.id);
  };

  const handleQuickInsert = (type: BlockType) => {
    const anchorBlockId = currentBlockId || blocks[blocks.length - 1]?.id;

    if (!anchorBlockId) {
      const nextBlock = createBlock(type);

      setBlocks([nextBlock]);
      setActiveBlockId(nextBlock.id);
      focusBlock(nextBlock.id);

      return;
    }

    insertBlockAfter(anchorBlockId, type);
  };

  const applyTemplate = (template: (typeof NOTE_TEMPLATES)[number]) => {
    const hasOnlyEmptyBlock =
      blocks.length === 1 && blocks[0]?.text.trim() === "";
    const templateBlocks = template.blocks.map((block) =>
      createBlock(block.type, block.text),
    );

    if (hasOnlyEmptyBlock) {
      setBlocks(templateBlocks);
      setActiveBlockId(templateBlocks[0]?.id ?? "");

      if (!title.trim() || title === "Untitled-1") {
        setTitle(template.title);
      }

      focusBlock(templateBlocks[0]?.id ?? "");

      return;
    }

    const anchorBlockId = currentBlockId || blocks[blocks.length - 1]?.id;

    if (!anchorBlockId) {
      setBlocks(templateBlocks);
      setActiveBlockId(templateBlocks[0]?.id ?? "");
      setTitle(template.title);
      focusBlock(templateBlocks[0]?.id ?? "");

      return;
    }

    setBlocks((currentBlocks) => {
      const index = currentBlocks.findIndex(
        (block) => block.id === anchorBlockId,
      );

      if (index < 0) {
        return [...currentBlocks, ...templateBlocks];
      }

      const nextBlocks = [...currentBlocks];

      nextBlocks.splice(index + 1, 0, ...templateBlocks);

      return nextBlocks;
    });

    setActiveBlockId(templateBlocks[0]?.id ?? anchorBlockId);
    setTitle(template.title);

    focusBlock(templateBlocks[0]?.id ?? anchorBlockId);
  };

  const removeBlock = (blockId: string) => {
    setBlocks((currentBlocks) => {
      if (currentBlocks.length === 1) {
        const nextBlock = createBlock();

        setActiveBlockId(nextBlock.id);

        focusBlock(nextBlock.id);

        return [nextBlock];
      }

      const index = currentBlocks.findIndex((block) => block.id === blockId);

      if (index < 0) {
        return currentBlocks;
      }

      const nextBlocks = currentBlocks.filter((block) => block.id !== blockId);

      const fallback = nextBlocks[Math.max(0, index - 1)];

      setActiveBlockId(fallback?.id ?? nextBlocks[0]?.id ?? "");

      focusBlock(fallback?.id ?? nextBlocks[0]?.id ?? "");

      return nextBlocks;
    });
  };

  const applyBlockType = (blockId: string, type: BlockType) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              type,
              text: "",
            }
          : block,
      ),
    );

    setSlashMenuBlockId(null);

    setSlashQuery("");

    focusBlock(blockId);
  };

  const handleBlockChange = (blockId: string, text: string) => {
    updateBlock(blockId, text);

    if (text.startsWith("/")) {
      setSlashMenuBlockId(blockId);

      setSlashQuery(text.slice(1));

      return;
    }

    if (slashMenuBlockId === blockId) {
      setSlashMenuBlockId(null);

      setSlashQuery("");
    }
  };

  const handleBlockKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    block: Block,
  ) => {
    if (event.key === "Enter" && !event.shiftKey && block.type !== "code") {
      event.preventDefault();

      insertBlockAfter(block.id);

      return;
    }

    if (
      event.key === "Backspace" &&
      block.text.length === 0 &&
      blocks.length > 1
    ) {
      event.preventDefault();

      removeBlock(block.id);
    }
  };

  const currentBlockId = activeBlockId || blocks[0]?.id || "";

  // 1. Tambahkan Ref dan State untuk PDF
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 2. Tambahkan Fungsi Handler Download
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Membangun file PDF...");

    try {
      // 1. Import dinamis dan paksa objek pdfMake menjadi tipe 'any'
      const pdfMakeModule = (await import("pdfmake/build/pdfmake")).default;
      const pdfMake: any = pdfMakeModule;

      // Paksa hasil import vfs_fonts menjadi tipe 'any'
      const pdfFonts: any = (await import("pdfmake/build/vfs_fonts")).default;

      // 2. Kaitkan font bawaan (Sekarang aman dari komplain TypeScript)
      pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;

      // Fungsi internal untuk mengubah blocks menjadi struktur data pdfmake
      const parseBlocksToPdfMake = (inputBlocks: typeof blocks) => {
        const contentStructure: any[] = [];

        inputBlocks.forEach((block) => {
          if (!block.text.trim()) return;

          switch (block.type) {
            case "heading1":
              contentStructure.push({
                text: block.text,
                style: "h1",
                margin: [0, 15, 0, 5],
              });
              break;
            case "heading2":
              contentStructure.push({
                text: block.text,
                style: "h2",
                margin: [0, 12, 0, 4],
              });
              break;
            case "quote":
              contentStructure.push({
                text: block.text,
                style: "quote",
                margin: [0, 8, 0, 8],
              });
              break;
            case "bullet":
              contentStructure.push({
                ul: [block.text],
                style: "body",
                margin: [10, 2, 0, 2],
              });
              break;
            case "code":
              // Membuat kotak kode abu-abu terang ala GitHub
              contentStructure.push({
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: block.text,
                        style: "codeBlock",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [0, 8, 0, 8],
              });
              break;
            default: // Text biasa / paragraph
              contentStructure.push({
                text: block.text,
                style: "body",
                margin: [0, 0, 0, 6],
              });
              break;
          }
        });

        return contentStructure;
      };

      // Buat struktur konten berdasarkan data blocks asli aplikasi, bukan teks mentah
      const dynamicContent = parseBlocksToPdfMake(blocks);

      const docDefinition: any = {
        pageSize: "A4",
        pageMargins: [45, 60, 45, 60],

        // HAPUS fungsi 'background' di sini agar kembali ke warna putih kertas default

        content: [
          // Judul Dokumen Utama
          { text: title || "Untitled Document", style: "docTitle" },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 8,
                x2: 505,
                y2: 8,
                lineWidth: 1,
                lineColor: "#e5e7eb", // Warna garis abu-abu terang
              },
            ],
          },
          { text: "\n" },

          // Memasukkan konten editor yang sudah diparsing rapi
          ...dynamicContent,
        ],

        styles: {
          docTitle: {
            fontSize: 24,
            bold: true,
            color: "#000000", // Teks judul hitam pekat
          },
          h1: {
            fontSize: 18,
            bold: true,
            color: "#111827", // Teks abu-abu sangat gelap
          },
          h2: {
            fontSize: 15,
            bold: true,
            color: "#374151", // Teks abu-abu gelap
          },
          body: {
            fontSize: 11,
            lineHeight: 1.5,
            color: "#1f2937", // Teks standar bacaan hitam/abu-abu gelap
          },
          quote: {
            fontSize: 11,
            italic: true,
            color: "#4b5563", // Teks quote abu-abu medium
          },
          codeBlock: {
            fontSize: 10,
            color: "#1f2937", // Teks kode berwarna merah/pink gelap agar kontras
            fillColor: "#f3f4f6", // Latar belakang kotak kode abu-abu terang
            lineHeight: 1.4,
            margin: [8, 8, 8, 8],
          },
        },
      };

      pdfMake
        .createPdf(docDefinition)
        .download(`${title || "Untitled_Document"}.pdf`);
      toast.success("PDF berhasil diunduh!", { id: toastId });
    } catch (error: any) {
      console.error("pdfmake error:", error);
      toast.error("Gagal mengunduh PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#1e1e1e] font-sans text-[#cccccc]">
      {/* TOP BAR (Modernized) */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414]/95 px-2 backdrop-blur-md">
        {/* LEFT: File Tab */}
        <div className="flex h-full items-center">
          <div className="group relative flex h-full max-w-50 items-center gap-2 border-b-2 border-blue-500 bg-[#141414] px-4 sm:max-w-75">
            <FiFileText size={14} className="shrink-0 text-blue-400" />

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={handleSave}
              placeholder="Untitled Document"
              className="w-full truncate bg-transparent text-[13px] font-medium text-zinc-200 outline-none placeholder:text-zinc-600"
            />

            <button
              type="button"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all hover:bg-white/10 hover:text-zinc-200 group-hover:opacity-100">
              ×
            </button>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="custom-scrollbar flex items-center gap-1.5 overflow-x-auto px-2 sm:gap-2">
          {/* AI Assistant */}
          <div className="shrink-0">
            <AIAssistant
              currentText={serializeBlocks(blocks)}
              onInsertText={insertAIResult}
              onReplaceText={replaceWithAIResult}
            />
          </div>

          <div className="mx-1 hidden h-4 w-px bg-white/10 lg:block" />

          {/* View Toggles (Edit / Preview / Split) */}
          <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/2 p-1">
            <button
              type="button"
              title="Edit View"
              onClick={() => setViewMode("edit")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "edit"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <FiEdit2 size={13} />
            </button>
            <button
              type="button"
              title="Preview View"
              onClick={() => setViewMode("preview")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "preview"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <FiEye size={13} />
            </button>
            <button
              type="button"
              title="Split View"
              onClick={() => setViewMode("split")}
              className={`hidden h-7 w-7 items-center justify-center rounded-md transition-colors sm:flex ${
                viewMode === "split"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <FiColumns size={13} />
            </button>
          </div>

          <div className="mx-1 hidden h-4 w-px bg-white/10 lg:block" />

          {/* Metadata Toggles (Pin / Status / Tags) */}
          <button
            type="button"
            onClick={handleTogglePinned}
            title={pinned ? "Unpin" : "Pin"}
            className={`hidden items-center gap-1.5 rounded-md px-2.5 h-8 text-[11px] font-medium transition-colors sm:flex whitespace-nowrap ${
              pinned
                ? "bg-amber-500/10 text-amber-400"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}>
            <FiStar
              size={13}
              className={
                pinned ? "fill-amber-400 text-amber-400" : "text-zinc-500"
              }
            />
            {!isHelperPanelOpen && (pinned ? "Pinned" : "Pin")}
          </button>

          <select
            value={status}
            onChange={(e) =>
              handleSetStatus(e.target.value as "draft" | "active" | "archived")
            }
            className="hidden h-8 cursor-pointer rounded-md border border-transparent bg-white/5 px-2 text-[11px] font-medium text-zinc-300 outline-none transition-colors hover:bg-white/10 focus:border-white/10 md:block">
            <option value="draft" className="bg-[#1e1e1e]">
              Draft
            </option>
            <option value="active" className="bg-[#1e1e1e]">
              Active
            </option>
            <option value="archived" className="bg-[#1e1e1e]">
              Archived
            </option>
          </select>

          <div className="hidden items-center gap-1.5 pl-1 lg:flex">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tags (comma)"
              className="h-8 w-48 rounded-md bg-white/5 px-2.5 text-[11px] text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:bg-white/10"
            />
            <button
              type="button"
              onClick={handleApplyTags}
              className="flex h-8 items-center rounded-md bg-white/5 px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 whitespace-nowrap">
              Apply
            </button>
          </div>

          <div className="mx-1 hidden h-4 w-px bg-white/10 lg:block" />

          {/* Mode Switch & Save */}
          <button
            type="button"
            onClick={() => onToggleEditorMode("text")}
            title="Switch to Text Mode"
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 whitespace-nowrap">
            <FiCode size={13} />
            {!isHelperPanelOpen && "Text Mode"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            title={isSaving ? "Saving..." : "Save (Ctrl+S)"}
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#007acc] px-3 text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-[#0098ff] disabled:opacity-50 whitespace-nowrap ml-1">
            <FiSave size={13} />
            {!isHelperPanelOpen && (isSaving ? "Saving..." : "Save")}
          </button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="flex min-h-8 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#2d2d2d] bg-[#1e1e1e] px-3 text-[12px] text-[#858585] sm:px-4">
        <div className="flex flex-1 items-center whitespace-nowrap">
          <span className="cursor-pointer hover:text-[#cccccc]">workspace</span>
          <FiChevronRight className="mx-1 shrink-0" size={13} />
          <span className="cursor-pointer hover:text-[#cccccc]">notes</span>
          <FiChevronRight className="mx-1 shrink-0" size={13} />
          <span className="text-[#cccccc]">{title || "Untitled-1"}</span>
        </div>

        {/* Panel sidebar */}
        <button
          type="button"
          onClick={() => setIsHelperPanelOpen((current) => !current)}
          title={isHelperPanelOpen ? "Hide Panel" : "Show Panel"}
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
            isHelperPanelOpen
              ? "text-[#007fd4] bg-[#2d2d2d]"
              : "text-[#858585] hover:bg-[#333333] hover:text-[#cccccc]"
          }`}>
          <FiSidebar
            size={18}
            className={`transition-transform duration-300 ${isHelperPanelOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* MAIN LAYOUT WRAPPER (CONTENT + SIDEBAR) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* CONTENT EDITOR */}
        <div className="flex flex-1 overflow-hidden">
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`custom-scrollbar relative overflow-y-auto ${
                viewMode === "split"
                  ? "w-1/2 border-r border-white/5 bg-[#0E0E0E]"
                  : "w-full bg-[#0E0E0E]"
              }`}>
              <div className="px-1 py-8 sm:px-10 lg:px-16 lg:py-12">
                <div className="mx-auto w-full max-w-4xl">
                  {/* IN-DOCUMENT HEADER */}
                  {/* {viewMode !== "split" && (
                    <div className="mb-10 ml-8 border-b border-white/5 pb-6">
                      <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                        {title || "Untitled Document"}
                      </h1>
                    </div>
                  )} */}

                  {blocks.map((block) => {
                    const isSlashBlock = slashMenuBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => setDraggedBlockId(block.id)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragOverBlockId(block.id);
                        }}
                        onDrop={() => {
                          if (draggedBlockId) {
                            moveBlock(draggedBlockId, block.id);
                          }
                          setDraggedBlockId(null);
                          setDragOverBlockId(null);
                        }}
                        onDragEnd={() => {
                          setDraggedBlockId(null);
                          setDragOverBlockId(null);
                        }}
                        /* PERBAIKAN: Gunakan ml-8 pada wrapper block agar selaras mutlak dengan Title */
                        className={`group relative ml-8 flex rounded-xl transition-all ${
                          dragOverBlockId === block.id
                            ? "bg-white/2 ring-1 ring-blue-500/50"
                            : ""
                        }`}>
                        {/* ICONS KIRI (Drag & Add) - Absolute position menjorok ke luar area kiri teks */}
                        <div className="absolute right-full top-0 mr-2 mt-0.5 flex h-9 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {/* DRAG HANDLE */}
                          <div className="flex h-6 w-5 cursor-grab items-center justify-center text-zinc-600 active:cursor-grabbing">
                            <div className="flex flex-col gap-0.75">
                              <span className="h-1 w-1 rounded-full bg-current" />
                              <span className="h-1 w-1 rounded-full bg-current" />
                              <span className="h-1 w-1 rounded-full bg-current" />
                            </div>
                          </div>

                          {/* ADD BUTTON */}
                          <button
                            type="button"
                            title="Insert block after"
                            onClick={() => insertBlockAfter(block.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200">
                            <FiPlus size={16} />
                          </button>
                        </div>

                        {/* TEXTAREA BLOCK */}
                        <div className="relative flex-1">
                          {block.type === "bullet" && (
                            <div className="pointer-events-none absolute left-0 top-2.5 text-zinc-500">
                              •
                            </div>
                          )}

                          <textarea
                            ref={(element) => {
                              blockRefs.current[block.id] = element;
                            }}
                            value={block.text}
                            onChange={(event) =>
                              handleBlockChange(block.id, event.target.value)
                            }
                            onKeyDown={(event) =>
                              handleBlockKeyDown(event, block)
                            }
                            onFocus={() => setActiveBlockId(block.id)}
                            onBlur={() => {
                              if (isSlashBlock) return;
                              setSlashMenuBlockId(null);
                              setSlashQuery("");
                            }}
                            placeholder={blockPlaceholder(block.type)}
                            rows={Math.max(1, block.text.split("\n").length)}
                            /* PERBAIKAN: Hapus padding X (px-0) agar teks persis sejajar dengan teks Title */
                            className={`w-full resize-none rounded-lg border border-transparent bg-transparent py-2 outline-none transition-colors focus:border-white/5 focus:bg-white/2 placeholder:text-zinc-600 ${
                              block.type === "heading1"
                                ? "mt-4 text-[28px] font-bold text-zinc-100"
                                : block.type === "heading2"
                                  ? "mt-2 text-[22px] font-semibold text-zinc-200"
                                  : block.type === "quote"
                                    ? "border-l-4 border-l-blue-400 pl-4 italic text-zinc-400"
                                    : block.type === "bullet"
                                      ? "pl-5 text-[15px] leading-relaxed text-zinc-300"
                                      : block.type === "code"
                                        ? "my-2 rounded-xl border border-white/5 bg-[#141414] p-4 font-mono text-[13px] leading-relaxed text-blue-300"
                                        : "text-[15px] leading-relaxed text-zinc-300"
                            }`}
                          />

                          {/* SLASH MENU (Notion command palette style) */}
                          {isSlashBlock && (
                            <div className="absolute left-0 z-50 mt-1 w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A] shadow-2xl backdrop-blur-xl">
                              {filteredCommands.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-zinc-500">
                                  No block types found
                                </div>
                              ) : (
                                <div className="py-1 custom-scrollbar max-h-60 overflow-y-auto">
                                  {filteredCommands.map((command) => (
                                    <button
                                      key={command.type}
                                      type="button"
                                      onMouseDown={(event) =>
                                        event.preventDefault()
                                      }
                                      onClick={() =>
                                        applyBlockType(block.id, command.type)
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/5">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400">
                                        {getCommandIcon(command.type)}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-medium text-zinc-200">
                                          {command.label}
                                        </p>
                                        <p className="truncate text-[11px] text-zinc-500">
                                          {command.description}
                                        </p>
                                      </div>

                                      <span className="text-[10px] text-zinc-600">
                                        /{command.type}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* ADD BLOCK TAIL */}
                  {/* PERBAIKAN: Tail mengadopsi ml-8 agar langsung lurus sejajar dengan block di atasnya */}
                  <div className="ml-8 pt-4 pb-20">
                    <button
                      type="button"
                      onClick={() =>
                        insertBlockAfter(blocks[blocks.length - 1].id)
                      }
                      className="flex items-center gap-2 rounded-lg py-2 text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">
                      <FiPlus size={16} />
                      Click to add a block
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW VIEW */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`custom-scrollbar overflow-y-auto bg-[#141414] transition-all ${
                viewMode === "split"
                  ? "w-1/2 border-l border-white/5"
                  : "w-full"
              }`}>
              <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
                {/* 1. ACTION BAR (Bagian ini TIDAK akan masuk ke PDF) */}
                <div className="mb-8 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[13px] text-zinc-500">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                    Markdown Preview
                  </p>

                  {/* Tombol Download PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-white/5 bg-white/2 px-3 py-2 text-[12px] font-medium text-zinc-300 transition-all hover:border-white/10 hover:bg-white/5 hover:text-white disabled:opacity-50">
                    {isDownloading ? (
                      <FiLoader
                        className="animate-spin text-blue-400"
                        size={14}
                      />
                    ) : (
                      <FiDownload size={14} />
                    )}
                    <span className="hidden sm:inline">
                      {isDownloading ? "Memproses..." : "Download PDF"}
                    </span>
                  </button>
                </div>

                {/* 2. PDF WRAPPER (Semua yang ada di dalam ref ini AKAN masuk ke PDF) */}
                <div
                  className="w-full bg-[#141414] sm:px-2 sm:pb-8"
                  ref={previewRef}>
                  {/* Judul Dokumen */}
                  {/* <div className="mb-8 border-b border-white/5 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                      {title || "Untitled Document"}
                    </h1>
                  </div> */}

                  {/* Konten Markdown */}
                  <MarkdownPreview content={serializeBlocks(blocks)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HELPER PANEL - SEKARANG MENJADI RIGHT SIDEBAR */}
        {isHelperPanelOpen && (
          <div className="absolute bottom-0 right-0 top-0 z-10 flex w-full shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-[#111111] shadow-2xl sm:relative sm:w-64 md:w-72 custom-scrollbar">
            {/* QUICK ACTIONS */}
            <div className="flex flex-col gap-3 border-b border-white/5 p-5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.type}
                    type="button"
                    onClick={() => handleQuickInsert(action.type)}
                    className="flex items-center justify-center rounded-lg border border-white/5 bg-white/2 px-2 py-2 text-[11px] font-medium text-zinc-400 transition-all hover:border-white/10 hover:bg-white/5 hover:text-zinc-200">
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TEMPLATES */}
            <div className="flex flex-col p-5">
              <div className="mb-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Starter Templates
                </h3>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Pilih template jika bingung mau mulai dari mana.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {NOTE_TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="group flex flex-col items-start justify-center rounded-xl border border-white/5 bg-white/2 p-3 text-left transition-all hover:border-white/10 hover:bg-white/5">
                    <div className="flex w-full items-center justify-between">
                      <p className="text-[12px] font-medium text-zinc-300 transition-colors group-hover:text-zinc-100">
                        {template.label}
                      </p>
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                        Use
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500 transition-colors group-hover:text-zinc-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATUS BAR (VS Code Style) */}
      <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            <FiLayout size={12} />
            Notion Mode
          </span>

          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            {isSaving ? "Saving..." : "Saved"}
          </span>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="hidden cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20 sm:inline">
            Ln {blocks.findIndex((b) => b.id === currentBlockId) + 1}, Col 1
          </span>
          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            UTF-8
          </span>
          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            Markdown
          </span>
        </div>
      </footer>
    </div>
  );
}
