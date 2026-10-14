import { faqs } from "@/lib/faq";

export function Faq() {
  return (
    <div className="divide-y divide-line rounded-3xl bg-paper ring-1 ring-line">
      {faqs.map((f) => (
        <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-semibold">
            {f.q}
            <span aria-hidden className="text-2xl text-brand transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
