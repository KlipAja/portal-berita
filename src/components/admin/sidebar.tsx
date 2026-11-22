"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  FolderTree,
  Users,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { UserRole } from "@/types/news";

interface SidebarProps {
  userRole?: UserRole;
  userEmail?: string;
}

export function AdminSidebar({ userRole = "reporter" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["admin", "editor", "reporter"],
    },
    {
      title: "Semua Berita",
      href: "/admin/posts",
      icon: FileText,
      roles: ["admin", "editor", "reporter"],
    },
    {
      title: "Tulis Berita Baru",
      href: "/admin/posts/new",
      icon: PenSquare,
      roles: ["admin", "editor", "reporter"],
    },
    {
      title: "Kategori & Topik",
      href: "/admin/categories",
      icon: FolderTree,
      roles: ["admin", "editor"],
    },
    {
      title: "Tim Redaksi",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <Newspaper className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight">
            REDAKSI<span className="text-blue-500">CMS</span>
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Portal Konten Berita
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigasi Redaksi
        </div>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Portal Publik Link */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span>Kunjungi Portal Publik</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
