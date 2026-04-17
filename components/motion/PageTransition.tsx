import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const duration = reduced ? 0 : 0.45;
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
          className="contents"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
