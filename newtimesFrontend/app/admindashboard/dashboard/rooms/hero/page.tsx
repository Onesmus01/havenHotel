"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  ArrowRight,
  ImageIcon,
  Check,
  CloudUpload,
  Crown,
  Sparkles,
  Gem,
  Star,
  Clock,
  Weight,
  Images,
  FileImage,
  AlertCircle,
} from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function HeroAdminPage() {
  const router = useRouter();
  const [hero, setHero] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const res = await fetch(`${backendUrl}/room/hero/active`, {
        credentials: "include",
      });
      const data = await res.json();
      setHero(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch active hero");
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return setMessage("Please select an image");
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`${backendUrl}/room/hero/add-hero`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMessage("Hero image uploaded successfully");
      setImage(null);
      setPreview(null);
      fetchHero();
      toast.success("Hero uploaded successfully");
    } catch (err) {
      setMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!hero || !image) return toast.error("Select an image and have an active hero");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`${backendUrl}/room/hero/${hero._id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Hero image updated successfully");
      setImage(null);
      setPreview(null);
      fetchHero();
      toast.success("Hero updated successfully");
    } catch (err) {
      setMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!hero) return toast.error("No hero image to delete");
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/room/hero/${hero._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Hero image deleted successfully");
      setHero(null);
      toast.success("Hero deleted successfully");
    } catch (err) {
      setMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const isSuccess = message.includes("success") || message.includes("✅");

  return (
    <div className="min-h-screen bg-[#faf8f5] relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#f0ebe3] to-transparent" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#e8d5a3]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-[#e0d5c7]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-[#e8d5a3]/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header
          className={`mb-8 sm:mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4 sm:mb-5">
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#c5a55a]" />
                <Crown className="text-[#c5a55a] w-4 h-4 sm:w-5 sm:h-5" />
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#c5a55a]" />
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1f1913] tracking-tight">
                Hero Image
                <span className="block text-[#c5a55a] italic font-light mt-1 sm:mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif">
                  Administration
                </span>
              </h1>
              <p className="mt-2 sm:mt-3 text-[#9a7d5c] font-serif text-base sm:text-lg italic">
                Curate the visual identity of your establishment
              </p>
            </div>

            <button
              onClick={() => router.push("/admindashboard/dashboard/rooms/hero/viewHeros")}
              className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-[#1f1913] text-white rounded-2xl font-medium text-sm tracking-wide hover:bg-[#3d3124] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl self-start md:self-auto shrink-0"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c5a55a]/20 flex items-center justify-center group-hover:bg-[#c5a55a]/30 transition-colors">
                <Images className="text-[#c5a55a] w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="hidden sm:inline">View All Heroes</span>
              <span className="sm:hidden">All Heroes</span>
              <ArrowRight className="text-[#9a7d5c] group-hover:translate-x-1 transition-transform w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </header>

        {/* Active Hero Section */}
        <section
          className={`mb-8 sm:mb-10 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-white/88 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_0_0_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-emerald-600">
                  Currently Active
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913]">
                Featured Hero Image
              </h2>
            </div>

            <div className="px-5 sm:px-8 pb-6 sm:pb-8">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#f0ebe3]">
                {hero?.imageUrl ? (
                  <>
                    <img
                      src={hero.imageUrl}
                      alt="Active Hero"
                      className="w-full h-52 sm:h-64 md:h-80 lg:h-96 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-0">
                        <div>
                          <p className="text-white/60 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                            Last updated
                          </p>
                          <p className="text-white font-serif text-base sm:text-lg">
                            {formatDate(hero.updatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2.5 sm:px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white text-[10px] sm:text-xs font-medium border border-white/10">
                            {hero.dimensions || "1920 x 800"}
                          </span>
                          <span className="px-2.5 sm:px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white text-[10px] sm:text-xs font-medium border border-white/10">
                            {formatFileSize(hero.fileSize)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-52 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#c9b8a3] mx-auto mb-3 sm:mb-4" />
                      <p className="text-[#9a7d5c] font-medium text-sm sm:text-base">
                        No active hero image
                      </p>
                      <p className="text-xs sm:text-sm text-[#c9b8a3] mt-1">
                        Upload a new hero to get started
                      </p>
                    </div>
                  </div>
                )}
                {/* Inner frame decoration */}
                <div className="absolute inset-2 sm:inset-3 border border-[#c5a55a]/25 rounded-lg sm:rounded-xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Upload & Manage Section */}
        <section
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-white/88 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/40 shadow-lg">
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-[#f0ebe3]">
              <div className="flex items-center gap-4 mb-3 sm:mb-4">
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#c5a55a]" />
                <Sparkles className="text-[#c5a55a] w-4 h-4 sm:w-5 sm:h-5" />
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#c5a55a]" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913] text-center">
                Upload & Manage
              </h2>
              <p className="text-center text-[#9a7d5c] font-serif italic mt-1.5 sm:mt-2 text-sm sm:text-base px-2">
                Select a new image to replace or update the current hero
              </p>
            </div>

            <div className="p-5 sm:p-8">
              {/* Preview Area */}
              {preview && (
                <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#f0ebe3] border border-[#e0d5c7]">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] sm:text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 border border-white/10">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Preview
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="text-white/80 text-xs sm:text-sm">{image?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="mb-6 sm:mb-8">
                <label className="relative block p-6 sm:p-8 text-center border-2 border-dashed border-[#c9b8a3] rounded-xl sm:rounded-2xl hover:border-[#c5a55a] hover:bg-[#c5a55a]/[0.04] transition-all duration-400 cursor-pointer group hover:scale-[1.01]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#f0ebe3] flex items-center justify-center group-hover:bg-[#e0d5c7] transition-colors">
                      <CloudUpload className="w-5 h-5 sm:w-7 sm:h-7 text-[#9a7d5c]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#5c4a36] text-sm sm:text-base">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-xs sm:text-sm text-[#9a7d5c] mt-1">
                        Supports JPG, PNG, WebP up to 10MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Upload */}
                <button
                  onClick={handleUpload}
                  disabled={loading || !image}
                  className="group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1f1913] text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm tracking-wide hover:bg-[#3d3124] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
                    <Upload className="text-[#c5a55a] w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div className="text-left min-w-0 relative z-10">
                    <span className="block truncate">
                      {loading ? "Uploading..." : "Upload New Hero"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#9a7d5c] font-normal hidden sm:block">
                      Create a new hero image
                    </span>
                  </div>
                </button>

                {/* Update */}
                <button
                  onClick={handleUpdate}
                  disabled={loading || !hero || !image}
                  className="group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#c5a55a] text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm tracking-wide hover:bg-[#b8941f] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                    <RefreshCw className={`text-white w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                  </span>
                  <div className="text-left min-w-0 relative z-10">
                    <span className="block truncate">
                      {loading ? "Updating..." : "Update Current"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#e8d5a3] font-normal hidden sm:block">
                      Replace existing hero
                    </span>
                  </div>
                </button>

                {/* Delete */}
                <button
                  onClick={handleDelete}
                  disabled={loading || !hero}
                  className="group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-red-50 text-red-700 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm tracking-wide border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 sm:col-span-2 lg:col-span-1 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors shrink-0">
                    <Trash2 className="text-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div className="text-left min-w-0 relative z-10">
                    <span className="block truncate">
                      {loading ? "Deleting..." : "Delete Hero"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-red-400 font-normal hidden sm:block">
                      Remove permanently
                    </span>
                  </div>
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={`mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 animate-in slide-in-from-right duration-500 ${
                    isSuccess
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSuccess ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    {isSuccess ? (
                      <Check className="text-emerald-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <AlertCircle className="text-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <p
                    className={`font-medium text-xs sm:text-sm ${
                      isSuccess ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {message.replace("✅", "").trim()}
                  </p>
                </div>
              )}
            </div>

            {/* Footer ornament */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#c5a55a]" />
                <Gem className="text-[#c5a55a] w-3 h-3 sm:w-4 sm:h-4" />
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#c5a55a]" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          className={`mt-6 sm:mt-8 mb-6 sm:mb-8 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/85 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-white/30 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#c5a55a]/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <ImageIcon className="text-[#c5a55a] w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913]">12</p>
              <p className="text-[10px] sm:text-xs text-[#9a7d5c] mt-0.5 sm:mt-1 uppercase tracking-wider">
                Total Heroes
              </p>
            </div>
            <div className="bg-white/85 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-white/30 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Eye className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913]">
                {hero ? "1" : "0"}
              </p>
              <p className="text-[10px] sm:text-xs text-[#9a7d5c] mt-0.5 sm:mt-1 uppercase tracking-wider">
                Active
              </p>
            </div>
            <div className="bg-white/85 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-white/30 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913]">3d</p>
              <p className="text-[10px] sm:text-xs text-[#9a7d5c] mt-0.5 sm:mt-1 uppercase tracking-wider">
                Last Updated
              </p>
            </div>
            <div className="bg-white/85 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-white/30 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Weight className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#1f1913]">
                2.4<span className="text-xs sm:text-sm font-normal text-[#9a7d5c] ml-1">MB</span>
              </p>
              <p className="text-[10px] sm:text-xs text-[#9a7d5c] mt-0.5 sm:mt-1 uppercase tracking-wider">
                File Size
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-3 sm:mb-4 opacity-50">
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#c5a55a]" />
            <Star className="text-[#c5a55a] w-3 h-3 sm:w-4 sm:h-4" />
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#c5a55a]" />
          </div>
          <p className="text-[#c9b8a3] text-xs sm:text-sm font-serif italic">
            Crafted with excellence for your establishment
          </p>
        </footer>
      </div>
    </div>
  );
}