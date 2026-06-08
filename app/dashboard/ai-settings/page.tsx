"use client";

import { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiCpu,
  FiKey,
  FiSave,
  FiSettings,
  FiShield,
  FiZap,
} from "react-icons/fi";

interface AISettings {
  id: string;
  userId: string;
  geminiApiKey: string | null;
  grokApiKey: string | null;
  activeProvider: string;
  activeModel: string;
}

type AIFormData = {
  geminiApiKey: string;
  grokApiKey: string;
  activeProvider: string;
  activeModel: string;
};

const PROVIDER_MODELS: Record<string, string[]> = {
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"],
  grok: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ],
};

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState<AIFormData>({
    geminiApiKey: "",
    grokApiKey: "",
    activeProvider: "gemini",
    activeModel: "gemini-2.5-flash",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/ai-settings");
        if (response.ok) {
          const data = await response.json();
          const loadedProvider = data.activeProvider || "gemini";
          const providerModels = PROVIDER_MODELS[loadedProvider] || [];
          const loadedModel = providerModels.includes(data.activeModel)
            ? data.activeModel
            : providerModels[0] || "gemini-2.5-flash";

          if (!isMounted) {
            return;
          }

          setSettings(data);
          setFormData({
            geminiApiKey: data.geminiApiKey || "",
            grokApiKey: data.grokApiKey || "",
            activeProvider: loadedProvider,
            activeModel: loadedModel,
          });
        }
      } catch (error) {
        console.error("Error fetching AI settings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setHasUnsavedChanges(true);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Update model when provider changes
      if (
        name === "activeProvider" &&
        PROVIDER_MODELS[value as string]?.length > 0
      ) {
        updated.activeModel = PROVIDER_MODELS[value as string][0];
      }
      return updated;
    });
  };

  const providerLabel =
    formData.activeProvider === "gemini"
      ? "Gemini"
      : "Groq";

  const configuredKeyCount = [
    formData.geminiApiKey,
    formData.grokApiKey,
  ].filter(Boolean).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setHasUnsavedChanges(false);
        setMessage("Settings berhasil disimpan!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Gagal menyimpan settings");
      }
    } catch (error) {
      console.error("Error saving AI settings:", error);
      setMessage("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] font-sans text-[#cccccc]">
        <div className="flex items-center gap-2 text-sm">
          <FiSettings className="animate-spin" /> Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] font-sans text-[#cccccc] overflow-y-auto max-h-screen">
      {/* VS Code Breadcrumb / Top Bar Area */}
      <div className="flex h-9 items-center border-b border-[#2d2d2d] bg-[#1e1e1e] px-4 text-[13px] text-[#cccccc]">
        <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
          <FiSettings size={14} /> Settings
        </span>
        <span className="mx-2 text-[#6b6b6b]">/</span>
        <span className="text-[#cccccc]">AI Integration</span>
      </div>

      <div className="mx-auto max-w-6xl p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-[28px] font-normal tracking-tight text-[#ffffff]">
              AI Integration Settings
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] text-[#cccccc]">
              Atur provider, model default, dan API key untuk Gemini dan Groq.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="hidden lg:inline-flex items-center justify-center gap-2 rounded-xs bg-[#007acc] px-4 py-1.5 text-[13px] text-white transition-colors hover:bg-[#005f9e] disabled:cursor-not-allowed disabled:bg-[#4d4d4d] disabled:text-[#a0a0a0]">
            <FiSave size={14} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 border-l-4 px-4 py-2 text-[13px] ${
              message.toLowerCase().includes("berhasil")
                ? "border-[#4caf50] bg-[#163824] text-[#4caf50]"
                : "border-[#f44336] bg-[#3a1d1d] text-[#f44336]"
            }`}>
            {message}
          </div>
        )}

        {/* Main Grid Content */}
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {/* Quick Stats Panel */}
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
              <div className="border border-[#2d2d2d] bg-[#252526] p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#cccccc]">
                  <FiCpu size={14} /> Provider
                </div>
                <div className="mt-2 text-[15px] text-white">
                  {providerLabel}
                </div>
              </div>
              <div className="border border-[#2d2d2d] border-t-0 sm:border-l-0 sm:border-t p-4 bg-[#252526]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#cccccc]">
                  <FiZap size={14} /> Model
                </div>
                <div className="mt-2 text-[15px] text-white">
                  {formData.activeModel}
                </div>
              </div>
              <div className="border border-[#2d2d2d] border-t-0 sm:border-l-0 sm:border-t p-4 bg-[#252526]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#cccccc]">
                  <FiShield size={14} /> Keys
                </div>
                <div className="mt-2 text-[15px] text-white">
                  {configuredKeyCount} configured
                </div>
              </div>
            </div>

            {/* Credentials Section */}
            <div>
              <div className="mb-4 flex items-center gap-2 border-b border-[#2d2d2d] pb-2 text-[#cccccc]">
                <FiKey size={16} />
                <h2 className="text-[14px] uppercase tracking-wide">
                  Provider Credentials
                </h2>
              </div>
              <p className="mb-4 text-[13px] text-[#cccccc]">
                Isi hanya key yang memang ingin dipakai.
              </p>

              <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                {[
                  {
                    label: "Gemini API Key",
                    name: "geminiApiKey",
                    placeholder: "Enter your Gemini API key",
                    url: "https://ai.google.dev",
                    urlLabel: "ai.google.dev",
                  },
                  {
                    label: "Groq API Key",
                    name: "grokApiKey",
                    placeholder: "Enter your Groq API key",
                    url: "https://console.groq.com",
                    urlLabel: "console.groq.com",
                  },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-[#cccccc]">
                      {field.label}
                    </label>
                    <input
                      type="password"
                      name={field.name}
                      value={formData[field.name as keyof AIFormData]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      autoComplete="off"
                      className="w-full rounded-xs border border-[#3c3c3c] bg-[#3c3c3c] px-2.5 py-1.5 text-[13px] text-[#cccccc] placeholder-[#858585] outline-none transition-colors focus:border-[#007acc] focus:bg-[#3c3c3c]"
                    />
                    <p className="text-[12px] text-[#858585]">
                      Get it from{" "}
                      <a
                        href={field.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3794ff] hover:underline">
                        {field.urlLabel}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Default Settings Section */}
            <div className="pt-4">
              <div className="mb-4 flex items-center gap-2 border-b border-[#2d2d2d] pb-2 text-[#cccccc]">
                <FiSettings size={16} />
                <h2 className="text-[14px] uppercase tracking-wide">
                  Defaults
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-[#cccccc]">
                    Default Provider
                  </label>
                  <select
                    name="activeProvider"
                    value={formData.activeProvider}
                    onChange={handleChange}
                    className="w-full rounded-xs border border-[#3c3c3c] bg-[#3c3c3c] px-2.5 py-1.5 text-[13px] text-[#cccccc] outline-none transition-colors focus:border-[#007acc]">
                    <option value="gemini">Gemini</option>
                    <option value="grok">Groq</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-[#cccccc]">
                    Default Model
                  </label>
                  <select
                    name="activeModel"
                    value={formData.activeModel}
                    onChange={handleChange}
                    className="w-full rounded-xs border border-[#3c3c3c] bg-[#3c3c3c] px-2.5 py-1.5 text-[13px] text-[#cccccc] outline-none transition-colors focus:border-[#007acc]">
                    {PROVIDER_MODELS[formData.activeProvider]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xs bg-[#007acc] px-4 py-2.5 text-[13px] text-white transition-colors hover:bg-[#005f9e] disabled:cursor-not-allowed disabled:bg-[#4d4d4d] lg:hidden">
              <FiSave size={14} /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {/* Sidebar / Info Panel */}
          <div className="space-y-6">
            {/* Current State Box */}
            <div className="border border-[#2d2d2d] bg-[#252526] text-[13px]">
              <div className="flex items-center gap-2 border-b border-[#2d2d2d] px-4 py-2.5 font-medium text-[#cccccc]">
                <FiCheckCircle className="text-[#89d185]" size={14} />
                WORKSPACE STATE
              </div>

              <div className="flex flex-col text-[#cccccc]">
                <div className="flex items-center justify-between border-b border-[#2d2d2d] px-4 py-2.5 hover:bg-[#2a2d2e]">
                  <span className="text-[#858585]">Loaded profile</span>
                  <span className="font-mono text-[12px] text-[#ce9178]">
                    {settings ? '"Available"' : '"Not loaded"'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#2d2d2d] px-4 py-2.5 hover:bg-[#2a2d2e]">
                  <span className="text-[#858585]">Active provider</span>
                  <span className="font-mono text-[12px] text-[#9cdcfe]">
                    {providerLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#2d2d2d] px-4 py-2.5 hover:bg-[#2a2d2e]">
                  <span className="text-[#858585]">Active model</span>
                  <span className="font-mono text-[12px] text-[#ce9178]">
                    `{formData.activeModel}`
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[#2a2d2e]">
                  <span className="text-[#858585]">Configured keys</span>
                  <span className="font-mono text-[12px] text-[#b5cea8]">
                    {configuredKeyCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Readme / How to use box */}
            <div className="border border-[#2d2d2d] bg-[#252526] p-4 text-[13px]">
              <h3 className="mb-2 uppercase tracking-wide text-[#cccccc]">
                README.md
              </h3>
              <ul className="ml-4 list-disc space-y-1.5 text-[#cccccc]">
                <li>
                  Masukkan API key hanya untuk provider yang akan dipakai.
                </li>
                <li>Pilih provider dan model default sesuai workflow kamu.</li>
                <li>Pengaturan disimpan per akun pengguna.</li>
                <li>
                  Key tetap disimpan di database dan tidak ditampilkan lagi demi
                  keamanan.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Bar / Bottom fixed bar for mobile equivalent */}
        <div className="fixed inset-x-0 bottom-0 z-50 flex h-5.5 items-center justify-between bg-[#007acc] px-3 text-[12px] text-white lg:hidden">
          <div className="flex items-center gap-2">
            <FiSettings size={12} />
            <span>{hasUnsavedChanges ? "Unsaved changes*" : "Ready"}</span>
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 hover:text-[#cccccc]">
              <FiSave size={12} /> {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {/* Space for bottom mobile bar */}
        <div className="h-10 lg:hidden" />
      </div>
    </div>
  );
}
