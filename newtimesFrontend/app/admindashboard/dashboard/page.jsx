"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  Bed,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ArrowUpRight,
  Filter,
  Download,
  Star,
  Activity,
  ChevronRight,
  Utensils,
  ArrowRight
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const statusConfig = {
  confirmed: { 
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400", 
    icon: CheckCircle,
    label: "Confirmed"
  },
  "checked-in": { 
    color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-800 dark:text-blue-400", 
    icon: Bed,
    label: "Checked In"
  },
  "checked-out": { 
    color: "bg-slate-500/10 text-slate-700 border-slate-200 dark:border-slate-800 dark:text-slate-400", 
    icon: XCircle,
    label: "Checked Out"
  },
  cancelled: { 
    color: "bg-red-500/10 text-red-700 border-red-200 dark:border-red-800 dark:text-red-400", 
    icon: XCircle,
    label: "Cancelled"
  },
  pending: { 
    color: "bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800 dark:text-amber-400", 
    icon: Clock,
    label: "Pending"
  },
};

function useAnimatedCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  return count;
}

function Sparkline({ data, color = "#f59e0b" }) {
  const width = 120;
  const height = 40;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${points.split(" ")[0]} L ${points.replace(/,/g, " ")}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polygon points={`${points.split(" ")[0].split(",")[0]},${height} ${points.replace(/ /g, " ")} ${points.split(" ").pop().split(",")[0]},${height}`} fill={`url(#grad-${color.replace("#", "")})`} />
    </svg>
  );
}

function MiniBarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((val, i) => (
        <div key={i} className="flex-1 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm transition-all duration-500 hover:from-amber-400 hover:to-amber-200" style={{ height: `${(val / max) * 100}%`, opacity: 0.6 + (i / data.length) * 0.4 }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0, totalRevenue: 0, occupancyRate: 0, averageRating: 0,
    todayCheckIns: 0, todayCheckOuts: 0, availableRooms: 0, totalGuests: 0,
    revenueChange: 12.5, bookingChange: 8.2,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");

  const animatedBookings = useAnimatedCounter(stats.totalBookings);
  const animatedRevenue = useAnimatedCounter(stats.totalRevenue);
  const animatedOccupancy = useAnimatedCounter(stats.occupancyRate);
  const animatedRating = useAnimatedCounter(Math.round(stats.averageRating * 10));

  const revenueSparkline = [42000, 45000, 38000, 52000, 48000, 61000, 58000, 65000];
  const bookingSparkline = [12, 15, 8, 22, 18, 25, 20, 28];
  const occupancyData = [65, 72, 68, 85, 90, 88, 92];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, roomsRes, analyticsRes] = await Promise.all([
          fetch(`${backendUrl}/bookings/all-bookings`, { credentials: "include" }),
          fetch(`${backendUrl}/room/get-rooms`),
          fetch(`${backendUrl}/user/analytics`, { credentials: "include" })
        ]);

        const bookingsData = await bookingsRes.json();
        const roomsData = await roomsRes.json();
        const analyticsData = await analyticsRes.json();

        const bookings = bookingsData.data || [];
        const rooms = roomsData.data || [];
        const analytics = analyticsData.data || {};

        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        const checkInsToday = bookings.filter((b) => b.checkIn && format(new Date(b.checkIn), "yyyy-MM-dd") === todayStr).length;
        const checkOutsToday = bookings.filter((b) => b.checkOut && format(new Date(b.checkOut), "yyyy-MM-dd") === todayStr).length;
        const availableRooms = rooms.filter((r) => r.status === "available").length;
        const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
        const totalRooms = rooms.length;
        const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        const totalGuests = bookings.filter(b => b.status === "checked-in").reduce((acc, b) => acc + (b.guests || 1), 0);

        setStats({
          totalBookings: analytics.totalBookings || bookings.length,
          totalRevenue: analytics.totalRevenue || 0,
          occupancyRate,
          averageRating: analytics.averageRating || 4.8,
          todayCheckIns: checkInsToday,
          todayCheckOuts: checkOutsToday,
          availableRooms,
          totalGuests,
          revenueChange: analytics.revenueChange || 12.5,
          bookingChange: analytics.bookingChange || 8.2,
        });

        const sortedBookings = bookings
          .sort((a, b) => new Date(b.createdAt || b.checkIn) - new Date(a.createdAt || a.checkIn))
          .slice(0, 10)
          .map(b => ({
            ...b,
            nights: Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24)) || 1,
            amount: b.totalAmount || b.price || 0
          }));

        setRecentBookings(sortedBookings);
        setFilteredBookings(sortedBookings);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = recentBookings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        (b.firstName?.toLowerCase().includes(q) || "") ||
        (b.lastName?.toLowerCase().includes(q) || "") ||
        (b.roomNumber?.toString().includes(q) || "") ||
        (b.roomType?.toLowerCase().includes(q) || "")
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(b => b.status === statusFilter);
    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, recentBookings]);

  const statCards = [
    { title: "Total Revenue", value: `KES ${animatedRevenue.toLocaleString()}`, icon: DollarSign, trend: stats.revenueChange, trendUp: stats.revenueChange > 0, color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600", sparkline: revenueSparkline, sparkColor: "#10b981" },
    { title: "Total Bookings", value: animatedBookings, icon: Calendar, trend: stats.bookingChange, trendUp: stats.bookingChange > 0, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600", sparkline: bookingSparkline, sparkColor: "#f59e0b" },
    { title: "Occupancy Rate", value: `${animatedOccupancy}%`, icon: Bed, trend: 5.3, trendUp: true, color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600", sparkline: [60, 65, 62, 70, 68, 75, 72, 78], sparkColor: "#3b82f6" },
    { title: "Guest Rating", value: (animatedRating / 10).toFixed(1), icon: Star, trend: 2.1, trendUp: true, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-50 dark:bg-violet-950/30", iconColor: "text-violet-600", sparkline: [4.2, 4.3, 4.1, 4.5, 4.4, 4.6, 4.5, 4.8], sparkColor: "#8b5cf6" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening at your property today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white dark:bg-gray-900">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {stat.trendUp ? (
                    <span className="text-emerald-600 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" />+{stat.trend}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
                      <TrendingDown className="w-3 h-3 mr-1" />{stat.trend}%
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <Sparkline data={stat.sparkline} color={stat.sparkColor} />
                <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Check-ins", value: stats.todayCheckIns, sub: "Guests arriving today", icon: CheckCircle, color: "emerald", bg: "from-emerald-50 to-white dark:from-emerald-950/20" },
              { label: "Check-outs", value: stats.todayCheckOuts, sub: "Guests departing today", icon: XCircle, color: "blue", bg: "from-blue-50 to-white dark:from-blue-950/20" },
              { label: "Available", value: stats.availableRooms, sub: "Rooms ready for guests", icon: Bed, color: "amber", bg: "from-amber-50 to-white dark:from-amber-950/20" }
            ].map((item) => (
              <Card key={item.label} className={`border-0 shadow-md bg-gradient-to-br ${item.bg} dark:to-gray-900 overflow-hidden relative group hover:shadow-lg transition-all`}>
                <div className={`absolute right-0 top-0 w-24 h-24 bg-${item.color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900/50 rounded-xl`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{item.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Occupancy Chart */}
          <Card className="border-0 shadow-lg dark:bg-gray-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Occupancy Overview</CardTitle>
                  <CardDescription>Weekly room occupancy rate</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Activity className="w-3 h-3 mr-1" /> Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <MiniBarChart data={occupancyData} />
              <div className="flex justify-between mt-3 px-1">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d} className="text-xs text-gray-400 font-medium">{d}</span>)}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Occupancy</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.occupancyRate}%</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Guests</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalGuests}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                  View Details <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="border-0 shadow-lg dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
                  <CardDescription>Latest reservations and their status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search guests..." className="pl-9 w-[200px] h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredBookings.length > 0 ? filteredBookings.map((booking, idx) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div key={booking._id || idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900/50">
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-amber-200 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-semibold text-sm">
                            {(booking.firstName?.[0] || "G") + (booking.lastName?.[0] || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{booking.firstName} {booking.lastName}</p>
                            {booking.status === "checked-in" && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{booking.roomType} • Room {booking.roomNumber}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd")}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{booking.nights} nights</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">KES {booking.amount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.paymentStatus || "Pending"}</p>
                        </div>
                        <Badge className={`${status.color} font-medium capitalize gap-1 px-3 py-1`} variant="outline">
                          <StatusIcon className="w-3 h-3" />{status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No bookings found</p>
                  </div>
                )}
              </div>
              {filteredBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                  <Button variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-2">
                    View All Bookings <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - 1/3 */}
        <div className="space-y-6">
          {/* Performance Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Performance</p>
                  <p className="text-lg font-bold">This Month</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Users, label: "Total Guests", value: stats.totalGuests, color: "text-blue-400" },
                  { icon: Utensils, label: "Restaurant Orders", value: "24", color: "text-amber-400" },
                  { icon: Star, label: "Avg. Rating", value: `${stats.averageRating}/5`, color: "text-purple-400" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Timeline */}
          <Card className="border-0 shadow-lg dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Upcoming</CardTitle>
              <CardDescription>Next 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative space-y-6 pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-amber-300 before:via-amber-500 before:to-transparent">
                {recentBookings.slice(0, 4).map((booking, idx) => {
                  const isTodayCheckIn = isToday(new Date(booking.checkIn));
                  const isTomorrowCheckIn = isTomorrow(new Date(booking.checkIn));
                  return (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-amber-500 group-hover:scale-125 transition-transform" />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.firstName} {booking.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {isTodayCheckIn ? "Today" : isTomorrowCheckIn ? "Tomorrow" : format(new Date(booking.checkIn), "MMM dd")} • Room {booking.roomNumber}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{isTodayCheckIn ? "Today" : "Upcoming"}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Room Status */}
          <Card className="border-0 shadow-lg dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Room Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { label: "Occupied", value: stats.occupancyRate, color: "from-emerald-500 to-teal-400" },
                  { label: "Available", value: 100 - stats.occupancyRate, color: "from-amber-400 to-orange-400" },
                  { label: "Maintenance", value: 5, color: "from-red-400 to-red-500" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-emerald-600">{stats.occupancyRate}%</p><p className="text-xs text-gray-500">Occupied</p></div>
                <div><p className="text-lg font-bold text-amber-600">{stats.availableRooms}</p><p className="text-xs text-gray-500">Vacant</p></div>
                <div><p className="text-lg font-bold text-red-600">3</p><p className="text-xs text-gray-500">Cleaning</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}