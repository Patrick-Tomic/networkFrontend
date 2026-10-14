"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { inputClass } from "./ui";

const MAX_UPLOAD = 10 * 1024 * 1024;
const MAX_SIDE = 2400;

/**
 * Shrinks big photos in the browser before upload, so phone pictures stay well under the
 * size limit. The server re-encodes everything anyway; this just saves the upload time.
 * Files the browser can't decode (e.g. HEIC outside Safari) are sent as they are.
 */
async function shrink(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024 || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

/** Uploads files one at a time and reports progress and errors. */
export function useUploader() {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string>();

  async function upload(files: File[]): Promise<string[]> {
    setError(undefined);
    const urls: string[] = [];
    for (const original of files) {
      if (!original.type.startsWith("image/")) {
        setError(`${original.name} isn't an image.`);
        continue;
      }
      setBusy((n) => n + 1);
      try {
        const file = await shrink(original);
        if (file.size > MAX_UPLOAD) {
          setError(`${original.name} is too large. Images can be up to 10 MB.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImage(fd);
        if ("error" in res) setError(`${original.name}: ${res.error}`);
        else urls.push(res.url);
      } catch {
        setError(`${original.name} couldn't be uploaded. Check your connection and try again.`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    return urls;
  }

  return { upload, busy: busy > 0, error };
}

function filesFrom(e: React.DragEvent) {
  return Array.from(e.dataTransfer.files);
}

/** One image: upload, replace, remove, or paste a link. Submits as a hidden input named `name`. */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  disabled,
  shape = "wide",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  disabled?: boolean;
  shape?: "wide" | "square";
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [linkMode, setLinkMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUploader();

  async function take(files: File[]) {
    const [url] = await upload(files.slice(0, 1));
    if (url) setValue(url);
  }

  const box = shape === "square" ? "aspect-square max-w-40" : "aspect-[4/3] max-w-sm";

  return (
    <div className={disabled ? "opacity-60" : ""}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {/* Disabled fields aren't submitted, which clears the image on save — like the other plan-locked fields. */}
      <input type="hidden" name={name} value={value} disabled={disabled} />
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          take(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {value ? (
        <div className={`group relative overflow-hidden rounded-2xl bg-cream ring-1 ring-line ${box}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any URL */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {!disabled && (
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-8">
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink"
              >
                {busy ? "Uploading…" : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => setValue("")}
                className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) take(filesFrom(e));
          }}
          className={`grid w-full place-items-center rounded-2xl border-2 border-dashed text-center transition ${box} ${
            dragging ? "border-brand bg-sky" : "border-line bg-cream/60 hover:border-brand"
          } disabled:cursor-not-allowed`}
        >
          <span className="px-4 text-sm">
            <span className="block text-2xl" aria-hidden>
              {busy ? "⏳" : "＋"}
            </span>
            <span className="font-semibold text-brand">{busy ? "Uploading…" : "Upload image"}</span>
            {!busy && <span className="block text-muted">or drag it here</span>}
          </span>
        </button>
      )}

      {error && <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {!disabled && (
        <div className="mt-1.5">
          {linkMode ? (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.trim())}
              placeholder="https://… or /listings/photo.jpg"
              className={inputClass}
            />
          ) : (
            <button type="button" onClick={() => setLinkMode(true)} className="text-xs font-semibold text-muted hover:text-brand">
              Paste a link instead
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Several images in order: upload many at once, reorder, remove. Submits one URL per line. */
export function GalleryField({
  name,
  label,
  defaultValue,
  max,
  hint,
  disabled,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  max: number;
  hint?: string;
  disabled?: boolean;
}) {
  const [items, setItems] = useState<string[]>(defaultValue ?? []);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUploader();
  const room = Math.max(0, max - items.length);

  async function add(files: File[]) {
    const urls = await upload(files.slice(0, room));
    if (urls.length) setItems((cur) => [...cur, ...urls].slice(0, max));
  }

  return (
    <div className={disabled ? "opacity-60" : ""}>
      <span className="mb-1.5 block text-sm font-semibold">
        {label} <span className="font-normal text-muted">({items.length} of {max})</span>
      </span>
      <input type="hidden" name={name} value={items.join("\n")} disabled={disabled} />
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <div
        className={`grid grid-cols-3 gap-2 rounded-2xl p-1 sm:grid-cols-4 ${dragging ? "bg-sky ring-2 ring-brand" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && room) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && room) add(filesFrom(e));
        }}
      >
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-cream ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any URL */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-ink/60 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => setItems((cur) => cur.map((x, j) => (j === i - 1 ? cur[i] : j === i ? cur[i - 1] : x)))}
                  className="grid size-7 place-items-center rounded-full bg-white text-sm font-bold text-ink disabled:opacity-0"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}
                  className="grid size-7 place-items-center rounded-full bg-white text-sm font-bold text-rose-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
        {!disabled && room > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line bg-cream/60 text-center text-sm hover:border-brand"
          >
            <span>
              <span className="block text-xl" aria-hidden>
                {busy ? "⏳" : "＋"}
              </span>
              <span className="font-semibold text-brand">{busy ? "Uploading…" : "Add photos"}</span>
            </span>
          </button>
        )}
      </div>
      {items.length > max && !disabled && (
        <p className="mt-2 text-sm font-medium text-amber-800">
          Remove {items.length - max} photo{items.length - max === 1 ? "" : "s"} to fit this plan.
        </p>
      )}
      {error && <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
