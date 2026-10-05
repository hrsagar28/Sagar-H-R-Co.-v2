import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageLoader from '../components/PageLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import RouteErrorBoundary from '../components/RouteErrorBoundary';
import { useToast } from '../hooks';
import './route-styles.css';
import './SharedPreview.css';

// PREVIEW ONLY. A page on the deploy preview for trying out the shared pieces
// (pop-up messages, offline bar, loading and error screens) that are otherwise
// hard to see. It is only routed when VITE_SHOWCASE is set (Netlify deploy
// previews) and is removed before the shared-pieces work is merged.

const Thrower: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

type Overlay = 'loader' | 'loader-ink' | 'crash' | 'update' | null;

const SharedPreview: React.FC = () => {
  const { addToast } = useToast();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [routeError, setRouteError] = useState(0);

  return (
    <div className="rd-page">
      <SEO title="Shared pieces (preview)" description="Preview only." noindex />
      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid open solo pad">
          <div>
            <h1 className="rise">Shared pieces</h1>
            <p className="hsub rise d1">
              Preview only. This page is on the test site, not on casagar.co.in. Use the buttons to see each piece.
            </p>
          </div>
        </div>
      </div>

      <div className="svclist pad sp">
        <section className="sec" aria-labelledby="sp-toast">
          <div className="sec-h">
            <h2 id="sp-toast">Pop-up messages</h2>
            <p className="desc">After copying a number, or when a form has a problem.</p>
          </div>
          <div className="sp-row">
            <button
              type="button"
              className="btn"
              data-sp="toast-ok"
              onClick={() => addToast('Phone number copied', 'success')}
            >
              Success
            </button>
            <button
              type="button"
              className="btn"
              data-sp="toast-error"
              onClick={() => addToast('Please check the highlighted fields.', 'error')}
            >
              Problem
            </button>
            <button
              type="button"
              className="btn"
              data-sp="toast-long"
              onClick={() =>
                addToast('We could not send your message. Please email us directly at mail@casagar.co.in', 'error')
              }
            >
              Long message
            </button>
            <button
              type="button"
              className="btn"
              data-sp="toast-info"
              onClick={() => addToast('Progress reset.', 'info')}
            >
              Note
            </button>
          </div>
        </section>

        <section className="sec" aria-labelledby="sp-offline">
          <div className="sec-h">
            <h2 id="sp-offline">Offline bar</h2>
            <p className="desc">When the visitor loses their internet connection.</p>
          </div>
          <div className="sp-row">
            <button
              type="button"
              className="btn"
              data-sp="offline"
              onClick={() => window.dispatchEvent(new Event('offline'))}
            >
              Go offline
            </button>
            <button
              type="button"
              className="btn"
              data-sp="online"
              onClick={() => window.dispatchEvent(new Event('online'))}
            >
              Back online
            </button>
          </div>
        </section>

        <section className="sec" aria-labelledby="sp-loading">
          <div className="sec-h">
            <h2 id="sp-loading">Loading screen</h2>
            <p className="desc">Shown for a moment while a page loads for the first time.</p>
          </div>
          <div className="sp-row">
            <button type="button" className="btn" data-sp="loader" onClick={() => setOverlay('loader')}>
              Light page
            </button>
            <button type="button" className="btn" data-sp="loader-ink" onClick={() => setOverlay('loader-ink')}>
              Dark page
            </button>
          </div>
        </section>

        <section className="sec" aria-labelledby="sp-errors">
          <div className="sec-h">
            <h2 id="sp-errors">Error screens</h2>
            <p className="desc">If a page fails to load, or the whole site fails.</p>
          </div>
          <div>
            <div className="sp-row">
              <button type="button" className="btn" data-sp="route-error" onClick={() => setRouteError((n) => n + 1)}>
                Page could not load
              </button>
              <button type="button" className="btn" data-sp="crash" onClick={() => setOverlay('crash')}>
                Whole site failed
              </button>
              <button type="button" className="btn" data-sp="update" onClick={() => setOverlay('update')}>
                Site was updated
              </button>
            </div>
            {routeError > 0 && (
              <div className="sp-slot" data-sp-slot="route-error">
                <RouteErrorBoundary key={routeError}>
                  <Thrower message="Preview of a page that could not load" />
                </RouteErrorBoundary>
              </div>
            )}
          </div>
        </section>

        <section className="sec" aria-labelledby="sp-more">
          <div className="sec-h">
            <h2 id="sp-more">Elsewhere</h2>
          </div>
          <ul className="sp-list">
            <li>
              <b>Loading bar.</b> The thin line at the very top while moving between pages:{' '}
              <Link to="/services">go to Services</Link>, then come back.
            </li>
            <li>
              <b>Skip link.</b> Reload any page and press Tab once.
            </li>

            <li>
              <b>Browser-tab icon.</b> Look at this tab.
            </li>
            <li>
              <b>Link previews.</b> <a href="/og/og-default.png">Default</a> · <a href="/og-contact.png">Contact</a> ·{' '}
              <a href="/og-careers.png">Careers</a> · <a href="/og-faq.png">FAQs</a> ·{' '}
              <a href="/og/income-tax-act-2025-in-force.png">An article</a>
            </li>
          </ul>
        </section>
      </div>

      {overlay &&
        createPortal(
          <div className="sp-overlay" data-sp-slot={overlay}>
            <button type="button" className="sp-close" onClick={() => setOverlay(null)}>
              Close preview
            </button>
            {overlay === 'loader' && <PageLoader tone="paper" />}
            {overlay === 'loader-ink' && <PageLoader tone="ink" />}
            {overlay === 'crash' && (
              <ErrorBoundary>
                <Thrower message="Preview of the whole site failing" />
              </ErrorBoundary>
            )}
            {overlay === 'update' && (
              <ErrorBoundary>
                <Thrower message="Failed to fetch dynamically imported module" />
              </ErrorBoundary>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SharedPreview;
