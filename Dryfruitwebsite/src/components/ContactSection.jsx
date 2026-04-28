import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create WhatsApp message from form
    const message = `Assalam o Alaikum!\n\nNaam: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/923211234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex items-center gap-4 p-4 border-l-4 border-success`}
      >
        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
          <Send className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="font-semibold text-text-dark">WhatsApp open ho gaya!</p>
          <p className="text-sm text-text-gray">Apna message bhej dein</p>
        </div>
      </div>
    ), { duration: 3000 });
    
    setFormData({ name: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone / WhatsApp',
      value: '0321-1234567',
      action: 'tel:+923211234567',
      highlight: true
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Shop 42, Johar Town Market, Lahore',
      action: null,
      highlight: false
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@dryfruitpro.com',
      action: 'mailto:info@dryfruitpro.com',
      highlight: false
    },
    {
      icon: Clock,
      label: 'Timing',
      value: 'Mon-Sat: 10am - 8pm',
      action: null,
      highlight: false
    },
  ];

  return (
    <section id="contact" className="bg-primary-soft py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
            Rabta Karein
          </h2>
          <p className="text-text-gray max-w-2xl mx-auto text-lg">
            Koi sawal hai ya order karna chahte hain? WhatsApp ya call karein - hum madad ke liye hazir hain!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 bg-white rounded-2xl border transition-all duration-200 ${
                  info.highlight 
                    ? 'border-whatsapp shadow-lg shadow-whatsapp/10 hover:shadow-xl' 
                    : 'border-border hover:border-primary hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  info.highlight ? 'bg-whatsapp/10' : 'bg-primary-light'
                }`}>
                  <info.icon className={`w-6 h-6 ${info.highlight ? 'text-whatsapp' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-dark mb-0.5">{info.label}</h3>
                  {info.action ? (
                    <a href={info.action} className={`text-lg ${info.highlight ? 'text-whatsapp font-semibold' : 'text-text-gray hover:text-primary'}`}>
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-text-gray">{info.value}</p>
                  )}
                </div>
                {info.highlight && (
                  <a
                    href={`https://wa.me/923211234567`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-whatsapp text-white font-semibold rounded-xl hover:bg-green-600 transition-colors duration-200 text-sm"
                  >
                    Chat
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-sm">
            <h3 className="text-xl font-bold text-text-dark mb-6">Quick Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Aapka Naam</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Naam likhein"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-primary-soft border border-transparent rounded-xl text-text-dark placeholder:text-text-gray focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="03XX-XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-primary-soft border border-transparent rounded-xl text-text-dark placeholder:text-text-gray focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Message</label>
                <textarea
                  name="message"
                  placeholder="Apna message likhein..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3.5 bg-primary-soft border border-transparent rounded-xl text-text-dark placeholder:text-text-gray focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 bg-whatsapp text-white font-bold rounded-xl hover:bg-green-600 transition-colors duration-200 text-lg shadow-lg shadow-whatsapp/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp pe Bhejein
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
