import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { UserRole } from "@/types/news";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole = "reporter";
  let fullName = "Jurnalis Redaksi";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      role = profile.role as UserRole;
      fullName = profile.full_name;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar userRole={role} userEmail={user?.email} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          userFullName={fullName}
          userRole={role}
          userEmail={user?.email}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
