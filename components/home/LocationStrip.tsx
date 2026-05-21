import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import type { IconComponent } from '../../types';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';

/**
 * One row in the dark contact grid. Audit L-03: every card with an `href`
 * is rendered as a single `<a>` so the entire card surface — not just the
 * tiny "Call Now" sub-link — is the tap target. Cards without an href
 * (Hours) stay as plain `<div>`s.
 */
interface ContactCard {
  Icon: IconComponent;
  label: string;
  /** Visible value (street address, phone display, email). */
  value: string;
  /** Verb shown on the bottom row inside the card. `null` = no action row. */
  action: string | null;
  /** Destination. `null` for the Hours card. Used to decide between
   *  rendering an `<a>` (link card) or a `<div>` (info card). */
  href: string | null;
  /** itemProp annotation forwarded to the value element (audit L-04). */
  itemProp?: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    Icon: MapPin,
    label: 'Address',
    value: CONTACT_INFO.address.full,
    action: 'Get Directions',
    href: `https://www.google.com/maps/dir/?api=1&destination=${CONTACT_INFO.geo.latitude},${CONTACT_INFO.geo.longitude}`,
    itemProp: 'address',
  },
  {
    Icon: Phone,
    label: 'Phone',
    value: CONTACT_INFO.phone.display,
    action: 'Call Now',
    href: `tel:${CONTACT_INFO.phone.value}`,
    itemProp: 'telephone',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: CONTACT_INFO.email,
    action: 'Send Email',
    href: `mailto:${CONTACT_INFO.email}`,
    itemProp: 'email',
  },
  {
    Icon: Clock,
    label: 'Hours',
    value: CONTACT_INFO.hours.display,
    action: null,
    href: null,
  },
];

const LocationStrip: React.FC = () => {
  'use memo';
  return (
    <section className="relative">
      {/* Full-bleed dark container */}
      <div className="relative overflow-hidden bg-brand-black py-24 text-white md:py-32">
        {/* Ambient lighting */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-moss/20 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-accent/10 blur-[150px]" />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/*
              Left column. Audit L-04: marked up as a schema.org Organization
              microdata block. The home page's JSON-LD already covers this,
              but legacy crawlers (and some scrapers) still read microdata
              and the duplication is harmless — Google treats JSON-LD as the
              authoritative source.
            */}
            <div className="space-y-10" itemScope itemType="https://schema.org/Organization">
              <meta itemProp="name" content={CONTACT_INFO.name} />
              <div>
                <Reveal>
                  <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-accent">
                    Location
                  </span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="font-heading text-5xl font-bold leading-tight md:text-6xl">
                    Visit our <br />
                    <span className="font-serif font-normal italic text-white/85">office.</span>
                  </h2>
                </Reveal>
              </div>

              {/* Contact cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CONTACT_CARDS.map((item, i) => {
                  const isExternalHref = item.href?.startsWith('http') ?? false;
                  // Card content is identical between the link and the
                  // static <div> branches; extracted so we render the same
                  // markup either way and only the outer wrapper changes.
                  const Body = (
                    <>
                      <div className="mb-auto flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/20 text-brand-accent">
                          {/* Audit S-05 (carried into this file): icon is a
                              component reference now, not cloneElement. */}
                          <item.Icon size={20} aria-hidden="true" focusable={false} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-xs uppercase tracking-wider text-white/75">{item.label}</div>
                          <div
                            className="text-sm font-medium leading-relaxed text-white"
                            {...(item.itemProp ? { itemProp: item.itemProp } : {})}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                      {item.action && (
                        <div
                          className="mt-4 flex items-center gap-1 border-t border-white/5 pt-4 text-xs font-bold uppercase tracking-wider text-brand-accent transition-[transform,color]"
                          aria-hidden="true"
                        >
                          {item.action} <ArrowRight size={12} />
                        </div>
                      )}
                    </>
                  );

                  // Card frame styling reused by both branches. The
                  // `min-h-[120px]` floor ensures the tap target meets the
                  // WCAG 2.2 24×24 minimum on the smallest viewports
                  // (audit L-03) — actual cards always render taller.
                  const frame =
                    'group flex h-full min-h-[120px] flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent';

                  return (
                    <Reveal key={item.label} delay={0.1 * i} width="100%">
                      {item.href ? (
                        <a
                          href={item.href}
                          aria-label={item.action ? `${item.action} — ${item.value}` : item.value}
                          {...(isExternalHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className={frame}
                        >
                          {Body}
                        </a>
                      ) : (
                        <div className={frame}>{Body}</div>
                      )}
                    </Reveal>
                  );
                })}
              </div>

              {/* Main Contact CTA */}
              <Reveal delay={0.5}>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-4 rounded-full border border-brand-moss bg-brand-moss px-8 py-4 font-bold text-white shadow-lg transition-colors duration-300 hover:bg-white hover:text-brand-dark"
                >
                  <MessageSquare size={20} />
                  Contact Us
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            </div>

            {/* Right: Map with styled container - Increased Size.
                On mobile the map is full-bleed (negative margin cancels the
                container's px-4) and stays colourful — there's no hover on
                touch devices so a grayscale→colour trick makes no sense.
                Desktop keeps the editorial grayscale-until-hover treatment
                — audit L-05 was raised against this and explicitly kept on
                review: the editorial gesture is worth the readability cost
                on a section whose real conversion path is the contact
                cards next to it. */}
            <Reveal delay={0.2} width="100%" className="relative -mx-4 md:-mx-6 lg:mx-0">
              <div className="relative overflow-hidden shadow-2xl lg:rounded-[2rem] lg:border lg:border-white/10">
                {/* Decorative frame — only on desktop where rounded corners exist */}
                <div className="pointer-events-none absolute inset-0 z-10 hidden rounded-[2rem] border-[12px] border-white/5 lg:block" />

                {/*
                  Map - Size Increased.
                  `data-hide-cursor="true"` is consumed by `components/CustomCursor.tsx`
                  (closest-ancestor lookup) so the custom cursor disables itself
                  over the iframe — mousing over a third-party embed with a
                  fake cursor layer above looks broken. Audit L-02.
                */}
                <div className="aspect-square w-full md:h-[600px]" data-hide-cursor="true">
                  <iframe
                    src={CONTACT_INFO.geo.mapEmbedUrl}
                    // Audit L-01: explicit width/height pair sets the iframe's
                    // intrinsic aspect ratio so the surrounding layout doesn't
                    // shift while the embed loads. `referrerpolicy` keeps the
                    // full URL off cross-origin maps requests.
                    width={800}
                    height={600}
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full transition-[filter] duration-700 lg:grayscale lg:hover:grayscale-0"
                    loading="lazy"
                    title="Office Location"
                  />
                </div>

                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-dark shadow-xl md:bottom-6 md:left-6">
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
