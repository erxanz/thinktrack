"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiCpu, FiKey, FiSave, FiUser } from "react-icons/fi";

export default function AISettingsPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    activeModel: "gemini-3.1-flash-lite",
    cognitiveMode: "REMAJA",
    apiKey: "",
  });

  useEffect(() => {
    if (status === "loading" || !userId) return;

    fetch(`/api/ai-settings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig({
            ...data,
            cognitiveMode: data.user?.cognitiveMode ?? "REMAJA",
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, [userId, status]);

  const saveSettings = async () => {
    if (!userId) return;
    try {
      setSaving(true);

      const res = await fetch("/api/ai-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...config,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan");
      }

      alert("Pengaturan berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <div className="h-10 w-60 rounded bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pengaturan AI</h1>

        <p className="text-zinc-400 mt-2">
          Atur model AI, API Key, dan gaya belajar yang sesuai dengan kebutuhan
          Anda.
        </p>
      </div>

      <div className="space-y-6">
        {/* API KEY */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FiKey className="text-blue-400 text-lg" />
            </div>

            <div>
              <h2 className="font-semibold text-white">API Key Gemini</h2>

              <p className="text-sm text-zinc-400">
                Gunakan API Key pribadi untuk kuota tambahan.
              </p>
            </div>
          </div>

          <input
            type="password"
            value={config.apiKey}
            onChange={(e) =>
              setConfig({
                ...config,
                apiKey: e.target.value,
              })
            }
            placeholder="Masukkan Gemini API Key"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* MODEL */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FiCpu className="text-purple-400 text-lg" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Model AI</h2>

              <p className="text-sm text-zinc-400">
                Pilih model yang ingin digunakan.
              </p>
            </div>
          </div>

          <select
            value={config.activeModel}
            onChange={(e) =>
              setConfig({
                ...config,
                activeModel: e.target.value,
              })
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500">
            <option value="gemini-3.1-flash-lite">Gemini 2.5 Flash</option>

            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
          </select>
        </div>

        {/* PERSONA */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <FiUser className="text-emerald-400 text-lg" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Gaya Penjelasan</h2>

              <p className="text-sm text-zinc-400">
                Sesuaikan cara AI menjelaskan materi.
              </p>
            </div>
          </div>

          <select
            value={config.cognitiveMode}
            onChange={(e) =>
              setConfig({
                ...config,
                cognitiveMode: e.target.value,
              })
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500">
            <option value="ANAK">Anak-anak</option>

            <option value="REMAJA">Remaja</option>

            <option value="DEWASA">Dewasa</option>
          </select>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
          <FiSave />

          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}
