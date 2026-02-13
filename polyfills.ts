import { Buffer } from 'buffer';

const StandardBuffer = Buffer;

// Standardize global instance early
(window as any).Buffer = StandardBuffer;
(globalThis as any).Buffer = StandardBuffer;

// Resilience Patch: Recognize minified or twin Buffer instances
const originalIsBuffer = StandardBuffer.isBuffer;
StandardBuffer.isBuffer = function (obj: any): obj is Buffer {
    return (
        originalIsBuffer(obj) ||
        (!!obj && (
            (obj as any)._isBuffer === true ||
            obj.constructor?.name === 'Buffer' ||
            obj.constructor?.name === 'u'
        ))
    );
};

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
