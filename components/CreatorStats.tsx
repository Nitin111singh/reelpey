"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Eye, IndianRupee, Megaphone, Clock, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 150,
    suffix: "+",
    label: "Creators",
    color: "text-violet-400",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/20",
    bg: "bg-violet-500/10",
    display: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString(),
  },
  {
    icon: Eye,
    value: 5,
    suffix: " Billion+",
    label: "Views Generated",
    color: "text-cosmic-cyan",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/10",
    display: (n: number) => n.toString(),
  },
  {
    icon: IndianRupee,
    value: 50,
    suffix: " Lakh+",
    label: "Paid to Creators",
    color: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
    display: (n: number) => n.toString(),
  },
  {
    icon: Megaphone,
    value: 200,
    suffix: "+",
    label: "Brand Campaigns",
    color: "text-cosmic-purple",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10",
    display: (n: number) => n.toString(),
  },
  {
    icon: Clock,
    value: 48,
    suffix: " hrs post verify",
    label: "Avg. Payout Time",
    color: "text-amber-400",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
    display: (n: number) => n.toString(),
  },
  {
    icon: CheckCircle,
    value: 98,
    suffix: "%",
    label: "Approval Rate",
    color: "text-rose-400",
    glow: "shadow-rose-500/20",
    border: "border-rose-500/20",
    bg: "bg-rose-500/10",
    display: (n: number) => n.toString(),
  },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

function StatCard({ stat, active }: { stat: (typeof stats)[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);
  const Icon = stat.icon;

  return (
    <div
      className={`group relative rounded-2xl border ${stat.border} ${stat.bg} p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${stat.glow}`}
    >
      <div className={`mb-4 inline-flex rounded-xl ${stat.bg} border ${stat.border} p-3`}>
        <Icon className={`h-6 w-6 ${stat.color}`} />
      </div>

      <div className={`text-4xl font-extrabold tracking-tight ${stat.color}`}>
        {stat.display(count)}
        <span className="text-3xl">{stat.suffix}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-white/50">{stat.label}</p>

      {/* subtle corner glow */}
      <div
        className={`pointer-events-none absolute -bottom-px -right-px h-20 w-20 rounded-br-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{ background: `radial-gradient(circle at bottom right, currentColor 0%, transparent 70%)` }}
      />
    </div>
  );
}

export default function CreatorStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 sm:py-32">
      {/* faint radial glow behind section */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[800px] rounded-full bg-cosmic-violet/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            The Numbers{" "}
            <span className="gradient-text">Speak for Themselves</span>
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-2xl mx-auto">
            Thousands of creators trust Reelpey to turn their short-form content into a consistent income stream.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
