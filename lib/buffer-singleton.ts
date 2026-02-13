import { Buffer as BufferPackage } from '../node_modules/buffer/index.js';

// Garantir que o Buffer global seja o mesmo constructor
const globalAny = globalThis as any;
if (typeof globalAny.Buffer === 'undefined' || globalAny.Buffer !== BufferPackage) {
    globalAny.Buffer = BufferPackage;
}

if (typeof (window as any).Buffer === 'undefined' || (window as any).Buffer !== BufferPackage) {
    (window as any).Buffer = BufferPackage;
}

export const Buffer = BufferPackage;
export default Buffer;
