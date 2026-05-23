// components/FloatingContact.jsx
"use client";

import { Phone, MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function FloatingContact({ phone = "+254700000000", whatsapp = "+254700000000", whatsappMessage = "Hi, I'd like to inquire about your services." }) {
  const [open, setOpen] = useState(false);
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
  const telLink = `tel:${phone}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
            <span className="bg-white text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Chat on WhatsApp
            </span>
            <div className="w-12 h-12 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
              <MessageCircle className="w-5 h-5" />
            </div>
          </a>
          <a href={telLink} className="group flex items-center gap-3">
            <span className="bg-white text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Call Now
            </span>
            <div className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
              <Phone className="w-5 h-5" />
            </div>
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 ${open ? "bg-slate-800 text-white" : "bg-amber-500 text-white"}`}
      >
        {open ? <X className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
      </button>
    </div>
  );
}