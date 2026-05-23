"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  Hotel,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Loader2,
  CheckCircle,
  Smartphone,
  Key,
  Users,
  FileText,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const [settings, setSettings] = useState({
    // General
    hotelName: "Newtimes Hotel",
    tagline: "Luxury Haven • Nairobi",
    email: "reservations@newtimeshotel.co",
    phone: "+254 759 755 575",
    address: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
    currency: "KES",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    paymentAlerts: true,
    marketingEmails: false,

    // Payments
    mpesaEnabled: true,
    cardEnabled: true,
    bankEnabled: false,
    cashEnabled: true,
    mpesaShortcode: "174379",
    mpesaPasskey: "",

    // Appearance
    primaryColor: "amber",
    darkMode: false,
    compactView: false,

    // Security
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  const sections = [
    { id: "general", label: "General", icon: Hotel },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your hotel configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Card className="lg:w-64 border-0 shadow-md h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-amber-50 text-amber-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-gray-400"}`} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* General Settings */}
          {activeSection === "general" && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-amber-500" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Hotel Name</label>
                      <Input
                        value={settings.hotelName}
                        onChange={(e) => handleChange("hotelName", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
                      <Input
                        value={settings.tagline}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <Input
                        value={settings.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                      <Input
                        value={settings.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm"
                      >
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm"
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                    { key: "smsNotifications", label: "SMS Notifications", desc: "Receive updates via SMS" },
                    { key: "bookingAlerts", label: "Booking Alerts", desc: "Alert on new bookings" },
                    { key: "paymentAlerts", label: "Payment Alerts", desc: "Alert on payment status changes" },
                    { key: "marketingEmails", label: "Marketing Emails", desc: "Receive promotional content" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings[item.key]}
                        onCheckedChange={(v) => handleChange(item.key, v)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payments */}
          {activeSection === "payments" && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Payment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "mpesaEnabled", label: "M-Pesa", icon: Smartphone, color: "text-green-600" },
                      { key: "cardEnabled", label: "Card Payments", icon: CreditCard, color: "text-blue-600" },
                      { key: "bankEnabled", label: "Bank Transfer", icon: Globe, color: "text-amber-600" },
                      { key: "cashEnabled", label: "Cash on Arrival", icon: Key, color: "text-purple-600" },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <Icon className={`w-5 h-5 ${method.color}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{method.label}</p>
                          </div>
                          <Switch
                            checked={settings[method.key]}
                            onCheckedChange={(v) => handleChange(method.key, v)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {settings.mpesaEnabled && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-sm text-green-800">M-Pesa Configuration</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-green-700 mb-1">Shortcode</label>
                          <Input
                            value={settings.mpesaShortcode}
                            onChange={(e) => handleChange("mpesaShortcode", e.target.value)}
                            className="bg-white border-green-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-green-700 mb-1">Passkey</label>
                          <Input
                            type="password"
                            value={settings.mpesaPasskey}
                            onChange={(e) => handleChange("mpesaPasskey", e.target.value)}
                            placeholder="••••••••"
                            className="bg-white border-green-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-500" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex gap-3">
                      {[
                        { name: "amber", class: "bg-amber-500" },
                        { name: "blue", class: "bg-blue-500" },
                        { name: "emerald", class: "bg-emerald-500" },
                        { name: "rose", class: "bg-rose-500" },
                        { name: "purple", class: "bg-purple-500" },
                      ].map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleChange("primaryColor", color.name)}
                          className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                            settings.primaryColor === color.name
                              ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                              : "hover:scale-105"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Dark Mode</p>
                      <p className="text-xs text-gray-500">Use dark theme across admin</p>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(v) => handleChange("darkMode", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Compact View</p>
                      <p className="text-xs text-gray-500">Reduce spacing in tables</p>
                    </div>
                    <Switch
                      checked={settings.compactView}
                      onCheckedChange={(v) => handleChange("compactView", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Require 2FA for admin login</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(v) => handleChange("twoFactorAuth", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Login Notifications</p>
                        <p className="text-xs text-gray-500">Email alert on new device login</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(v) => handleChange("loginNotifications", v)}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                      min={5}
                      max={120}
                      className="bg-white border-gray-200 w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <p className="font-semibold text-sm text-rose-800">Danger Zone</p>
                    </div>
                    <p className="text-xs text-rose-600 mb-3">
                      These actions are irreversible. Proceed with caution.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-white text-rose-600 border-rose-200 hover:bg-rose-50">
                        Clear All Data
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white text-rose-600 border-rose-200 hover:bg-rose-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}