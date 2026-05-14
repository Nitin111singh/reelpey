"use client";

import { useEffect, useRef } from "react";
import { Link2, Upload, DollarSign } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Link2,
    title: "Link Account",
    description:
      "Connect your social profiles to verify ownership of your content channels.",
    gradient: "from-cosmic-violet to-cosmic-purple",
  },
  {
    icon: Upload,
    title: "Submit Content",
    description:
      "Create and post content, then submit your link to start tracking views automatically.",
    gradient: "from-cosmic-purple to-cosmic-blue",
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description:
      "Earn automatically for every verified view your content generates. Cash out anytime.",
    gradient: "from-cosmic-blue to-cosmic-cyan",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-violet/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            How <span className="gradient-text">Reelpey</span> Works
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-xl mx-auto">
            The easiest way to get paid for your content. Three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {/* Connecting Line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-cosmic-violet/40 via-cosmic-blue/40 to-cosmic-cyan/40" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="reveal relative flex flex-col items-center text-center"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-cosmic-deep border border-white/10 text-xs font-bold text-white/50 md:top-0 md:right-auto md:left-auto">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg mb-6`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40 max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center reveal">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-cyan px-8 py-4 text-base font-semibold text-white shadow-xl shadow-cosmic-violet/20 transition-all hover:shadow-2xl hover:shadow-cosmic-violet/30 hover:scale-[1.02]"
          >
            Start Earning Now
          </Link>
        </div>
      </div>
    </section>
  );
}
