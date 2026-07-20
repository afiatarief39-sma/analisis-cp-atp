import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  School,
  BookOpen,
  GraduationCap,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  Code,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Trash2,
  Info
} from "lucide-react";

// Types for form inputs and state
interface IdentitasSekolah {
  nama_sekolah: string;
  mata_pelajaran: string;
  kelas_fase: string;
  tahun_pelajaran: string;
  capaian_pembelajaran: string;
}

interface PresetTemplate {
  label: string;
  badge: string;
  data: IdentitasSekolah;
}

// Preset templates for quick-fill
const PRESETS: PresetTemplate[] = [
  {
    label: "Informatika SMA (Fase E)",
    badge: "Informatika",
    data: {
      nama_sekolah: "SMA Negeri 1 Jakarta",
      mata_pelajaran: "Informatika",
      kelas_fase: "Kelas X / Fase E",
      tahun_pelajaran: "2026/2027",
      capaian_pembelajaran: "Pada akhir fase E, peserta didik mampu menerapkan berpikir komputasional yang terdiri dari empat pilar (dekomposisi, pengenalan pola, abstraksi, dan algoritma) untuk menyelesaikan persoalan terstruktur, serta memahami interaksi sistem komputer, jaringan, dan keamanan siber dasar secara kontekstual."
    }
  },
  {
    label: "Matematika SMP (Fase D)",
    badge: "Matematika",
    data: {
      nama_sekolah: "SMP Merdeka Nusantara",
      mata_pelajaran: "Matematika",
      kelas_fase: "Kelas VII / Fase D",
      tahun_pelajaran: "2026/2027",
      capaian_pembelajaran: "Pada akhir fase D, peserta didik dapat memahami hubungan kuantitas, rasio, proporsi, serta persentase; memodelkan masalah sehari-hari menggunakan konsep aljabar linier sederhana; serta mengumpulkan, menyajikan, dan menganalisis data statistik deskriptif untuk penarikan kesimpulan."
    }
  },
  {
    label: "Bahasa Inggris SMA (Fase F)",
    badge: "Bahasa Inggris",
    data: {
      nama_sekolah: "SMA Taruna Unggul",
      mata_pelajaran: "Bahasa Inggris",
      kelas_fase: "Kelas XI / Fase F",
      tahun_pelajaran: "2026/2027",
      capaian_pembelajaran: "Pada akhir fase F, peserta didik menggunakan bahasa Inggris lisan, tulisan, dan visual untuk berdiskusi, berargumen, dan mempresentasikan gagasan orisinal. Peserta didik mampu menganalisis struktur teks naratif, eksposisi, dan laporan ilmiah populer secara kritis."
    }
  }
];

