"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Mail, Shield } from "lucide-react";
import { format } from "date-fns";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const getLoyaltyTier = (totalBookings) => {
  if (totalBookings >= 10) return "Platinum";
  if (totalBookings >= 6) return "Gold";
  if (totalBookings >= 3) return "Silver";
  return "Bronze";
};

const getTierColor = (tier) => {
  switch (tier) {
    case "Platinum":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Gold":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Silver":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-orange-100 text-orange-800 border-orange-200";
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/user/all-users`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setUsers(data.data || []);
      } catch (err) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const fullName = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage all registered guests</p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Loyalty</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const initials = user.name
                      ? user.name.split(" ").map((n) => n[0]).join("")
                      : "U";
                    const tier = getLoyaltyTier(user.totalBookings ?? 0);
                    return (
                      <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="text-xs bg-amber-100 text-amber-700 font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.createdAt
                                  ? `Member since ${format(new Date(user.createdAt), "MMM yyyy")}`
                                  : "New member"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500">{user.phone || "-"}</p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role || "user"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={getTierColor(tier)}>
                            {tier}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-sm">{user.totalBookings ?? 0}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600">
                            {user.createdAt
                              ? format(new Date(user.createdAt), "MMM dd, yyyy")
                              : "-"}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}