"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/news";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userFullName?: string;
  userRole?: UserRole;
  userEmail?: string;
}

export function AdminHeader({
  userFullName = "Redaksi",
  userRole = "reporter",
  userEmail,
}: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const roleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "editor":
        return "warning";
      case "reporter":
        return "default";
      default:
        return "secondary";
    }
  };

  const roleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Pemimpin Redaksi (Admin)";
      case "editor":
        return "Redaktur (Editor)";
      case "reporter":
        return "Wartawan (Reporter)";
      default:
        return role;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Ruang Kerja Redaksi
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {userFullName}
              </span>
              <Badge variant={roleBadgeVariant(userRole)} className="text-[10px] px-1.5 py-0 uppercase">
                {userRole}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{userEmail || roleLabel(userRole)}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-xs text-slate-600 hover:text-red-600 hover:border-red-200 flex items-center gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
