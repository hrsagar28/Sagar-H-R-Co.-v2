// React 19's bundled types (@types/react@19) declare `inert` on HTMLAttributes
// and `fetchPriority` on ImgHTMLAttributes / HTMLAttributes natively, so the
// augmentations that used to live here are now redundant. Keeping the file as
// an empty module avoids breaking any explicit tsconfig `files`/`include`
// reference; it can be deleted entirely once that reference (if any) is removed.
export {};
