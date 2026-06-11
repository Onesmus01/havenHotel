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
  MessageCircle,
  Crown,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Navigation
} from "lucide-react"
import Link from "next/link"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

export default function ContactPage() {
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

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+254 713 706 034",
      subtext: "Available 24/7 for reservations",
      href: "tel:+254713706034",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Mail,
      label: "Email",
      value: "onesmuswambua747@gmail.com",
      subtext: "We reply within 2 hours",
      href: "mailto:onesmuswambua747@gmail.com",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "123 Luxury Avenue, City Center",
      subtext: "Nairobi, Kenya",
      href: "#",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Open 24 Hours",
      subtext: "Reception always available",
      href: "#",
      color: "from-violet-500 to-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f1913] via-[#3d3124] to-[#5c4a36]" />
          <div 
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a55a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c5a55a]" />
            <Crown className="text-[#c5a55a] w-5 h-5" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c5a55a]" />
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-[#e8d5a3]/70 max-w-xl text-center font-serif italic">
            We would love to hear from you. Reach out for reservations, inquiries, or just to say hello.
          </p>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#c5a55a]/50">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c5a55a]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c5a55a]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c5a55a]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">{item.label}</p>
                  <a 
                    href={item.href}
                    className="text-lg font-semibold text-foreground hover:text-[#c5a55a] transition-colors block mb-1"
                  >
                    {item.value}
                  </a>
                  <p className="text-sm text-muted-foreground">{item.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c5a55a]" />
                  <Sparkles className="text-[#c5a55a] w-4 h-4" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c5a55a]" />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>
              </div>

              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We will respond within 2 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground font-medium">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-12 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-foreground font-medium">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-12 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-foreground font-medium">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+254 7XX XXX XXX"
                            value={formData.phone}
                            onChange={handleChange}
                            className="h-12 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-foreground font-medium">
                            Subject
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Reservation Inquiry"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="h-12 rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-foreground font-medium">
                          Your Message
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="rounded-xl border-muted-foreground/20 focus:border-[#c5a55a] focus:ring-[#c5a55a]/20 transition-all resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-[#c5a55a] to-[#b8944f] hover:from-[#b8944f] hover:to-[#a78343] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Map / Location Info */}
            <div className="space-y-6">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c5a55a]" />
                  <Navigation className="text-[#c5a55a] w-4 h-4" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c5a55a]" />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Find Us
                </h2>
                <p className="text-muted-foreground">
                  Located in the heart of the city, we are easy to find and even easier to love.
                </p>
              </div>

              <Card className="border-0 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#1f1913] to-[#3d3124] relative flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-[#c5a55a] mx-auto mb-4" />
                    <p className="text-white font-serif text-xl">123 Luxury Avenue</p>
                    <p className="text-[#e8d5a3]/70">Nairobi, Kenya</p>
                    <Button 
                      variant="outline" 
                      className="mt-6 border-[#c5a55a]/40 text-[#e8d5a3] hover:bg-[#c5a55a]/10 rounded-xl"
                      asChild
                    >
                      <a 
                        href="https://maps.google.com/?q=Nairobi,Kenya" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Open in Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "24/7", label: "Support" },
                  { value: "<2h", label: "Response" },
                  { value: "100%", label: "Satisfaction" }
                ].map((stat, i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-6">
                    <CardContent className="p-0">
                      <p className="text-2xl font-bold text-[#c5a55a]">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="w-12 h-12 text-[#c5a55a] mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
            Have Questions?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Check out our FAQ section for quick answers to common questions about reservations, amenities, and policies.
          </p>
          <Button
            variant="outline"
            className="border-2 border-[#c5a55a]/40 text-foreground hover:bg-[#c5a55a]/10 rounded-xl px-8 py-5"
            asChild
          >
            <Link href="/faq" className="flex items-center gap-2">
              View FAQ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}