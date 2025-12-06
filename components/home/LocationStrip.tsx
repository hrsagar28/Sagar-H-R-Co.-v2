
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';

const { Link } = ReactRouterDOM;

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
              
              {/* Main Contact CTA */}
              <Reveal delay={0.5}>
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-4 px-8 py-4 bg-brand-moss border border-brand-moss text-white rounded-full font-bold hover:bg-white hover:text-brand-dark transition-all duration-300 shadow-lg group"
                >
                  <MessageSquare size={20} />
                  Contact Us
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>
            
            {/* Right: Map with styled container - Increased Size */}
            <Reveal delay={0.2} className="relative w-full">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                {/* Decorative frame */}
                <div className="absolute inset-0 border-[12px] border-white/5 rounded-[2rem] pointer-events-none z-10" />
                
                {/* Map - Size Increased */}
                <div className="aspect-square md:h-[600px] w-full" data-hide-cursor="true">
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
