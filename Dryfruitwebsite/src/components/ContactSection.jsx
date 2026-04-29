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

        <div className="flex flex-col items-center">
          {/* Contact Info Cards */}
          <div className="w-full max-w-2xl space-y-4">
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
        </div>
      </div>
    </section>
  );
}
