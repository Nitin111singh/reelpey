"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle, X } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_LINKS } from "@/config/contact";
import DiscordIcon from "@/components/icons/DiscordIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";

const channels = [
  {
    label: "Instagram",
    hint: "DM us @reelpey",
    href: CONTACT_LINKS.instagram,
    icon: InstagramIcon,
    ring: "group-hover:ring-cosmic-pink/50",
    tint: "text-cosmic-pink",
  },
  {
    label: "Discord",
    hint: "Join the creator community",
    href: CONTACT_LINKS.discord,
    icon: DiscordIcon,
    ring: "group-hover:ring-cosmic-blue/50",
    tint: "text-cosmic-blue",
  },
  {
    label: "Email",
    hint: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: Mail,
    ring: "group-hover:ring-cosmic-cyan/50",
    tint: "text-cosmic-cyan",
  },
];

export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Admin has its own internal chrome — the public contact widget doesn't belong there.
  const hidden = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Close on navigation so the panel never survives a route change. Adjusted
  // during render rather than in an effect — the widget lives in the root
  // layout, so it never unmounts between routes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      /* bottom-24 on mobile clears the dashboard's fixed bottom nav; z-40 keeps
         the widget under modals (z-50) so it can never cover a dialog. */
      className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6"
    >
      {open && (
        <div
          id="contact-panel"
          role="dialog"
          aria-label="Contact Reelpey"
          className="glass w-64 overflow-hidden rounded-2xl border border-white/10 p-2 shadow-2xl shadow-black/40 animate-fade-in-up"
        >
          <p className="px-3 pt-2 pb-3 text-xs font-semibold tracking-wide text-white/40 uppercase">
            Get in touch
          </p>
          <ul className="flex flex-col gap-1">
            {channels.map(({ label, hint, href, icon: Icon, ring, tint }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 transition-all ${ring} ${tint}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white/90">
                      {label}
                    </span>
                    <span className="block truncate text-xs text-white/40">
                      {hint}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="contact-panel"
        aria-label={open ? "Close contact options" : "Contact us"}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-cyan px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/25 transition-all hover:opacity-90 active:scale-95 md:px-5"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        <span className={open ? "hidden" : "hidden sm:inline"}>Contact Us</span>
      </button>
    </div>
  );
}
