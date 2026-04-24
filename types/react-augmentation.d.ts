import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }

  interface ImgHTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}
