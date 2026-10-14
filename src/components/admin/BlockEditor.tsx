"use client";

import { useRef, useState } from "react";
import type { GuideBlock } from "@/lib/types";
import { useUploader } from "./ImageField";
import { inputClass } from "./ui";

type Place = Extract<GuideBlock, { type: "places" }>["items"][number];

const LABELS: Record<GuideBlock["type"], string> = {
  p: "Paragraph",
  h: "Heading",
  list: "Bullet list",
  image: "Image",
  places: "Places",
};

const blank: Record<GuideBlock["type"], () => GuideBlock> = {
  p: () => ({ type: "p", text: "" }),
  h: () => ({ type: "h", text: "" }),
  list: () => ({ type: "list", items: [] }),
  image: () => ({ type: "image", src: "" }),
  places: () => ({ type: "places", items: [{ name: "", address: "", text: "", highlights: "" }] }),
};

/** Edits an article body as a list of blocks; the result is posted as JSON in a hidden field. */
export function BlockEditor({ name, initial }: { name: string; initial: GuideBlock[] }) {
  const [blocks, setBlocks] = useState<GuideBlock[]>(initial);
  const update = (i: number, b: GuideBlock) => setBlocks(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...blocks];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setBlocks(next);
  };
  const clean = blocks.filter((b) =>
    b.type === "p" || b.type === "h"
      ? b.text.trim()
      : b.type === "list"
        ? b.items.length
        : b.type === "image"
          ? b.src
          : b.items.some((p) => p.name.trim()),
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
      {blocks.map((b, i) => (
        <div key={i} className="rounded-2xl bg-cream/70 p-4 ring-1 ring-line">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider text-muted uppercase">{LABELS[b.type]}</span>
            <div className="flex gap-1 text-sm">
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconButton>
              <IconButton label="Move down" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>↓</IconButton>
              <IconButton label="Remove block" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}>✕</IconButton>
            </div>
          </div>
          {b.type === "p" && (
            <textarea
              rows={3}
              value={b.text}
              onChange={(e) => update(i, { ...b, text: e.target.value })}
              className={inputClass}
            />
          )}
          {b.type === "h" && (
            <input
              value={b.text}
              onChange={(e) => update(i, { ...b, text: e.target.value })}
              className={`${inputClass} font-display text-lg font-semibold`}
            />
          )}
          {b.type === "list" && (
            <textarea
              rows={4}
              placeholder="One item per line"
              value={b.items.join("\n")}
              onChange={(e) => update(i, { ...b, items: e.target.value.split("\n") })}
              onBlur={() => update(i, { ...b, items: b.items.map((s) => s.trim()).filter(Boolean) })}
              className={inputClass}
            />
          )}
          {b.type === "image" && <ImageBlockEditor block={b} onChange={(next) => update(i, next)} />}
          {b.type === "places" && <PlacesEditor items={b.items} onChange={(items) => update(i, { ...b, items })} />}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        {(Object.keys(LABELS) as GuideBlock["type"][]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setBlocks([...blocks, blank[t]()])}
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-line hover:ring-brand"
          >
            + {LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

type ImageBlock = Extract<GuideBlock, { type: "image" }>;

function ImageBlockEditor({ block, onChange }: { block: ImageBlock; onChange: (b: ImageBlock) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUploader();
  return (
    <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const [url] = await upload(Array.from(e.target.files ?? []).slice(0, 1));
          e.target.value = "";
          if (url) onChange({ ...block, src: url });
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-paper text-sm hover:border-brand"
      >
        {block.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview
          <img src={block.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="font-semibold text-brand">{busy ? "Uploading…" : "Upload image"}</span>
        )}
        {block.src && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold">
            {busy ? "Uploading…" : "Replace"}
          </span>
        )}
      </button>
      <div className="space-y-2">
        <input
          placeholder="Caption (optional)"
          value={block.caption ?? ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Describe the image for screen readers"
          value={block.alt ?? ""}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          className={inputClass}
        />
        {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </div>
  );
}

function PlacesEditor({ items, onChange }: { items: Place[]; onChange: (items: Place[]) => void }) {
  const set = (i: number, patch: Partial<Place>) => onChange(items.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <ol className="space-y-3">
      {items.map((p, i) => (
        <li key={i} className="grid gap-2 rounded-xl bg-paper p-3 ring-1 ring-line sm:grid-cols-2">
          <input placeholder={`${i + 1}. Name`} value={p.name} onChange={(e) => set(i, { name: e.target.value })} className={inputClass} />
          <input placeholder="Address" value={p.address} onChange={(e) => set(i, { address: e.target.value })} className={inputClass} />
          <input
            placeholder="Description"
            value={p.text}
            onChange={(e) => set(i, { text: e.target.value })}
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            placeholder="Highlights"
            value={p.highlights}
            onChange={(e) => set(i, { highlights: e.target.value })}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="justify-self-end text-sm font-semibold text-rose-700 hover:underline"
          >
            Remove place
          </button>
        </li>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", address: "", text: "", highlights: "" }])}
        className="text-sm font-semibold text-brand hover:underline"
      >
        + Add a place
      </button>
    </ol>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-full ring-1 ring-line hover:bg-paper disabled:opacity-30"
    >
      {children}
    </button>
  );
}
