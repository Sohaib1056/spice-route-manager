import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function ShopContact() {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <h1 className="font-display text-4xl font-bold text-[#f5e6d0]">Get in Touch</h1>
      <p className="mt-3 text-[#f5e6d0]/70">Questions about an order or bulk pricing? We're here to help.</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-[#fff8f0] p-6 text-[#3b1a00]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input required placeholder="Your name" className="rounded-lg border border-[#3b1a00]/20 bg-white px-4 py-3 text-sm focus:border-[#c8860a] focus:outline-none" />
            <input required type="email" placeholder="Email" className="rounded-lg border border-[#3b1a00]/20 bg-white px-4 py-3 text-sm focus:border-[#c8860a] focus:outline-none" />
          </div>
          <input placeholder="Subject" className="w-full rounded-lg border border-[#3b1a00]/20 bg-white px-4 py-3 text-sm focus:border-[#c8860a] focus:outline-none" />
          <textarea required rows={6} placeholder="Your message" className="w-full rounded-lg border border-[#3b1a00]/20 bg-white px-4 py-3 text-sm focus:border-[#c8860a] focus:outline-none" />
          <button type="submit" className="rounded-lg bg-[#c8860a] px-6 py-3 font-bold text-[#1a0a00] hover:brightness-110">
            Send Message
          </button>
        </form>

        <aside className="space-y-4 text-[#f5e6d0]">
          {[
            { icon: <Phone className="h-5 w-5" />, t: "Call us", v: "+92 300 1234567" },
            { icon: <Mail className="h-5 w-5" />, t: "Email", v: "hello@dryfruitpro.pk" },
            { icon: <MapPin className="h-5 w-5" />, t: "Visit", v: "Lahore, Pakistan" },
          ].map((c) => (
            <div key={c.t} className="flex items-start gap-3 rounded-2xl bg-[#2d1200] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8860a]/20 text-[#c8860a]">
                {c.icon}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#f5e6d0]/60">{c.t}</p>
                <p className="text-sm font-semibold">{c.v}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
