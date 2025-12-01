
import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';

const LocationStrip: React.FC = () => {
  return (
    <section className="relative">
      {/* Full-bleed dark container */}
      <div className="bg-brand-black text-white py-24 md:py-32 relative overflow-hidden">
        
        {/* Ambient lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-moss/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4ADE80]/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Contact Info */}
            <div className="space-y-10">
              <div>
                <Reveal>
                  <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Location</span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="text-5xl md:text-6xl font-heading font-bold leading-tight">
                    Visit our <br/>
                    <span className="font-serif italic font-normal text-white/60">office.</span>
                  </h2>
                </Reveal>
              </div>
              
              {/* Contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <MapPin />, label: 'Address', value: CONTACT_INFO.address.full, action: 'Get Directions', href: `https://www.google.com/maps/dir/?api=1&destination=${CONTACT_INFO.geo.latitude},${CONTACT_INFO.geo.longitude}` },
                  { icon: <Phone />, label: 'Phone', value: CONTACT_INFO.phone.display, action: 'Call Now', href: `tel:${CONTACT_INFO.phone.value}` },
                  { icon: <Mail />, label: 'Email', value: CONTACT_INFO.email, action: 'Send Email', href: `mailto:${CONTACT_INFO.email}` },
                  { icon: <Clock />, label: 'Hours', value: CONTACT_INFO.hours.display, action: null, href: null }
                ].map((item, i) => (
                  <Reveal key={i} delay={0.1 * i} width="100%">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group h-full flex flex-col">
                      <div className="flex items-start gap-4 mb-auto">
                        <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/20 flex items-center justify-center text-[#4ADE80] shrink-0">
                          {React.cloneElement(item.icon as React.ReactElement<{size?: number}>, { size: 20 })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{item.label}</div>
                          <div className="text-white font-medium text-sm leading-relaxed">{item.value}</div>
                        </div>
                      </div>
                      {item.action && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <a 
                            href={item.href || '#'} 
                            target={item.href?.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#4ADE80] text-xs font-bold uppercase tracking-wider hover:gap-2 transition-all"
                          >
                            {item.action} <ArrowRight size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
              
              {/* WhatsApp CTA */}
              <Reveal delay={0.5}>
                <a 
                  href={CONTACT_INFO.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-8 py-4 bg-[#25D366] rounded-full font-bold text-white hover:bg-[#128C7E] transition-all duration-300 shadow-lg shadow-[#25D366]/30 hover:shadow-xl group"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Chat on WhatsApp
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Reveal>
            </div>
            
            {/* Right: Map with styled container */}
            <Reveal delay={0.2} className="relative w-full">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                {/* Decorative frame */}
                <div className="absolute inset-0 border-[12px] border-white/5 rounded-[2rem] pointer-events-none z-10" />
                
                {/* Map */}
                <div className="aspect-square md:aspect-[4/3]" data-hide-cursor="true">
                  <iframe 
                    src={CONTACT_INFO.geo.mapEmbedUrl}
                    className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    title="Office Location"
                  />
                </div>
                
                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 bg-white text-brand-dark px-4 py-2 rounded-full text-sm font-bold shadow-xl z-20 flex items-center gap-2">
                  <MapPin size={16} className="text-brand-moss" /> Mysuru, Karnataka
                </div>
              </div>
            </Reveal>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationStrip;
