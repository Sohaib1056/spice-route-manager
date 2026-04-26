export default function ShopAbout() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <h1 className="font-display text-4xl font-bold text-[#f5e6d0]">About DryFruit Pro</h1>
      <p className="mt-6 text-lg text-[#f5e6d0]/80">
        For three generations, our family has sourced the finest dry fruits and spices from the orchards of Pakistan, Iran, and Kashmir. We believe in honest pricing, pure quality, and direct-from-source freshness.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { n: "30+", l: "Years of trade" },
          { n: "5,000+", l: "Happy families" },
          { n: "100%", l: "Pure & natural" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-[#fff8f0] p-6 text-center text-[#3b1a00]">
            <p className="font-display text-3xl font-bold text-[#c8860a]">{s.n}</p>
            <p className="mt-1 text-sm">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
