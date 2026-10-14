// "What" + "where" search that submits to /search. A plain GET form, so it works before
// any JavaScript loads and results pages can be bookmarked or shared.
export function SearchBar({
  places,
  q = "",
  where = "",
  size = "lg",
}: {
  places: string[];
  q?: string;
  where?: string;
  size?: "lg" | "md";
}) {
  const big = size === "lg";
  const field = `w-full bg-transparent outline-none placeholder:text-muted/70 ${big ? "text-lg" : ""}`;
  return (
    <form
      action="/search"
      role="search"
      className={`flex flex-col gap-2 rounded-3xl bg-paper p-2 shadow-xl shadow-brand/10 ring-1 ring-line md:flex-row md:items-center md:gap-0 md:rounded-full ${
        big ? "md:p-2.5" : ""
      }`}
    >
      <label className={`flex flex-1 items-center gap-3 rounded-2xl px-4 md:rounded-full ${big ? "py-3" : "py-2.5"}`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">What do you need? For example plumber, pool care or bagels</span>
        <input name="q" defaultValue={q} placeholder="What do you need?" autoComplete="off" className={field} />
      </label>
      <span aria-hidden className="hidden h-8 w-px bg-line md:block" />
      <label className={`flex items-center gap-3 rounded-2xl px-4 md:flex-[0.8] md:rounded-full ${big ? "py-3" : "py-2.5"}`}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-coral" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        <span className="sr-only">Where?</span>
        <input
          name="where"
          defaultValue={where}
          placeholder="City or ZIP"
          list="search-places"
          autoComplete="off"
          className={field}
        />
        <datalist id="search-places">
          {places.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </label>
      <button
        type="submit"
        className={`rounded-2xl bg-brand font-semibold text-white transition hover:bg-navy md:rounded-full ${
          big ? "px-8 py-3.5 text-lg" : "px-6 py-3"
        }`}
      >
        Search
      </button>
    </form>
  );
}
