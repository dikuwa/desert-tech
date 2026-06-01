import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Mail, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Get in touch with Desert Technology Consultant.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Details */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Call Us</p>
                <a href="tel:+264811234567" className="text-sm text-muted-foreground hover:text-foreground">
                  +264 81 123 4567
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 text-whatsapp" />
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <a
                  href="https://wa.me/264811234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  +264 81 123 4567
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <a href="mailto:info@deserttechnology.com.na" className="text-sm text-muted-foreground hover:text-foreground">
                  info@deserttechnology.com.na
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Banking Details</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Desert TECHNOLOGIES</p>
              <p>Standard Bank</p>
              <p className="font-mono">Account: 60003162833</p>
              <p className="font-mono">Branch Code: 082672</p>
            </div>
          </div>
        </Card>

        {/* Enquiry Form */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Send an Enquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the form and we&apos;ll get back to you.
          </p>

          <form className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone / WhatsApp</label>
              <input
                type="text"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+264 81 234 5678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subject</label>
              <input
                type="text"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Your message..."
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
