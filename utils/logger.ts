const LOG_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'app_error_logs';
const MAX_LOGS = 50;

const isDevelopment = import.meta.env?.DEV || process.env.NODE_ENV === 'development';

interface LogEntry {
  timestamp: string;
  level: 'error';
  message: string;
  data?: unknown[];
}

const isDebugPersistenceEnabled = () => {
  if (isDevelopment) return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
};

const redactError = (error: Error) => ({
  name: error.name,
  message: error.message,
});

const isFormLog = (args: unknown[]) =>
  args.some((arg) => {
    if (typeof arg === 'string') return /form|submission|contact|career/i.test(arg);
    if (arg && typeof arg === 'object') {
      try {
        return /form|submission|contact|career/i.test(JSON.stringify(arg));
      } catch {
        return false;
      }
    }
    return false;
  });

const serialize = (arg: unknown, omitStack: boolean): unknown => {
  if (arg instanceof Error) {
    return omitStack ? redactError(arg) : { name: arg.name, message: arg.message };
  }

  if (arg && typeof arg === 'object') {
    try {
      return JSON.parse(JSON.stringify(arg)) as unknown;
    } catch {
      return 'Unserializable data';
    }
  }

  return arg;
};

const getStoredLogs = (): LogEntry[] => {
  const existing = localStorage.getItem(STORAGE_KEY);
  const logs = existing ? (JSON.parse(existing) as LogEntry[]) : [];
  const cutoff = Date.now() - LOG_TTL_MS;
  return logs.filter((log) => new Date(log.timestamp).getTime() >= cutoff);
};

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);

    if (!isDebugPersistenceEnabled()) return;

    try {
      const omitStack = isFormLog(args);
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: String(args[0] || 'Unknown Error'),
        data: args.slice(1).map((arg) => serialize(arg, omitStack)),
      };

      const logs = [entry, ...getStoredLogs()].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      if (isDevelopment) console.warn('Failed to persist error log', error);
    }
  },
  report: () => getStoredLogs(),
  getLogs: () => getStoredLogs(),
};
