import { Buffer } from 'buffer';

(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

// Note: process and other polyfills are partialy handled by vite-plugin-node-polyfills
// but we keep process.nextTick for old libraries.
if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
        version: 'v16.0.0',
        nextTick: (fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0),
        env: {}
    };
} else {
    // Ensure version and nextTick exist even if process is partially defined
    const proc = (window as any).process;
    if (!proc.version) proc.version = 'v16.0.0';
    if (!proc.nextTick) proc.nextTick = (fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0);
}

export { };
