import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants';
import { useFocusTrap } from '../../hooks';
import { RD_PRIMARY_LINKS } from './content';
import { CloseIcon, MenuIcon, PhoneIcon } from './icons';

interface BarRowProps {
  navLabel: string;
  menuOpen: boolean;
  onOpenMenu: (opener: HTMLButtonElement) => void;
}

/** Wordmark, the single row of links, and the contact button. Shared by the
 *  top bar and the sticky bar so the two can never drift apart. A link to a
 *  section of a page (About, on the home page) is a plain Link: a NavLink
 *  would mark it as the current page all the way down the home page. */
const BarRow: React.FC<BarRowProps> = ({ navLabel, menuOpen, onOpenMenu }) => (
  <>
    <Link to="/" className="wordmark">
      Sagar H R &amp; Co.
    </Link>
    <nav className="navrow" aria-label={navLabel}>
      {RD_PRIMARY_LINKS.map((link) =>
        link.to.includes('#') ? (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ) : (
          <NavLink key={link.to} to={link.to} end>
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
    <div className="tb-end">
      <NavLink className="cta-ghost" to="/contact" end>
        Contact us
      </NavLink>
      <a
        className="icon-btn"
        href={`tel:${CONTACT_INFO.phone.value}`}
        aria-label={`Call ${CONTACT_INFO.phone.display}`}
      >
        <PhoneIcon />
      </a>
      <button
        className="menu-btn"
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={(event) => onOpenMenu(event.currentTarget)}
      >
        <MenuIcon />
      </button>
    </div>
  </>
);

interface RdHeaderProps {
  barOn: boolean;
  onBarChange: (on: boolean) => void;
}

/**
 * Top bar for the redesigned pages, plus the slim bar that slides in when the
 * reader scrolls back up and the full-screen phone menu.
 *
 * The slim bar and the menu are portalled to <body>: they are position: fixed,
 * and the routed view sits inside `.route-fade`, whose animation leaves a
 * transform behind that would otherwise become their containing block.
 */
const RdHeader: React.FC<RdHeaderProps> = ({ barOn, onBarChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // Read by the scroll handler, which must not show or hide the bar while
  // the menu holds the page still.
  const menuOpenRef = useRef(false);

  // Scroll lock lives in the open/close handlers rather than an effect so
  // nothing touches document.body during render (Audit CQ-06).
  const openMenu = (opener: HTMLButtonElement) => {
    openerRef.current = opener;
    menuOpenRef.current = true;
    document.body.style.overflow = 'hidden';
    setMenuOpen(true);
  };

  const closeMenu = useCallback((restoreFocus: boolean) => {
    menuOpenRef.current = false;
    document.body.style.overflow = '';
    setMenuOpen(false);
    if (restoreFocus) {
      const opener = openerRef.current;
      window.requestAnimationFrame(() => opener?.focus({ preventScroll: true }));
    }
  }, []);

  const closeAndRestore = useCallback(() => closeMenu(true), [closeMenu]);
  useFocusTrap(menuOpen, menuRef, closeAndRestore);

  // Never leave the page locked if the layout unmounts with the menu open.
  useEffect(
    () => () => {
      document.body.style.overflow = '';
    },
    [],
  );

  // Close the menu if the window widens past the phone layout, or the
  // browser's back button moves to another page underneath it.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const wide = window.matchMedia('(min-width: 901px)');
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu(false);
      }
    };
    const onPop = () => closeMenu(false);
    wide.addEventListener('change', onWide);
    window.addEventListener('popstate', onPop);
    return () => {
      wide.removeEventListener('change', onWide);
      window.removeEventListener('popstate', onPop);
    };
  }, [menuOpen, closeMenu]);

  // The slim bar appears when the reader scrolls back up past the header
  // band and hides again on the way down.
  useEffect(() => {
    let lastY = window.scrollY;
    let shown = false;
    let rafId = 0;

    const setShown = (next: boolean) => {
      if (next === shown) {
        return;
      }
      shown = next;
      onBarChange(next);
    };

    const check = () => {
      rafId = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      if (menuOpenRef.current) {
        lastY = y;
        return;
      }
      const band = document.querySelector<HTMLElement>('.rd .phead');
      const limit = band ? band.offsetHeight : 0;
      if (y < limit - 8) {
        setShown(false);
      } else if (dy < -6) {
        setShown(true);
      } else if (dy > 6) {
        setShown(false);
      }
      if (Math.abs(dy) > 6 || y < limit) {
        lastY = y;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(check);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, [onBarChange]);

  return (
    <>
      <header className="topbar pad">
        <BarRow navLabel="Main" menuOpen={menuOpen} onOpenMenu={openMenu} />
      </header>

      {createPortal(
        <div className={`rd sbar ${barOn ? 'on' : ''}`} inert={!barOn}>
          <div className="sbar-in pad">
            <BarRow navLabel="Main, compact" menuOpen={menuOpen} onOpenMenu={openMenu} />
          </div>
        </div>,
        document.body,
      )}

      {menuOpen &&
        createPortal(
          <div ref={menuRef} className="rd menu" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="menu-top">
              <span className="wordmark">Sagar H R &amp; Co.</span>
              <button className="menu-btn" type="button" aria-label="Close menu" onClick={() => closeMenu(true)}>
                <CloseIcon />
              </button>
            </div>
            <nav aria-label="Menu">
              <ul>
                {[...RD_PRIMARY_LINKS, { label: 'Contact us', to: '/contact' }].map((link) => (
                  <li key={link.to}>
                    {link.to.includes('#') ? (
                      <Link to={link.to} onClick={() => closeMenu(false)}>
                        {link.label}
                      </Link>
                    ) : (
                      <NavLink to={link.to} end onClick={() => closeMenu(false)}>
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="btns">
              <Link className="btn btn-c" to="/contact#write" onClick={() => closeMenu(false)}>
                Send us a message
              </Link>
              <a className="ph" href={`tel:${CONTACT_INFO.phone.value}`}>
                {CONTACT_INFO.phone.display}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default RdHeader;
