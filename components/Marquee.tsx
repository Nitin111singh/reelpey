const campaigns = [
  "Why Reelpey?",
  "Verified Niche Views Only",
  "Every View Actually Counts",
  "Cheaper Than Meta Ads",
  "No Wasted Ad Spend",
  "Targeted Audience Reach",
  "Pay Only For Verified Views",
  "Built For Modern Brands",
  "Creators Drive Real Attention",
  "Higher ROI Than Instagram Ads",
  "Clipping That Converts",
  "Reach The Right Community",
  "Performance Over Impressions",
  "Organic Viral Distribution",
  "Scale Campaigns Efficiently",
  "Smart Promotion For Startups",
  "Audience First Advertising",
  "Turn Clips Into Customers",
  "Precision Marketing Engine",
  "Where Brands Get Seen",
];

export default function Marquee() {
  // Duplicate for seamless loop
  const items = [...campaigns, ...campaigns];

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-cosmic-surface/50 py-5">
      {/* Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-cosmic-deep to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-cosmic-deep to-transparent" />

      <div
        className="flex animate-marquee whitespace-nowrap"
        style={{ "--marquee-duration": "40s" } as React.CSSProperties}
      >
        {items.map((name, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cosmic-violet/60" />
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
