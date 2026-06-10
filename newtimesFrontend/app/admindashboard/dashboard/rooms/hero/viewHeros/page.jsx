"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  ImageIcon,
  AlertTriangle,
  X,
  Eye,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function AllHeroesPage() {
  const router = useRouter();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  // Fetch all hero images
  const fetchHeroes = async () => {
    const token = localStorage.getItem("token")
    try {
      setLoading(true);
      // Adjust this endpoint to match your backend
      const res = await fetch(`${backendUrl}/room/hero/all`, {
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      });

      // If you don't have /hero/all yet, try the active one temporarily:
      // const res = await fetch(`${backendUrl}/room/hero/active`);

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to fetch heroes");

      // Handle different response shapes
      const data = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : result.data ? [result.data] : [];
      setHeroes(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load hero images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  // Delete hero image
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token")
    try {
      setDeletingId(id);
      const res = await fetch(`${backendUrl}/room/hero/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Hero image deleted");
        setHeroes((prev) => prev.filter((h) => h._id !== id));
      } else {
        toast.error(result.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500 font-medium">Loading hero images...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <ImageIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hero Images</h1>
                <p className="text-sm text-slate-500">Manage homepage banner images</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admindashboard/dashboard/rooms/hero")}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => router.push("/admindashboard/dashboard/rooms/hero")}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Hero
              </button>
            </div>
          </div>
        </div>

        {/* Heroes Grid */}
        {heroes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No hero images yet</h3>
            <p className="text-sm text-slate-500 mb-6">Add banner images to display on the homepage</p>
            <button
              onClick={() => router.push("/admindashboard/dashboard/rooms/hero/add")}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              Add First Hero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroes.map((hero) => (
              <div
                key={hero._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={hero.image || hero.url || hero.imageUrl}
                    alt={hero.title || "Hero image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status badge */}
                  {hero.isActive && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Active
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => window.open(hero.image || hero.url, "_blank")}
                      className="bg-white text-slate-800 p-2.5 rounded-full hover:bg-slate-100 transition shadow-lg"
                      title="View full image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowConfirm(hero._id)}
                      className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition shadow-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {hero.title || "Untitled"}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {hero.createdAt ? new Date(hero.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {hero.subtitle && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{hero.subtitle}</p>
                  )}
                  
                  {/* Bottom actions (always visible) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {hero.order !== undefined ? `Order: ${hero.order}` : ""}
                    </span>
                    <button
                      onClick={() => setShowConfirm(hero._id)}
                      disabled={deletingId === hero._id}
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {deletingId === hero._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Delete Hero Image?</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently remove the image from the homepage banner. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
                disabled={deletingId === showConfirm}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm disabled:cursor-not-allowed"
              >
                {deletingId === showConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}