
// Note: Buffer and process are now mostly handled by vite-plugin-node-polyfills
// we only keep this file for process.nextTick which some old libs need.

// Polyfill process for libraries that expect it
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
