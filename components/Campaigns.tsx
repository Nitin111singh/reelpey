"use client";

import { useState } from "react";
import CampaignCard from "./CampaignCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const campaignData = {
  "Most Popular": [
    { name: "Reelpey [UGC]", budget: "$10,000", rate: "$1,500", budgetUsed: 12, category: "UGC" },
    { name: "OneState [CLIPPING] 4", budget: "$3,000", rate: "$1,500", budgetUsed: 3, category: "CLIPPING" },
    { name: "klepto [EDITS]", budget: "$1,000", rate: "$1,250", budgetUsed: 23, category: "EDITS" },
    { name: "Yeat × EsDeeKid [EDITS]", budget: "$2,910", rate: "$1,000", budgetUsed: 27, category: "EDITS" },
    { name: "Plutus.gg [CLIPPING]", budget: "$4,000", rate: "$1,000", budgetUsed: 22, category: "CLIPPING" },
    { name: "Dubbing AI [GAMING] 4", budget: "$3,000", rate: "$750", budgetUsed: 55, category: "GAMING" },
  ],
  Music: [
    { name: "klepto [EDITS]", budget: "$1,000", rate: "$1,250", budgetUsed: 23, category: "EDITS" },
    { name: "Yeat × EsDeeKid [EDITS]", budget: "$2,910", rate: "$1,000", budgetUsed: 27, category: "EDITS" },
    { name: "Love Letter [EDITS]", budget: "$3,000", rate: "$1,000", budgetUsed: 68, category: "EDITS" },
    { name: "Hermeneutics [GYM]", budget: "$1,250", rate: "$800", budgetUsed: 33, category: "GYM" },
    { name: "Shark Business [EDITS]", budget: "$1,660", rate: "$500", budgetUsed: 23, category: "EDITS" },
    { name: "Get Out My Head", budget: "$2,500", rate: "$500", budgetUsed: 34, category: "EDITS" },
  ],
  Clipping: [
    { name: "OneState [CLIPPING] 4", budget: "$3,000", rate: "$1,500", budgetUsed: 3, category: "CLIPPING" },
    { name: "Plutus.gg [CLIPPING]", budget: "$4,000", rate: "$1,000", budgetUsed: 22, category: "CLIPPING" },
    { name: "Jessie Ware [CLIPPING]", budget: "$2,600", rate: "$1,000", budgetUsed: 84, category: "CLIPPING" },
    { name: "Kian Hoss [ROUND 3]", budget: "$4,410", rate: "$800", budgetUsed: 29, category: "CLIPPING" },
    { name: "Dubbing AI [GAMING] 4", budget: "$3,000", rate: "$750", budgetUsed: 55, category: "GAMING" },
    { name: "ScratchAdventure [CLIPPING]", budget: "$2,500", rate: "$600", budgetUsed: 40, category: "CLIPPING" },
  ],
  Branding: [
    { name: "NoLimitCity [GAMBA]", budget: "$3,000", rate: "$200", budgetUsed: 69, category: "GAMBA" },
    { name: "B.Site [CS2] 3", budget: "$3,000", rate: "$100", budgetUsed: 23, category: "GAMING" },
    { name: "Acebet [LIVESTREAM]", budget: "$3,000", rate: "$80", budgetUsed: 97, category: "LIVESTREAM" },
    { name: "Bitz.io [GENERAL - PR]", budget: "$10,000", rate: "$80", budgetUsed: 4, category: "GENERAL" },
    { name: "Betstrike [GAMING]", budget: "$2,000", rate: "$50", budgetUsed: 61, category: "GAMING" },
    { name: "Betstrike [SPORTS]", budget: "$4,000", rate: "$50", budgetUsed: 69, category: "SPORTS" },
  ],
};

const tabs = Object.keys(campaignData) as (keyof typeof campaignData)[];

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState<keyof typeof campaignData>("Most Popular");

  return (
    <section id="campaigns" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Explore <span className="gradient-text">Active Campaigns</span>
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-2xl mx-auto">
            Browse campaigns from 200+ brands. Find the perfect match for your content style and start earning.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cosmic-violet to-cosmic-blue text-white shadow-lg shadow-cosmic-violet/20"
                  : "text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 border border-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Views summary */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-white/40">
            <span className="text-cosmic-cyan font-bold text-base">5 Billion+</span>{" "}
            organic targeted views generated till now for brands
          </p>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaignData[activeTab].map((campaign, index) => (
            <div
              key={`${activeTab}-${index}`}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href="#"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white/70 transition-all hover:border-cosmic-violet/30 hover:bg-cosmic-violet/10 hover:text-white"
          >
            View All Campaigns
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
