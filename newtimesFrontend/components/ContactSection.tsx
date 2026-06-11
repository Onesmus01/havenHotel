"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Crown,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare
} from "lucide-react"
import Link from "next/link"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

export default function ContactSection() {
  const [expandedSection, setExpandedSection] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`${backendUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsSubmitted(true)
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
        setTimeout(() => setIsSubmitted(false), 5000)
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+254 713 706 034",
      subtext: "Available 24/7",
      href: "tel:+254713706034",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Mail,
      label: "Email",
      value: "onesmuswambua747@gmail.com",
      subtext: "Reply within 2h",
      href: "mailto:onesmuswambua747@gmail.com",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "123 Luxury Avenue",
      subtext: "Nairobi, Kenya",
      href: "#",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Open 24/7",
      subtext: "Always here",
      href: "#",
      color: "from-violet-500 to-purple-600"
    }
  ]

  const sections = [
    {
      id: "contact-info",
      title: "Contact Information",
      icon: Phone,
      preview: "Reach us anytime — phone, email, or visit us in Nairobi.",
      content: (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {contactInfo.map((item, index) => (
            <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">{item.label}</p>
                <a href={item.href} className="text-sm font-semibold text-foreground hover:text-[#c5a55a] transition-colors block mb-1">
                  {item.value}
                </a>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: "send-message",
      title: "Send Us a Message",
      icon: MessageSquare,
      preview: "Have a question or special request? Drop us a message and we will respond quickly.",
      content: (
        <div className="pt-4">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">We will respond within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cs-name" className="text-sm font-medium">Full Name</Label>
                  <Input id="cs-name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required
                    className="h-11 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-email" className="text-sm font-medium">Email</Label>
                  <Input id="cs-email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required
                    className="h-11 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cs-phone" className="text-sm font-medium">Phone</Label>
                  <Input id="cs-phone" name="phone" type="tel" placeholder="+254 7XX XXX XXX" value={formData.phone} onChange={handleChange}
                    className="h-11 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-subject" className="text-sm font-medium">Subject</Label>
                  <Input id="cs-subject" name="subject" placeholder="Reservation Inquiry" value={formData.subject} onChange={handleChange} required
                    className="h-11 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cs-message" className="text-sm font-medium">Message</Label>
                <Textarea id="cs-message" name="message" placeholder="How can we help you?" value={formData.message} onChange={handleChange} required rows={4}
                  className="rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all resize-none" />
              </div>
              <Button type="submit" disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#c5a55a] to-[#b8944f] hover:from-[#b8944f] hover:to-[#a78343] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70">
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
                )}
              </Button>
            </form>
          )}
        </div>
      )
    },
    {
      id: "location",
      title: "Our Location",
      icon: MapPin,
      preview: "Find us at 123 Luxury Avenue in the heart of Nairobi. Easy to reach, impossible to forget.",
      content: (
        <div className="pt-4">
          <Card className="border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="aspect-video bg-gradient-to-br from-[#1f1913] to-[#3d3124] relative flex items-center justify-center rounded-lg">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-[#c5a55a] mx-auto mb-3" />
                <p className="text-white font-serif text-lg">123 Luxury Avenue</p>
                <p className="text-[#e8d5a3]/70 text-sm">Nairobi, Kenya</p>
                <Button variant="outline" size="sm" className="mt-4 border-[#c5a55a]/40 text-[#e8d5a3] hover:bg-[#c5a55a]/10 rounded-lg text-xs"
                  asChild>
                  <a href="https://maps.google.com/?q=Nairobi,Kenya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Open in Maps
                  </a>
                </Button>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[{ value: "24/7", label: "Support" }, { value: "<2h", label: "Response" }, { value: "100%", label: "Satisfaction" }].map((stat, i) => (
              <Card key={i} className="border-0 shadow-md bg-white/80 backdrop-blur-sm text-center py-4">
                <CardContent className="p-0">
                  <p className="text-xl font-bold text-[#c5a55a]">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }
  ]

  const currentIndex = sections.findIndex(s => s.id === expandedSection)
  const hasNext = currentIndex >= 0 && currentIndex < sections.length - 1
  const nextSection = hasNext ? sections[currentIndex + 1] : null

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c5a55a]" />
            <Crown className="text-[#c5a55a] w-5 h-5" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c5a55a]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We are here to help. Click any section below to expand and learn more.
          </p>
        </div>

        {/* Expandable Sections */}
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((section) => {
            const isExpanded = expandedSection === section.id
            return (
              <Card 
                key={section.id}
                className={`border-0 shadow-lg transition-all duration-500 overflow-hidden ${
                  isExpanded ? "shadow-2xl bg-white/90" : "bg-white/70 hover:bg-white/80 hover:shadow-xl cursor-pointer"
                }`}
                onClick={() => !isExpanded && toggleSection(section.id)}
              >
                <CardContent className="p-0">
                  {/* Header — always visible */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a55a] to-[#b8944f] flex items-center justify-center shadow-md transition-transform duration-300 ${isExpanded ? "rotate-0" : ""}`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{section.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{section.preview}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSection(section.id)
                      }}
                      className="rounded-full w-10 h-10 p-0 hover:bg-[#c5a55a]/10"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#c5a55a]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* Expandable Content */}
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-6 pb-6 border-t border-muted-foreground/10">
                      {section.content}

                      {/* Read Next Button */}
                      {isExpanded && nextSection && (
                        <div className="mt-6 pt-4 border-t border-muted-foreground/10 flex justify-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSection(nextSection.id)
                            }}
                            className="bg-gradient-to-r from-[#c5a55a] to-[#b8944f] hover:from-[#b8944f] hover:to-[#a78343] text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                          >
                            <span className="flex items-center gap-2">
                              Read Next: {nextSection.title}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </Button>
                        </div>
                      )}

                      {/* Last section — link to full page */}
                      {isExpanded && !nextSection && (
                        <div className="mt-6 pt-4 border-t border-muted-foreground/10 flex justify-center">
                          <Button
                            variant="outline"
                            asChild
                            className="border-2 border-[#c5a55a]/40 text-foreground hover:bg-[#c5a55a]/10 rounded-xl px-6 py-2.5"
                          >
                            <Link href="/contact" className="flex items-center gap-2">
                              View Full Contact Page
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}