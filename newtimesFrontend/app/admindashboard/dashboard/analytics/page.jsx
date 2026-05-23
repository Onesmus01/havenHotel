"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  DollarSign,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Simple bar chart component
function MiniBarChart({ data, color = "bg-amber-500" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full ${color} rounded-t-sm transition-all hover:opacity-80`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Simple line chart using SVG
function Sparkline({ data, color = "#f59e0b" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        fill={`${color}20`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    roomTypePerformance: [],
    averageRating: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [analyticsRes, bookingsRes, roomsRes, usersRes, paymentsRes] = await Promise.all([
          fetch(`${backendUrl}/user/analytics`, { credentials: "include" }),
          fetch(`${backendUrl}/bookings/all-bookings`, { credentials: "include" }),
          fetch(`${backendUrl}/room/get-rooms`),
          fetch(`${backendUrl}/user/all-users`, { credentials: "include" }),
          fetch(`${backendUrl}/payments/all-payments`, { credentials: "include" }),
        ]);

        const [analyticsData, bookingsData, roomsData, usersData, paymentsData] = await Promise.all([
          analyticsRes.json(),
          bookingsRes.json(),
          roomsRes.json(),
          usersRes.json(),
          paymentsRes.json(),
        ]);

        setAnalytics(analyticsData.data || {});
        setBookings(bookingsData.data || []);
        setRooms(roomsData.data || []);
        setUsers(usersData.data || []);
        setPayments(paymentsData.data || []);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Calculate derived metrics
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
  const cancellationRate = bookings.length > 0 ? ((cancelledBookings.length / bookings.length) * 100).toFixed(1) : 0;

  const avgBookingValue = confirmedBookings.length > 0
    ? Math.round(confirmedBookings.reduce((s, b) => s + (b.totalAmount || 0), 0) / confirmedBookings.length)
    : 0;

  const totalGuests = users.length;
  const newGuestsThisMonth = users.filter((u) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const revenueByMethod = payments.reduce((acc, p) => {
    if (p.status === "success") {
      acc[p.method] = (acc[p.method] || 0) + (p.amount || 0);
    }
    return acc;
  }, {});

  const methodChartData = Object.entries(revenueByMethod).map(([method, amount]) => ({
    label: method,
    value: amount,
  }));

  // Daily booking trend (last 7 days)
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const dailyBookings = last7Days.map((day) => ({
    label: format(day, "EEE"),
    value: bookings.filter((b) => {
      const created = new Date(b.createdAt);
      return created.toDateString() === day.toDateString();
    }).length,
  }));

  const dailyRevenue = last7Days.map((day) => ({
    label: format(day, "EEE"),
    value: payments
      .filter((p) => p.status === "success" && new Date(p.createdAt).toDateString() === day.toDateString())
      .reduce((s, p) => s + (p.amount || 0), 0),
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: `KES ${(analytics.totalRevenue || 0).toLocaleString()}`,
      change: "+12.5%",
      up: true,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      sparkline: dailyRevenue.map((d) => d.value),
      sparkColor: "#10b981",
    },
    {
      label: "Total Bookings",
      value: (analytics.totalBookings || bookings.length).toString(),
      change: "+8.2%",
      up: true,
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      sparkline: dailyBookings.map((d) => d.value),
      sparkColor: "#f59e0b",
    },
    {
      label: "Occupancy Rate",
      value: `${analytics.occupancyRate || 0}%`,
      change: "-2.1%",
      up: false,
      icon: Bed,
      color: "from-blue-500 to-indigo-600",
      sparkline: [65, 72, 68, 80, 75, 82, 87],
      sparkColor: "#3b82f6",
    },
    {
      label: "Avg. Rating",
      value: (Number(analytics.averageRating) || 0).toFixed(1),
      change: "+0.3",
      up: true,
      icon: Star,
      color: "from-purple-500 to-pink-600",
      sparkline: [4.2, 4.3, 4.3, 4.4, 4.5, 4.6, 4.7],
      sparkColor: "#a855f7",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Performance insights and reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7d")}
            className={timeRange === "7d" ? "bg-amber-500 hover:bg-amber-600" : "bg-white"}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30d")}
            className={timeRange === "30d" ? "bg-amber-500 hover:bg-amber-600" : "bg-white"}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("90d")}
            className={timeRange === "90d" ? "bg-amber-500 hover:bg-amber-600" : "bg-white"}
          >
            90 Days
          </Button>
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${stat.sparkColor}20` }}>
                        <Icon className="w-5 h-5" style={{ color: stat.sparkColor }} />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? "text-emerald-600" : "text-rose-600"}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mb-3">{stat.label}</p>
                    <Sparkline data={stat.sparkline} color={stat.sparkColor} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Method */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-500" />
                Revenue by Payment Method
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {methodChartData.length > 0 ? (
              <div className="space-y-4">
                {methodChartData.map((item) => {
                  const total = methodChartData.reduce((s, d) => s + d.value, 0);
                  const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                  const colors = {
                    mpesa: "bg-green-500",
                    card: "bg-blue-500",
                    bank: "bg-amber-500",
                    cash: "bg-purple-500",
                  };
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">KES {item.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-full rounded-full ${colors[item.label] || "bg-gray-400"} transition-all`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No payment data</div>
            )}
          </CardContent>
        </Card>

        {/* Daily Booking Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                Daily Booking Trend
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={dailyBookings} color="bg-amber-500" />
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Last 7 days</span>
              <span className="font-semibold text-gray-900">
                {dailyBookings.reduce((s, d) => s + d.value, 0)} total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Room Type Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bed className="w-4 h-4 text-amber-500" />
              Room Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.roomTypePerformance?.length > 0 ? (
                analytics.roomTypePerformance.map((room) => {
                  const maxCount = Math.max(...analytics.roomTypePerformance.map((r) => r.count), 1);
                  return (
                    <div key={room._id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-24 truncate">{room._id}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${(room.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-6 text-right">{room.count}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest Metrics */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Guest Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Total Guests</p>
                <p className="text-xl font-bold text-gray-900">{totalGuests}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">New This Month</p>
                <p className="text-xl font-bold text-gray-900">{newGuestsThisMonth}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Avg. Booking Value</p>
                <p className="text-xl font-bold text-gray-900">KES {avgBookingValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Cancellation Rate</p>
                <p className="text-xl font-bold text-gray-900">{cancellationRate}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-rose-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Available Rooms</p>
                <p className="text-xl font-bold text-gray-900">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
              </div>
              <Bed className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Total Rooms</p>
                <p className="text-xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}