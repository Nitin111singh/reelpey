"use client";

import { useRef, useState } from "react";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { PLATFORMS, inputCls, PLATFORM_COLORS } from "@/components/admin/constants";
import type { Campaign } from "@/components/admin/types";

interface FormState {
  name: string;
  description: string;
  totalBudget: string;
  maxSubmissionsPerAccount: string;
  feePerCreator: string;
  maxEarningPerPostPerCreator: string;
  completionPercentage: string;
  supportedPlatforms: string[];
}

interface CampaignFormModalProps {
  /** When provided, the modal operates in edit mode */
  editCampaign?: Campaign;
  onClose: () => void;
  /** Called after a successful create or update */
  onSaved: () => void;
  onError: (msg: string) => void;
}

/**
 * Create / Edit campaign modal.
 *
 * Handles:
 *  - Multi-image file selection with local preview
 *  - Form validation (images required on create, at least one platform)
 *  - Multipart/form-data POST (create) or PATCH (edit) to /api/campaigns
 */
export default function CampaignFormModal({
  editCampaign,
  onClose,
  onSaved,
  onError,
}: CampaignFormModalProps) {
  const isEdit = !!editCampaign;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: editCampaign?.name ?? "",
    description: editCampaign?.description ?? "",
    totalBudget: editCampaign?.totalBudget?.toString() ?? "",
    maxSubmissionsPerAccount:
      editCampaign?.maxSubmissionsPerAccount?.toString() ?? "",
    feePerCreator: editCampaign?.feePerCreator?.toString() ?? "",
    maxEarningPerPostPerCreator:
      editCampaign?.maxEarningPerPostPerCreator?.toString() ?? "",
    completionPercentage:
      editCampaign?.completionPercentage?.toString() ?? "0",
    supportedPlatforms: editCampaign?.supportedPlatforms ?? [],
  });

  /** New file buffers chosen this session */
  const [newFiles, setNewFiles] = useState<File[]>([]);
  /**
   * Preview URLs — starts with existing R2 URLs (edit mode)
   * and grows as the user picks new files.
   */
  const [previews, setPreviews] = useState<string[]>(
    editCampaign?.images ?? []
  );

  const [isSaving, setIsSaving] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePlatform(p: string) {
    setForm((prev) => ({
      ...prev,
      supportedPlatforms: prev.supportedPlatforms.includes(p)
        ? prev.supportedPlatforms.filter((x) => x !== p)
        : [...prev.supportedPlatforms, p],
    }));
  }

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    const arr = Array.from(picked);
    setNewFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => setPreviews((prev) => [...prev, URL.createObjectURL(f)]));
  }

  function removePreview(idx: number) {
    const existingCount = editCampaign?.images.length ?? 0;
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    if (idx >= existingCount) {
      // Removing a newly picked file
      setNewFiles((prev) => prev.filter((_, i) => i !== idx - existingCount));
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isEdit && newFiles.length === 0) {
      onError("At least one campaign image is required.");
      return;
    }
    if (form.supportedPlatforms.length === 0) {
      onError("Select at least one supported platform.");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("totalBudget", form.totalBudget);
      fd.append("maxSubmissionsPerAccount", form.maxSubmissionsPerAccount);
      fd.append("feePerCreator", form.feePerCreator);
      fd.append("maxEarningPerPostPerCreator", form.maxEarningPerPostPerCreator);
      fd.append("completionPercentage", form.completionPercentage || "0");
      fd.append("supportedPlatforms", JSON.stringify(form.supportedPlatforms));
      newFiles.forEach((f) => fd.append("images", f));

      const url = isEdit
        ? `/api/campaigns/${editCampaign!.id}`
        : "/api/campaigns";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok) {
        onError(data.error?.message ?? "Something went wrong.");
      } else {
        onSaved();
      }
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Create Campaign"}
      wide
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 max-h-[70vh] overflow-y-auto pr-1"
      >
        {/* ── Images ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">
            Campaign Images
          </label>
          <p className="text-xs text-white/30">
            {isEdit
              ? "Upload new images to replace existing ones"
              : "Required — at least one image"}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 hover:border-violet-500/40 hover:bg-violet-500/5 text-white/30 hover:text-violet-400 transition-all gap-1"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px]">Add</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* ── Name ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">Campaign Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Summer Creator Campaign"
            className={inputCls}
          />
        </div>

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the campaign goals, content requirements…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* ── Budget + Max submissions ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Total Budget (₹)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.totalBudget}
              onChange={(e) => set("totalBudget", e.target.value)}
              placeholder="50000"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Max Submissions / Account</label>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.maxSubmissionsPerAccount}
              onChange={(e) => set("maxSubmissionsPerAccount", e.target.value)}
              placeholder="5"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Fee + Max earning ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Fee Per Creator (₹)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.feePerCreator}
              onChange={(e) => set("feePerCreator", e.target.value)}
              placeholder="500"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">
              Max Earning / Post / Creator (₹)
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.maxEarningPerPostPerCreator}
              onChange={(e) => set("maxEarningPerPostPerCreator", e.target.value)}
              placeholder="1500"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Completion percentage ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/70">
              Campaign Completion
            </label>
            <span className="inline-flex items-center justify-center min-w-[3.25rem] rounded-lg bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 text-sm font-bold text-violet-200 tabular-nums">
              {Math.min(100, Math.max(0, Number(form.completionPercentage) || 0))}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.min(100, Math.max(0, Number(form.completionPercentage) || 0))}
            onChange={(e) => set("completionPercentage", e.target.value)}
            className="campaign-progress-slider w-full"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #06b6d4 ${
                Math.min(100, Math.max(0, Number(form.completionPercentage) || 0))
              }%, rgba(255,255,255,0.08) ${
                Math.min(100, Math.max(0, Number(form.completionPercentage) || 0))
              }%)`,
            }}
          />
          <p className="text-xs text-white/30">
            Drag to set how much of the campaign is completed. Creators see this as a progress bar.
          </p>
        </div>

        {/* ── Platforms ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">
            Supported Platforms
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PLATFORMS.map((p) => {
              const active = form.supportedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-200"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Campaign"
          )}
        </button>
      </form>
    </Modal>
  );
}
