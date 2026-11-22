import Link from "next/link";
import { Newspaper, Shield, FileCheck, Mail } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                <Newspaper className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PORTAL<span className="text-blue-500">BERITA</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Media daring independen yang menyajikan liputan berita terkini, analisis mendalam, dan fakta akurat berlandaskan kode etik jurnalistik.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              <span>Berpedoman pada UU Pers No. 40 Tahun 1999</span>
            </div>
          </div>

          {/* Col 2: Rubrikasi */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Rubrik Populer
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/kategori/nasional" className="hover:text-white transition-colors">
                  Nasional
                </Link>
              </li>
              <li>
                <Link href="/kategori/politik" className="hover:text-white transition-colors">
                  Politik & Hukum
                </Link>
              </li>
              <li>
                <Link href="/kategori/bisnis" className="hover:text-white transition-colors">
                  Bisnis & Ekonomi
                </Link>
              </li>
              <li>
                <Link href="/kategori/teknologi" className="hover:text-white transition-colors">
                  Teknologi & Sains
                </Link>
              </li>
              <li>
                <Link href="/kategori/olahraga" className="hover:text-white transition-colors">
                  Olahraga
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standar Redaksi & Kode Etik */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Kanal Informasi
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-white cursor-pointer">
                  Pedoman Pemberitaan Media Siber
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">
                  Susunan Dewan Redaksi
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">
                  Kebijakan Privasi
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">
                  Ketentuan Layanan & Hak Cipta
                </span>
              </li>
              <li>
                <Link href="/admin/login" className="text-blue-400 hover:text-blue-300">
                  Login Redaksi & Jurnalis
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak Redaksi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Kontak Redaksi
            </h4>
            <p className="text-xs">
              Kirimkan rilis pers, hak jawab, atau aduan masyarakat ke meja redaksi kami:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span>redaksi@portalberita.com</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Layanan Berita 24 Jam Non-Stop
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 Portal Berita. Seluruh hak cipta dilindungi undang-undang.</p>
          <p>Dibangun dengan arsitektur Next.js 15, Supabase, & Serverless Bebas Biaya Server.</p>
        </div>
      </div>
    </footer>
  );
}
