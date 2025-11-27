// Cast import.meta to any to resolve TypeScript error regarding missing 'env' property on ImportMeta
// Safely check if env exists before accessing DEV to prevent runtime errors
const env = (import.meta as any).env;
const isDevelopment = env && env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  },
};
