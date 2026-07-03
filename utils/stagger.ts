// MNT-5: shared stagger-delay helper. The idiom `Math.min(index * step, cap)`
// (used to cascade `Reveal` animations without letting late items lag too far)
// was copy-pasted across ~9 files. Defaults match the most common usage.
export const staggerDelay = (index: number, step = 0.06, cap = 0.3): number => Math.min(index * step, cap);
