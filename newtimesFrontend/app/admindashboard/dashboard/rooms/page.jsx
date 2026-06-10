"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const getRoomStatusColor = (status) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "booked":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "maintenance":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/room/get-rooms`);
        const data = await res.json();
        if (res.ok) setRooms(data.data || []);
      } catch (err) {
        toast.error("Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this room permanently?")) return;
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${backendUrl}/room/delete-room/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Room deleted");
        setRooms((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error("Failed to delete room");
      }
    } catch (err) {
      toast.error("Error deleting room");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-500">Manage all hotel rooms</p>
        </div>
        <Button
          onClick={() => router.push("/admindashboard/dashboard/rooms/addRooms")}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <Card key={room._id} className="hover:shadow-xl transition-all border-0 shadow-md overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                {room.images?.[0] ? (
                  <img
                    src={room.images[0]}
                    alt={room.type}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No Image
                  </div>
                )}
                <Badge
                  className={`absolute top-3 right-3 ${getRoomStatusColor(room.status)}`}
                  variant="outline"
                >
                  {room.status}
                </Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Room {room.roomNumber}</h3>
                  <span className="text-xs text-gray-400">Floor {room.floor}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{room.type}</p>
                <p className="text-xs text-gray-400 mb-3">{room.view} • {room.size}</p>
                <p className="font-bold text-amber-600 mb-4">
                  KES {room.price?.toLocaleString()}
                  <span className="text-xs text-gray-400 font-normal">/night</span>
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white"
                    onClick={() => router.push(`/admindashboard/dashboard/rooms/updateroom/${room._id}`)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDelete(room._id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}