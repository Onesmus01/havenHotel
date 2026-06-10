"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ImagePlus,
  X,
  Hash,
  BedDouble,
  Type,
  Maximize,
  Users,
  Eye,
  Layers,
  Star,
  DollarSign,
  AlignLeft,
  CheckSquare,
  Wifi,
  ArrowLeft,
  Upload,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function UpdateRoom() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    roomNumber: "",
    type: "",
    price: "",
    originalPrice: "",
    size: "",
    capacity: "",
    view: "",
    floor: "",
    rating: "",
    description: "",
    features: [],
    amenities: [],
    status: "available",
  });

  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [images, setImages] = useState([]);           // new files to upload
  const [existingImages, setExistingImages] = useState([]); // current room images
  const [imagesToDelete, setImagesToDelete] = useState([]);   // marked for deletion

  // Fetch existing room data
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/room/${roomId}`);
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Failed to fetch room");

        const room = result.data || result;
        setData({
          roomNumber: room.roomNumber || "",
          type: room.type || "",
          price: room.price || "",
          originalPrice: room.originalPrice || "",
          size: room.size || "",
          capacity: room.capacity || "",
          view: room.view || "",
          floor: room.floor || "",
          rating: room.rating || "",
          description: room.description || "",
          features: room.features || [],
          amenities: room.amenities || [],
          status: room.status || "available",
        });
        setExistingImages(room.images || []);
      } catch (err) {
        toast.error(err.message || "Failed to load room data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    const feature = featureInput.trim();
    if (feature && !data.features.includes(feature)) {
      setData((prev) => ({ ...prev, features: [...prev.features, feature] }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddAmenity = () => {
    const amenity = amenityInput.trim();
    if (amenity && !data.amenities.includes(amenity)) {
      setData((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }));
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId) return;

    try {
      const token = localStorage.getItem("token");
      setSaving(true);

      const formData = new FormData();
      [
        "roomNumber",
        "type",
        "price",
        "originalPrice",
        "size",
        "capacity",
        "view",
        "floor",
        "rating",
        "status",
        "description",
      ].forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      data.features.forEach((feature) => formData.append("features", feature));
      data.amenities.forEach((amenity) => formData.append("amenities", amenity));
      images.forEach((file) => formData.append("images", file));

      // Send images marked for deletion
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach((url) => formData.append("imagesToDelete", url));
      }

      const res = await fetch(`${backendUrl}/room/update-room/${roomId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Room updated successfully 🎉");
        setImages([]);
        setImagesToDelete([]);
        // Refresh existing images from response if provided
        if (result.data?.images) {
          setExistingImages(result.data.images);
        }
      } else {
        toast.error(result.message || "Failed to update room");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating the room");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all";

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500 font-medium">Loading room data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <BedDouble className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Update Room</h1>
                <p className="text-sm text-slate-500">Edit room details, features, and images</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admindashboard/dashboard/rooms/hero")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Rooms
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Hash className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="text"
                  name="roomNumber"
                  value={data.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. 101, G1, G2 (Ground Floor)"
                  className={inputClass}
                  required
                />
                <p className="text-xs text-slate-500">Accepts letters & numbers — use G1, G2 for Ground Floor</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  Room Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="type"
                  value={data.type}
                  onChange={handleChange}
                  placeholder="e.g. Deluxe, Standard, Suite"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-slate-400" />
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={data.size}
                  onChange={handleChange}
                  placeholder="e.g. 350 sq ft"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={data.capacity}
                  onChange={handleChange}
                  placeholder="Number of guests"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  View
                </label>
                <input
                  type="text"
                  name="view"
                  value={data.view}
                  onChange={handleChange}
                  placeholder="e.g. Ocean, Garden, City"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={data.floor}
                  onChange={handleChange}
                  placeholder="e.g. 1st, 2nd, Ground"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Rating */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Pricing & Rating</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">KES</span>
                  <input
                    type="number"
                    name="price"
                    value={data.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClass} pl-10`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Original Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">KES</span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={data.originalPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-slate-400" />
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={data.rating}
                  onChange={handleChange}
                  placeholder="0.0 – 5.0"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <AlignLeft className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Description</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Room Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                placeholder="Describe the room, its unique features, and what guests can expect..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Features & Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <CheckSquare className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-800">Features</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. King Bed, Balcony"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.features.map((f, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="hover:bg-amber-200 rounded-full p-0.5 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <Wifi className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-800">Amenities</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  placeholder="e.g. Free WiFi, Air Conditioning"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(idx)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Upload className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Status & Images</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Room Status</label>
                <select
                  name="status"
                  value={data.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Add New Images</label>
                <label className="flex flex-col items-center justify-center cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 hover:bg-slate-100 hover:border-amber-400 transition-all group">
                  <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-slate-800">Click to upload more images</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG — multiple allowed</span>
                  <input type="file" accept="image/*" multiple hidden onChange={handleNewImages} />
                </label>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Current Images ({existingImages.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingImages.map((imgUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={`Room image ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(imgUrl)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700 mb-3">New Images to Upload ({images.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`New preview ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-10">
            <button
              type="button"
              onClick={() => router.push("/admindashboard/dashboard/rooms/hero")}
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2 text-base disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}