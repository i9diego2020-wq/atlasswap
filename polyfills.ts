import { Buffer } from 'buffer';

// 1. Unify Buffer/Uint8Array globally
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

// 2. AGGRESSIVE CONSTRUCTOR PATCHING
// This forces .name to be 'Buffer' or 'Uint8Array' even when minified to 'u' or 'n'
try {
    if (typeof (Buffer as any) !== 'undefined') {
        Object.defineProperty(Buffer, 'name', { value: 'Buffer', configurable: true, writable: true });
    }
    if (typeof (Uint8Array as any) !== 'undefined') {
        Object.defineProperty(Uint8Array, 'name', { value: 'Uint8Array', configurable: true, writable: true });
    }
} catch (e) {
    console.warn('Could not force constructor names', e);
}

// 3. MAGIC PROTO-PATCH: The ultimate fix for "Expected Buffer, got u" in production.
if (typeof Uint8Array !== 'undefined') {
    (Uint8Array.prototype as any)._isBuffer = true;
    (Uint8Array.prototype as any).isBuffer = true;
}

// 4. Ensure Buffer.isBuffer itself is also resilient
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

// 5. Global Flagging to signal validation bypasses
(window as any)._liquid_validation_disabled = true;

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
