"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "failed":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "cancelled":
      return "bg-gray-50 text-gray-600 border-gray-200";
    case "refunded":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const getMethodIcon = (method) => {
  switch (method) {
    case "mpesa":
      return <Smartphone className="w-4 h-4" />;
    case "card":
      return <CreditCard className="w-4 h-4" />;
    case "bank":
      return <Banknote className="w-4 h-4" />;
    case "cash":
      return <Wallet className="w-4 h-4" />;
    default:
      return <CreditCard className="w-4 h-4" />;
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
      const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/payments/all-payments`, {
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPayments(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch payments");
      
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${backendUrl}/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Payment marked as ${newStatus}`);
        setPayments((prev) =>
          prev.map((p) => (p._id === paymentId ? { ...p, status: newStatus } : p))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating payment");
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.mpesaReceiptNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesMethod = methodFilter === "all" || p.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const successfulPayments = payments.filter((p) => p.status === "success");
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const todayRevenue = successfulPayments
    .filter((p) => {
      const today = new Date().toDateString();
      return new Date(p.createdAt).toDateString() === today;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    {
      label: "Total Revenue",
      value: `KES ${totalRevenue.toLocaleString()}`,
      sub: `${successfulPayments.length} successful`,
      icon: Wallet,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Today's Revenue",
      value: `KES ${todayRevenue.toLocaleString()}`,
      sub: format(new Date(), "MMM dd, yyyy"),
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Pending",
      value: payments.filter((p) => p.status === "pending").length.toString(),
      sub: "awaiting confirmation",
      icon: AlertCircle,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Failed",
      value: payments.filter((p) => p.status === "failed").length.toString(),
      sub: "need attention",
      icon: XCircle,
      color: "from-rose-500 to-pink-600",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Track and manage all transactions</p>
        </div>
        <Button variant="outline" className="bg-white shadow-sm hover:shadow-md transition">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
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
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`w-5 h-5 ${stat.textColor}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, transaction ID, or receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                      <p className="text-sm text-gray-400 mt-2">Loading payments...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">No payments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded inline-block">
                            {p.transactionId?.slice(-8).toUpperCase() || "N/A"}
                          </p>
                          {p.mpesaReceiptNumber && (
                            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {p.mpesaReceiptNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {p.customerName || p.user?.name || "Guest"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.customerEmail || p.user?.email || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                            {getMethodIcon(p.method)}
                          </span>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {p.method}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          KES {p.amount?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase">{p.currency || "KES"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={`${getPaymentStatusColor(p.status)} text-xs font-semibold px-2.5 py-1`}
                          variant="outline"
                        >
                          {p.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {p.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
                          {p.status === "pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">
                          {p.createdAt ? format(new Date(p.createdAt), "MMM dd, yyyy") : "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.createdAt ? format(new Date(p.createdAt), "HH:mm") : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {p.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                onClick={() => handleStatusUpdate(p._id, "success")}
                                title="Mark as Success"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                onClick={() => handleStatusUpdate(p._id, "failed")}
                                title="Mark as Failed"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {p.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                              onClick={() => handleStatusUpdate(p._id, "pending")}
                              title="Retry"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-2">
          <p>
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{payments.length}</span> payments
          </p>
          <p>
            Page total:{" "}
            <span className="font-semibold text-gray-900">
              KES {filtered.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}