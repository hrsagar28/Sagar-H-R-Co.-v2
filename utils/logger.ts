
// Helper to safely check dev mode
const isDev = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.DEV;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

const isDevelopment = isDev();

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any[];
}

const STORAGE_KEY = 'app_error_logs';
const MAX_LOGS = 50;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log to console for browser telemetry/devtools
    console.error(...args);

    // Persist to localStorage for production debugging
    try {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: String(args[0]) || 'Unknown Error',
            // Safe serialization of additional args
            data: args.slice(1).map(arg => {
                try {
                    if (arg instanceof Error) {
                        return { message: arg.message, stack: arg.stack };
                    }
                    if (typeof arg === 'object' && arg !== null) {
                        // Attempt to shallow clone readable props if possible, or just stringify
                        return JSON.parse(JSON.stringify(arg));
                    }
                    return String(arg);
                } catch {
                    return 'Unserializable data';
                }
            })
        };

        const existing = localStorage.getItem(STORAGE_KEY);
        let logs: LogEntry[] = existing ? JSON.parse(existing) : [];
        
        // Add new log to beginning
        logs.unshift(entry);
        
        // Trim to max logs
        if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
        // Fail silently if localStorage is full or blocked
        if (isDevelopment) console.warn('Failed to persist error log', e);
    }
  },
  // Stub for reporting to external monitoring service (Sentry, etc.)
  report: () => {
     const existing = localStorage.getItem(STORAGE_KEY);
     return existing ? JSON.parse(existing) : [];
  },
  getLogs: () => {
     const existing = localStorage.getItem(STORAGE_KEY);
     return existing ? JSON.parse(existing) : [];
  }
};
