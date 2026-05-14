import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Target,
  Users,
  BarChart3,
  Rocket,
  BadgeDollarSign,
} from "lucide-react";
import Link from "next/link";

const perks = [
  {
    icon: ShieldCheck,
    title: "Pay Only For Verified Views",
    desc: "Every view is validated. You never pay for bots, inflated impressions, or wasted reach.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/15",
  },
  {
    icon: TrendingUp,
    title: "Higher ROI Than Instagram Ads",
    desc: "Organic short-form content outperforms paid placements at a fraction of the cost.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/15",
  },
  {
    icon: Zap,
    title: "No Wasted Ad Spend",
    desc: "Budget goes directly to creators delivering results — not to auction algorithms.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/15",
  },
  {
    icon: Target,
    title: "Targeted Audience Reach",
    desc: "Creators are matched to your niche, so your brand lands in front of the right community.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/15",
  },
  {
    icon: Users,
    title: "Creators Drive Real Attention",
    desc: "60K+ creators turn your product into content people actually watch, share, and act on.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/15",
  },
  {
    icon: BarChart3,
    title: "Performance Over Impressions",
    desc: "We track clicks, retention, and verified views — not vanity metrics.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/15",
  },
  {
    icon: Rocket,
    title: "Scale Campaigns Efficiently",
    desc: "Spin up a campaign within hours and scale reach without increasing your team size.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/15",
  },
  {
    icon: BadgeDollarSign,
    title: "Cheaper Than Meta Ads",
    desc: "Get more views per dollar than any paid social platform — with better brand recall.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/15",
  },
];

export default function BrandsSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Rocket className="h-3.5 w-3.5" />
            For Brands &amp; Advertisers
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Why Smart Brands{" "}
            <span className="gradient-text">Choose Reelpey</span>
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-2xl mx-auto">
            Stop burning budget on ads that get scrolled past. Let 60,000+ creators
            put your brand in front of the audiences that actually care.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`group relative rounded-2xl border ${p.border} ${p.bg} p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className={`mb-4 inline-flex rounded-xl ${p.bg} border ${p.border} p-2.5`}>
                  <Icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{p.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="#campaign-request"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-8 py-4 text-base font-semibold text-white shadow-xl shadow-cosmic-violet/20 transition-all hover:shadow-2xl hover:shadow-cosmic-violet/30 hover:scale-[1.02]"
          >
            Launch Your Campaign
          </Link>
          <p className="mt-3 text-sm text-white/30">No upfront fees. Go live within hours.</p>
        </div>
      </div>
    </section>
  );
}
