import { useEffect, useMemo, useRef } from "react";
import { FileImage, Image as ImageIcon, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

export default function ImageUploader({ image, setImage, disabled = false }) {
  const inputRef = useRef(null);
  const isPdf = image?.type === "application/pdf" || image?.name?.toLowerCase().endsWith(".pdf");
  const previewUrl = useMemo(() => image && !isPdf ? URL.createObjectURL(image) : "", [image, isPdf]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function pick(file) {
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) return toast.error("Use a PNG, JPG, WebP, or PDF file.");
    if (file.size > MAX_UPLOAD_BYTES) return toast.error("Reference file must be smaller than 8 MB.");
    setImage(file);
  }

  function clearImage() {
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-500"><ImageIcon size={11} /> Reference file</span>
        <span className="text-[9px] text-slate-600">Image or PDF / 8 MB</span>
      </div>
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" disabled={disabled} onChange={(event) => pick(event.target.files?.[0])} />
      {image ? (
        <div className="relative overflow-hidden rounded-lg border border-cyan-400/20 bg-black">
          {isPdf ? (
            <div className="flex h-44 flex-col items-center justify-center bg-gradient-to-br from-red-500/10 to-cyan-500/5 text-center sm:h-52">
              <FileImage size={38} className="text-red-300" />
              <strong className="mt-2 text-xs text-white">PDF reference ready</strong>
              <span className="mt-1 px-6 text-[10px] leading-4 text-slate-500">Page 1 will be converted securely for the image model.</span>
            </div>
          ) : <img src={previewUrl} alt="Reference upload preview" className="h-44 w-full object-contain sm:h-52" />}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/75 px-3 py-2 backdrop-blur">
            <FileImage size={13} className="shrink-0 text-cyan-300" />
            <span className="min-w-0 flex-1 truncate text-[10px] text-slate-300">{image.name}</span>
            <span className="text-[9px] text-slate-500">{(image.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
          <button type="button" onClick={clearImage} disabled={disabled} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-black/70 text-white backdrop-blur hover:bg-red-500/70" title="Remove reference image"><X size={15} /></button>
        </div>
      ) : (
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} onDrop={(event) => { event.preventDefault(); pick(event.dataTransfer.files?.[0]); }} onDragOver={(event) => event.preventDefault()} className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-4 text-center transition hover:border-cyan-400/50 hover:bg-cyan-500/[0.05] disabled:opacity-50 sm:h-44">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-500/10 text-cyan-300"><Upload size={19} /></span>
          <span className="mt-3 text-xs font-bold text-white">Drop or choose an image or PDF</span>
          <span className="mt-1 text-[10px] leading-4 text-slate-500">The prompt tells AI what to change while preserving useful details.</span>
        </button>
      )}
    </div>
  );
}