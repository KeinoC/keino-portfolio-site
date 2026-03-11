"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#090909]/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-headline text-[20px] font-bold text-white tracking-tight"
        >
          KC
        </Link>
        <div className="flex items-center gap-8">
          <a
            href="#work"
            className="font-body text-[14px] text-[#666] hover:text-white transition-colors"
          >
            Work
          </a>
          <a
            href="#experience"
            className="font-body text-[14px] text-[#666] hover:text-white transition-colors"
          >
            Experience
          </a>
          <a
            href="#about"
            className="font-body text-[14px] text-[#666] hover:text-white transition-colors"
          >
            About
          </a>
          <a
            href="#contact"
            className="font-body text-[14px] text-[#666] hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
