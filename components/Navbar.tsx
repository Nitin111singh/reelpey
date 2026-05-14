"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3 shadow-lg shadow-black/20" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-cosmic-violet/40 transition-all shadow-lg shadow-black/30">
            <Image
              src="/reelpeyy.png"
              alt="Reelpey"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Reel<span className="gradient-text">pey</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#campaigns" className="text-sm font-medium text-white/60 transition-colors hover:text-white">
            Campaigns
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-white/60 transition-colors hover:text-white">
            How It Works
          </Link>
          <Link href="#" className="text-sm font-medium text-white/60 transition-colors hover:text-white">
            Creators
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#campaign-request"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-cosmic-violet/50 hover:text-white hover:shadow-lg hover:shadow-cosmic-violet/10"
          >
            Launch Campaign
          </a>
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-cyan px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-cosmic-violet/25"
          >
            Join as Creator
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/80 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="glass mt-2 mx-4 rounded-2xl p-6 md:hidden animate-fade-in-up">
          <div className="flex flex-col gap-4">
            <a href="#campaigns" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              Campaigns
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              How It Works
            </a>
            <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              Creators
            </a>
            <hr className="border-white/10" />
            <a
              href="#campaign-request"
              className="rounded-full border border-white/10 px-5 py-2.5 text-center text-sm font-medium text-white/80 transition-all hover:border-cosmic-violet/50 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Launch Campaign
            </a>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-cyan px-5 py-2.5 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
              onClick={() => setMobileOpen(false)}
            >
              Join as Creator
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
