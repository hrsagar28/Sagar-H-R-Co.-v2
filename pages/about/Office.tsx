import React, { useEffect, useState } from 'react';
import { Languages, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import { useConsent } from '../../hooks/useConsent';

export const Office: React.FC = () => {
  const { geo } = CONTACT_INFO;
  const languages = CONTACT_INFO.languages.join(', ');
  const globalConsent = useConsent('cookie_consent');
  const mapConsent = useConsent('maps_embed_consent');
  const [idleChecked, setIdleChecked] = useState(false);
  const canLoadMap = globalConsent.value === 'declined'
    ? false
    : globalConsent.granted || mapConsent.granted;

  useEffect(() => {
    setIdleChecked(true);
  }, []);

  const handleLoadMap = () => {
    mapConsent.grant();
  };

  return (
    <section id="office" aria-labelledby="office-heading" className="py-24 px-4 md:px-6 zone-bg">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 zone-surface rounded-bento border zone-border p-8 md:p-10">
            <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">Office & Visiting</span>
            <h2 id="office-heading" className="text-4xl md:text-5xl font-heading font-bold zone-text leading-tight mb-8">Mysuru office, planned appointments.</h2>

            <dl className="space-y-6 text-zone-text-muted/90">
              <div className="flex gap-4">
                <MapPin className="text-zone-accent shrink-0 mt-1" aria-hidden="true" focusable="false" />
                <dt className="font-bold text-zone-text">Address</dt>
                <dd>
                  {CONTACT_INFO.address.full}
                  <br />
                  {CONTACT_INFO.address.state}, {CONTACT_INFO.address.country}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-zone-text">Visiting Hours</dt>
                <dd>{CONTACT_INFO.hours.display}</dd>
              </div>
              <div className="flex gap-4">
                <Languages className="text-zone-accent shrink-0 mt-1" aria-hidden="true" focusable="false" />
                <dt className="font-bold text-zone-text">Languages</dt>
                <dd>{languages}</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7 zone-surface rounded-bento border zone-border overflow-hidden flex flex-col">
            {canLoadMap ? (
              <iframe
                src={geo.mapEmbedUrl}
                title="Office location, Sagar H R & Co., Mysuru"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="w-full min-h-[420px] aspect-[16/10] grayscale-[40%] contrast-110"
              />
            ) : (
              <div className="min-h-[420px] p-8 md:p-10 flex flex-col justify-center items-start gap-5">
                <p className="text-zone-text-muted/90 max-w-prose leading-relaxed">
                  Google Maps is blocked until you choose to load it. The embed may set third-party cookies.
                </p>
                {idleChecked && (
                  <button
                    type="button"
                    onClick={handleLoadMap}
                    className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-moss transition-colors hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zone-surface motion-reduce:transition-none"
                  >
                    Load map
                  </button>
                )}
              </div>
            )}
            <div className="p-5 border-t zone-border flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={geo.mapShareUrl ?? geo.mapEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zone-accent font-bold hover:text-zone-text transition-colors"
              >
                Open in Google Maps
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              {canLoadMap && (
                <button
                  type="button"
                  onClick={mapConsent.revoke}
                  className="text-zone-text-muted underline underline-offset-4 hover:text-zone-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zone-surface"
                >
                  Hide map
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
