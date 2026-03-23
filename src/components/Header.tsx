"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, SITE_TITLE } from "@/lib/constants";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const navLinkClass =
  "text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.isAdmin === true;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-bitcoin hover:opacity-80 transition"
        >
          {SITE_TITLE}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link key={key} href={`/category/${key}`} className={navLinkClass}>
              {cat.name}
            </Link>
          ))}
          <Link href="/about" className={navLinkClass}>
            About
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-bitcoin hover:text-bitcoin-dark transition"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <div
            id="txid-auth-mount"
            style={{ position: "relative", display: "inline-flex" }}
          />
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition p-1"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-neutral-500 dark:text-neutral-400 p-1"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav id="mobile-nav" className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 space-y-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link
              key={key}
              href={`/category/${key}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1"
          >
            About
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-bitcoin hover:text-bitcoin-dark py-1"
            >
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
