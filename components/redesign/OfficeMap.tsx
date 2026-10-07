import React from 'react';
import { CONTACT_INFO } from '../../constants';

/**
 * The Google map of the office, on the Contact page and the home page. Muted
 * to sit with the palette until hovered or focused (.map in redesign.css).
 * data-hide-cursor makes the custom cursor (CustomCursor.tsx, index.css) step
 * aside for the browser's over the embedded map. It loads only when the
 * reader scrolls near it; the privacy policy says where the map appears.
 */
const OfficeMap: React.FC = () => (
  <div className="map" data-hide-cursor="true">
    <iframe
      title={`Map showing the office of ${CONTACT_INFO.name}`}
      src={CONTACT_INFO.geo.mapEmbedUrl}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allow="geolocation 'none'"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      allowFullScreen
    />
  </div>
);

export default OfficeMap;