export default function App() {
  // Input states
  const [formData, setFormData] = useState<IdentitasSekolah>({
    nama_sekolah: "",
    mata_pelajaran: "",
    kelas_fase: "",
    tahun_pelajaran: "2026/2027",
    capaian_pembelajaran: ""
  });

  // Validation & generated status
  const [errors, setErrors] = useState<Partial<Record<keyof IdentitasSekolah, string>>>({});
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "json">("prompt");
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Copy status indicators
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Auto-validate and draft generation in real-time
  const [realtimePrompt, setRealtimePrompt] = useState("");
  const [realtimeJson, setRealtimeJson] = useState("");

  // Refs for focusing errors
  const refs = {
    nama_sekolah: useRef<HTMLInputElement>(null),
    mata_pelajaran: useRef<HTMLInputElement>(null),
    kelas_fase: useRef<HTMLInputElement>(null),
    tahun_pelajaran: useRef<HTMLInputElement>(null),
    capaian_pembelajaran: useRef<HTMLTextAreaElement>(null)
  };

  // Generate prompt content based on fields
  const getPromptText = (data: IdentitasSekolah): string => {
    return `Anda adalah seorang guru profesional yang memahami Kurikulum Merdeka.

Buatkan Alur Tujuan Pembelajaran (ATP) berdasarkan data berikut:
- Nama Sekolah: ${data.nama_sekolah || "[Nama Sekolah Belum Diisi]"}
- Mata Pelajaran: ${data.mata_pelajaran || "[Mata Pelajaran Belum Diisi]"}
- Kelas/Fase: ${data.kelas_fase || "[Kelas/Fase Belum Diisi]"}
- Tahun Pelajaran: ${data.tahun_pelajaran || "[Tahun Pelajaran Belum Diisi]"}

Capaian Pembelajaran:
${data.capaian_pembelajaran || "[Capaian Pembelajaran Belum Diisi]"}

Susun ATP dalam bentuk tabel yang memuat:
1. Tujuan Pembelajaran
2. Kompetensi Awal Murid
3. Materi Pokok
4. Dimensi Profil Lulusan
5. Lintas Disiplin Ilmu
6. Alokasi Waktu
7. Aktivitas Pembelajaran
8. Asesmen
9. Keterangan

Ketentuan:
- Mengacu pada Kurikulum Merdeka terbaru.
- Tujuan pembelajaran runtut dari sederhana ke kompleks.
- Aktivitas menggunakan pendekatan Deep Learning.
- Asesmen memuat diagnostik, formatif, dan sumatif.
- Output berupa tabel yang rapi.`;
  };

  // Generate JSON content based on fields
  const getJsonText = (data: IdentitasSekolah, promptText: string): string => {
    const jsonObj = {
      nama_sekolah: data.nama_sekolah || "",
      mata_pelajaran: data.mata_pelajaran || "",
      kelas_fase: data.kelas_fase || "",
      tahun_pelajaran: data.tahun_pelajaran || "",
      capaian_pembelajaran: data.capaian_pembelajaran || "",
      prompt: promptText
    };
    return JSON.stringify(jsonObj, null, 2);
  };

  // Update live preview when fields change
  useEffect(() => {
    const prompt = getPromptText(formData);
    setRealtimePrompt(prompt);
    setRealtimeJson(getJsonText(formData, prompt));
  }, [formData]);

  // Helper to calculate form completion percentage
  const getCompletionPercentage = () => {
    const fields: (keyof IdentitasSekolah)[] = [
      "nama_sekolah",
      "mata_pelajaran",
      "kelas_fase",
      "tahun_pelajaran",
      "capaian_pembelajaran"
    ];
    const filled = fields.filter((field) => formData[field].trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  // Handler for form field change
  const handleInputChange = (field: keyof IdentitasSekolah, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handler to apply preset templates
  const applyPreset = (preset: PresetTemplate) => {
    setFormData(preset.data);
    setErrors({});
    setIsGenerated(true);
    triggerToast(`Berhasil menerapkan template: ${preset.badge}`, "success");
  };

  // Clear all fields
  const clearForm = () => {
    setFormData({
      nama_sekolah: "",
      mata_pelajaran: "",
      kelas_fase: "",
      tahun_pelajaran: "2026/2027",
      capaian_pembelajaran: ""
    });
    setErrors({});
    setIsGenerated(false);
    triggerToast("Formulir berhasil dikosongkan", "success");
  };

  // Validate fields
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IdentitasSekolah, string>> = {};
    let firstErrorField: keyof IdentitasSekolah | null = null;

    if (!formData.nama_sekolah.trim()) {
      newErrors.nama_sekolah = "Nama Sekolah wajib diisi";
      if (!firstErrorField) firstErrorField = "nama_sekolah";
    }
    if (!formData.mata_pelajaran.trim()) {
      newErrors.mata_pelajaran = "Mata Pelajaran wajib diisi";
      if (!firstErrorField) firstErrorField = "mata_pelajaran";
    }
    if (!formData.kelas_fase.trim()) {
      newErrors.kelas_fase = "Kelas/Fase wajib diisi";
      if (!firstErrorField) firstErrorField = "kelas_fase";
    }
    if (!formData.tahun_pelajaran.trim()) {
      newErrors.tahun_pelajaran = "Tahun Pelajaran wajib diisi";
      if (!firstErrorField) firstErrorField = "tahun_pelajaran";
    }
    if (!formData.capaian_pembelajaran.trim()) {
      newErrors.capaian_pembelajaran = "Capaian Pembelajaran wajib diisi";
      if (!firstErrorField) firstErrorField = "capaian_pembelajaran";
    }

    setErrors(newErrors);

    if (firstErrorField) {
      refs[firstErrorField].current?.focus();
      triggerToast("Harap lengkapi semua bidang wajib!", "error");
      return false;
    }

    return true;
  };

  // Trigger brief toast alerts
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => {
      setShowToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Handle Generate Prompt ATP action
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsGenerated(true);
      triggerToast("Prompt ATP berhasil di-generate secara optimal!", "success");
    }
  };

  // Copy Prompt to Clipboard
  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(realtimePrompt);
    setCopiedPrompt(true);
    triggerToast("Prompt AI berhasil disalin!", "success");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Copy JSON to Clipboard
  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(realtimeJson);
    setCopiedJson(true);
    triggerToast("JSON Metadata berhasil disalin!", "success");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download files
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([realtimePrompt], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Prompt_ATP_${formData.mata_pelajaran.replace(/\s+/g, "_") || "Umum"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Prompt berhasil diunduh sebagai berkas TXT", "success");
  };

  const downloadJsonFile = () => {
    const element = document.createElement("a");
    const file = new Blob([realtimeJson], { type: "application/json;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Metadata_ATP_${formData.mata_pelajaran.replace(/\s+/g, "_") || "Umum"}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Metadata berhasil diunduh sebagai berkas JSON", "success");
  };

  const completionPercent = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border ${
              showToast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {showToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium text-sm">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <header className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/40 via-transparent to-transparent opacity-70 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                  Analisis Tujuan Pembelajaran (ATP) <span className="bg-blue-50 text-blue-700 text-xs md:text-sm font-semibold px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">Berbasis AI</span>
                </h1>
                <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-2xl">
                  Rancang Alur Tujuan Pembelajaran Kurikulum Merdeka secara sistematis, terstruktur, dan mendalam dengan kecerdasan buatan.
                </p>
              </div>
            </div>
            
            {/* Quick Stats or Metadata */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kelengkapan Form</div>
                <div className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-0.5">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <span>{completionPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-10">
        
        {/* Banner Panduan Singkat */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mb-8 flex gap-3.5 text-sm text-blue-800 leading-relaxed items-start">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Panduan Penggunaan:</span> Isi identitas sekolah, masukkan deskripsi Capaian Pembelajaran (CP), lalu klik tombol <span className="font-semibold text-blue-900">Generate Prompt ATP</span>. Salin teks prompt yang terbentuk dan tempelkan langsung ke chatbot AI profesional pilihan Anda (seperti Google Gemini) untuk mendapatkan draf modul ATP yang terperinci.
          </div>
        </div>

        {/* 2-Column Desktop Grid, 1-Column Mobile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Column 1: Input Form & Presets */}
          <section className="space-y-6">
            
            {/* Preset Selector Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Pilih Template Contoh
                </h2>
                <span className="text-xs text-slate-400">Klik untuk memuat data instan</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex-1 text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 active:scale-98 transition-all duration-200 cursor-pointer"
                  >
                    <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold mb-1 group-hover:bg-blue-100">
                      {preset.badge}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleGenerate} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Formulir Input ATP
                </h2>
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan Form
                </button>
              </div>

              {/* Grid for School details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* School Name */}
                <div className="space-y-2">
                  <label htmlFor="nama_sekolah" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <School className="w-4 h-4 text-slate-400" /> Nama Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="nama_sekolah"
                    ref={refs.nama_sekolah}
                    type="text"
                    placeholder="Contoh: SMA Negeri 1 Jakarta"
                    value={formData.nama_sekolah}
                    onChange={(e) => handleInputChange("nama_sekolah", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-hidden ${
                      errors.nama_sekolah ? "border-rose-400 ring-2 ring-rose-50 focus:border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors.nama_sekolah && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.nama_sekolah}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="mata_pelajaran" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="mata_pelajaran"
                    ref={refs.mata_pelajaran}
                    type="text"
                    placeholder="Contoh: Informatika"
                    value={formData.mata_pelajaran}
                    onChange={(e) => handleInputChange("mata_pelajaran", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-hidden ${
                      errors.mata_pelajaran ? "border-rose-400 ring-2 ring-rose-50 focus:border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors.mata_pelajaran && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.mata_pelajaran}
                    </p>
                  )}
                </div>

                {/* Phase / Class */}
                <div className="space-y-2">
                  <label htmlFor="kelas_fase" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> Kelas / Fase <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="kelas_fase"
                    ref={refs.kelas_fase}
                    type="text"
                    placeholder="Contoh: Kelas X / Fase E"
                    value={formData.kelas_fase}
                    onChange={(e) => handleInputChange("kelas_fase", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-hidden ${
                      errors.kelas_fase ? "border-rose-400 ring-2 ring-rose-50 focus:border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors.kelas_fase && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.kelas_fase}
                    </p>
                  )}
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <label htmlFor="tahun_pelajaran" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Tahun Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="tahun_pelajaran"
                    ref={refs.tahun_pelajaran}
                    type="text"
                    placeholder="Contoh: 2026/2027"
                    value={formData.tahun_pelajaran}
                    onChange={(e) => handleInputChange("tahun_pelajaran", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-hidden ${
                      errors.tahun_pelajaran ? "border-rose-400 ring-2 ring-rose-50 focus:border-rose-500" : "border-slate-200"
                    }`}
                  />
                  {errors.tahun_pelajaran && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.tahun_pelajaran}
                    </p>
                  )}
                </div>

              </div>

              {/* Capaian Pembelajaran Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="capaian_pembelajaran" className="block text-sm font-semibold text-slate-700">
                    Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    {formData.capaian_pembelajaran.length} karakter
                  </span>
                </div>
                <textarea
                  id="capaian_pembelajaran"
                  ref={refs.capaian_pembelajaran}
                  rows={6}
                  placeholder="Masukkan kalimat atau paragraf Capaian Pembelajaran Kurikulum Merdeka di sini..."
                  value={formData.capaian_pembelajaran}
                  onChange={(e) => handleInputChange("capaian_pembelajaran", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-hidden resize-y ${
                    errors.capaian_pembelajaran ? "border-rose-400 ring-2 ring-rose-50 focus:border-rose-500" : "border-slate-200"
                  }`}
                />
                {errors.capaian_pembelajaran && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.capaian_pembelajaran}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-generate"
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" /> Generate Prompt ATP
              </button>
            </form>
          </section>

          {/* Column 2: Outputs (Prompt & JSON) */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-8">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("prompt")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeTab === "prompt"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                <FileText className="w-4 h-4" /> Preview Prompt AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeTab === "json"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                <Code className="w-4 h-4" /> Preview JSON
              </button>
            </div>

            {/* Content box */}
            <div className="p-6">
              
              {/* Prompt TAB */}
              {activeTab === "prompt" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Draf Prompt Otomatis</span>
                    </div>
                    {isGenerated ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        Ready & Validated
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mengetik Draft...
                      </span>
                    )}
                  </div>

                  {/* Rendered prompt viewport */}
                  <div className="relative group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={copyPromptToClipboard}
                        title="Salin Prompt"
                        className="p-2 bg-white/90 border border-slate-200 hover:bg-white hover:border-slate-300 rounded-lg shadow-sm transition-all cursor-pointer text-slate-600"
                      >
                        {copiedPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <pre className="w-full h-96 overflow-y-auto bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all scrollbar-thin scrollbar-thumb-slate-800">
                      {realtimePrompt}
                    </pre>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={copyPromptToClipboard}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors text-sm cursor-pointer border border-blue-100"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-4.5 h-4.5" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4.5 h-4.5" /> Salin Prompt
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={downloadTxtFile}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer"
                    >
                      <Download className="w-4.5 h-4.5" /> Unduh TXT
                    </button>
                  </div>
                </div>
              )}

              {/* JSON TAB */}
              {activeTab === "json" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                      <span className="text-sm font-bold text-slate-700">Draf JSON Metadata</span>
                    </div>
                    {isGenerated ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        Ready & Validated
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mengetik Draft...
                      </span>
                    )}
                  </div>

                  {/* Rendered JSON viewport */}
                  <div className="relative group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={copyJsonToClipboard}
                        title="Salin JSON"
                        className="p-2 bg-white/90 border border-slate-200 hover:bg-white hover:border-slate-300 rounded-lg shadow-sm transition-all cursor-pointer text-slate-600"
                      >
                        {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <pre className="w-full h-96 overflow-y-auto bg-slate-900 text-emerald-400 p-5 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all scrollbar-thin scrollbar-thumb-slate-800">
                      {realtimeJson}
                    </pre>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={copyJsonToClipboard}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors text-sm cursor-pointer border border-blue-100"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-4.5 h-4.5" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4.5 h-4.5" /> Salin JSON
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={downloadJsonFile}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer"
                    >
                      <Download className="w-4.5 h-4.5" /> Unduh JSON
                    </button>
                  </div>
                </div>
              )}

            </div>
          </section>

        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 text-center text-xs text-slate-400 border-t border-slate-200/50 pt-8">
        <p>© 2026 Analisis Tujuan Pembelajaran (ATP) Berbasis AI • Kurikulum Merdeka Terintegrasi</p>
        <p className="mt-1">Dibuat khusus untuk membantu guru Indonesia merancang pembelajaran modern secara efisien.</p>
      </footer>
    </div>
  );
}
