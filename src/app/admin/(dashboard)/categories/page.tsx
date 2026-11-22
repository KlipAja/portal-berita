"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";
import { FolderTree, Plus, AlertCircle, Trash2 } from "lucide-react";
import { Category } from "@/types/news";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (data) setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(generateSlug(val));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.from("categories").insert([
      {
        name,
        slug: slug || generateSlug(name),
        description: description || null,
      },
    ]);

    if (error) {
      setErrorMsg(error.message || "Gagal menambahkan kategori.");
      setLoading(false);
      return;
    }

    setName("");
    setSlug("");
    setDescription("");
    setLoading(false);
    loadCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Manajemen Kategori & Rubrik Berita
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Atur rubrikasi berita portal media (Nasional, Politik, Bisnis, Teknologi, dll).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah Kategori */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Tambah Kategori Baru
              </CardTitle>
              <CardDescription>Buat rubrikasi berita baru.</CardDescription>
            </CardHeader>
            <CardContent>
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Hukum & Kriminal"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="hukum-kriminal"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi untuk SEO rubrik..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  {loading ? "Menyimpan..." : "Simpan Kategori"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Tabel Daftar Kategori */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-slate-700" />
                Daftar Rubrik Aktif ({categories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Nama Rubrik</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Deskripsi</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">
                          /{cat.slug}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {cat.description || "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
