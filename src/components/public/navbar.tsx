"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Newspaper, Search, Users, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category, Post } from "@/types/news";

interface PublicNavbarProps {
  categories?: Category[];
  breakingNews?: Post[];
}

export function PublicNavbar({
  categories = [],
  breakingNews = [],
}: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayFormatted, setTodayFormatted] = useState("Senin, 23 November 2026");

  useEffect(() => {
    try {
      const formatted = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date());
      setTodayFormatted(formatted);
    } catch (e) {
      // fallback
    }
  }, []);

  // Kategori default jika database belum diisi
  const defaultCategories = [
    { id: 1, name: "Nasional", slug: "nasional" },
    { id: 2, name: "Politik", slug: "politik" },
    { id: 3, name: "Bisnis", slug: "bisnis" },
    { id: 4, name: "Teknologi", slug: "teknologi" },
    { id: 5, name: "Gaya Hidup", slug: "gaya-hidup" },
    { id: 6, name: "Olahraga", slug: "olahraga" },
  ];

  const displayCategories =
    categories.length > 0 ? categories : defaultCategories;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      {/* Top Bar: Breaking News & Date */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Badge variant="destructive" className="uppercase text-[10px] px-1.5 py-0 shrink-0 font-bold">
              Sekilas Berita
            </Badge>
            <div className="truncate text-slate-300 text-xs">
              {breakingNews.length > 0 ? (
                <Link
                  href={`/berita/${breakingNews[0].slug}`}
                  className="hover:underline hover:text-white"
                >
                  {breakingNews[0].title}
                </Link>
              ) : (
                <span>Kawal Transparansi dan Integritas Jurnalisme Publik Indonesia</span>
              )}
            </div>
          </div>
          <div suppressHydrationWarning className="hidden sm:block text-slate-400 text-[11px] shrink-0">
            {todayFormatted}
          </div>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-950 font-serif">
              PORTAL<span className="text-blue-600">BERITA</span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Aktual • Tajam • Terpercaya
            </p>
          </div>
        </Link>

        {/* Action Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5 border-slate-300"
            >
              <Users className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline">Meja Redaksi</span>
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav className="border-t border-slate-100 hidden md:block bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1.5 text-sm font-semibold text-slate-700">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white transition-colors"
            >
              Beranda
            </Link>
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Jurnalisme Terverifikasi Dewan Pers
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Beranda
          </Link>
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              {cat.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50"
            >
              Masuk Portal Redaksi
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
