import { Buffer } from 'buffer';

// Force global Buffer to be a standard singleton
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

// MAGIC PROTO-PATCH: The ultimate fix for "Expected Buffer, got u" in production.
// This works because almost ALL Buffer versions check obj._isBuffer === true.
// Since Node Buffers inherit from Uint8Array in the browser, patching the primary
// prototype ensures that BOTH minified ('u') and twin Buffer instances pass the test.
if (typeof Uint8Array !== 'undefined') {
    (Uint8Array.prototype as any)._isBuffer = true;
}

// Ensure Buffer.isBuffer itself is also resilient
const originalIsBuffer = Buffer.isBuffer;
Buffer.isBuffer = function (obj: any): obj is Buffer {
    return (
        originalIsBuffer(obj) ||
        (!!obj && (
            (obj as any)._isBuffer === true ||
            (obj as any).isBuffer === true ||
            obj.constructor?.name === 'Buffer' ||
            obj.constructor?.name === 'Uint8Array' ||
            obj.constructor?.name === 'u' ||
            obj.constructor?.name === 'n'
        ))
    );
};

// Polyfill process early to satisfy older crypto libraries
if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
        version: 'v16.0.0',
        nextTick: (fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0),
        env: {}
    };
} else {
    const proc = (window as any).process;
    if (!proc.version) proc.version = 'v16.0.0';
    if (!proc.nextTick) proc.nextTick = (fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0);
}

export { };
