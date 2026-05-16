/**
 * Pool one IntersectionObserver per unique `rootMargin` configuration.
 *
 * Audit LZ-01: the home page mounts six `LazyHomeSection` instances, each
 * of which used to instantiate its own IntersectionObserver. That's six
 * observers competing for the same scroll callbacks. This helper folds
 * them onto a single observer per distinct rootMargin (currently two —
 * the default `'900px 0px'` and the tighter `'200px 0px'` ChaosToOrder
 * uses), and routes `intersect` events back to the per-element callback
 * via a Map lookup.
 *
 * The helper is callsite-compatible with the previous pattern:
 *
 *     useEffect(() => {
 *       if (!ref.current) return;
 *       return observeOnce(ref.current, rootMargin, () => setShouldRender(true));
 *     }, [rootMargin]);
 *
 * The returned `unobserve` is safe to call even after the callback has
 * fired — every callback also self-unsubscribes the moment it runs, so
 * each target stops being observed as soon as it intersects.
 */

/** Map of every active target → its consumer callback. */
const callbacks = new WeakMap<Element, () => void>();

/** One observer per unique rootMargin string. Keyed by the raw string
 *  so equivalent margins (`'900px 0px'` vs `'900px 0px 900px 0px'`)
 *  intentionally don't dedupe — they may differ in subtle ways. */
const observersByMargin = new Map<string, IntersectionObserver>();

const getObserver = (rootMargin: string): IntersectionObserver | null => {
  if (typeof IntersectionObserver === 'undefined') return null;

  const existing = observersByMargin.get(rootMargin);
  if (existing) return existing;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        if (!cb) continue;
        // Pull the callback off the map and stop observing BEFORE invoking
        // it: if `cb` triggers a re-render that unmounts the consumer, we
        // don't want a second event to call a stale callback.
        callbacks.delete(entry.target);
        observer.unobserve(entry.target);
        cb();
      }
    },
    { rootMargin },
  );
  observersByMargin.set(rootMargin, observer);
  return observer;
};

/**
 * Observe `element` and invoke `onIntersect` the first time it crosses
 * the rootMargin viewport boundary. Returns a cleanup function that
 * unsubscribes without firing the callback — call it from a React
 * effect's cleanup or when the consumer no longer needs the gate.
 *
 * If IntersectionObserver isn't available (very old browsers, SSR), the
 * callback fires synchronously so consumers don't render an indefinite
 * placeholder.
 */
export const observeOnce = (element: Element, rootMargin: string, onIntersect: () => void): (() => void) => {
  const observer = getObserver(rootMargin);
  if (!observer) {
    // No-IO fallback — render immediately. SSR / very old browsers.
    onIntersect();
    return () => {};
  }

  callbacks.set(element, onIntersect);
  observer.observe(element);

  return () => {
    callbacks.delete(element);
    observer.unobserve(element);
  };
};
